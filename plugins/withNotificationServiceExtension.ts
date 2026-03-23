import {
  type ConfigPlugin,
  withDangerousMod,
  withXcodeProject,
} from '@expo/config-plugins'
import * as fs from 'fs'
import * as path from 'path'
import type {RavenNotificationServiceExtensionProps} from './types'

const NSE_TARGET_NAME = 'NotificationServiceExtension'

/** dstSubfolderSpec 13 = PlugIns / embed app extensions */
const EMBED_EXTENSIONS_DST = 13

type PbxNativeTargetish = {
  buildPhases?: Array<{value: string; comment?: string}>
  dependencies?: Array<{value: string; comment?: string}>
}

type PbxObjectsRoot = Record<string, Record<string, unknown>>

/** node-xcode `XcodeProject` pieces we use that are incomplete in `@types/xcode`. */
type XcodeProjectExtras = {
  hash: {project: {objects: PbxObjectsRoot}}
  addBuildPhase: (
    filePathsArray: string[],
    buildPhaseType: string,
    comment: string,
    targetUuid: string,
    ...rest: unknown[]
  ) => unknown
  findTargetKey: (name: string) => string | null
}

/**
 * `addTarget(..., 'app_extension')` creates a native target with `buildPhases: []`.
 * Without a PBXSourcesBuildPhase on that target, `addSourceFile({target})` cannot
 * resolve "Sources" and incorrectly adds the file to the first app target's Sources.
 */
function ensureAppExtensionHasSourcesAndFrameworksPhases(
  project: XcodeProjectExtras,
  extensionTargetUuid: string,
): void {
  const nativeTargets = project.hash.project.objects
    .PBXNativeTarget as Record<string, PbxNativeTargetish | string>
  const nt = nativeTargets[extensionTargetUuid] as PbxNativeTargetish | undefined
  if (!nt?.buildPhases?.length) {
    project.addBuildPhase(
      [],
      'PBXSourcesBuildPhase',
      'Sources',
      extensionTargetUuid,
    )
    project.addBuildPhase(
      [],
      'PBXFrameworksBuildPhase',
      'Frameworks',
      extensionTargetUuid,
    )
    return
  }
  const hasSources = nt.buildPhases.some((p) => p.comment === 'Sources')
  const hasFrameworks = nt.buildPhases.some((p) => p.comment === 'Frameworks')
  if (!hasSources) {
    project.addBuildPhase(
      [],
      'PBXSourcesBuildPhase',
      'Sources',
      extensionTargetUuid,
    )
  }
  if (!hasFrameworks) {
    project.addBuildPhase(
      [],
      'PBXFrameworksBuildPhase',
      'Frameworks',
      extensionTargetUuid,
    )
  }
}

function trimPbxQuotes(s: string): string {
  return s.replace(/^"(.*)"$/, '$1')
}

/**
 * Repair older prebuilds where NotificationService.swift was compiled in the host app
 * instead of the NSE (see ensureAppExtensionHasSourcesAndFrameworksPhases).
 */
function moveNseSwiftFromHostAppToExtension(
  project: XcodeProjectExtras,
  mainTargetUuid: string,
  nseTargetUuid: string,
): void {
  const objects = project.hash.project.objects
  const fileRefs = objects.PBXFileReference as
    | Record<string, {path?: string; name?: string} | string>
    | undefined
  const buildFiles = objects.PBXBuildFile as
    | Record<string, {fileRef?: string; isa?: string} | string>
    | undefined
  const sourcesPhases = objects.PBXSourcesBuildPhase as
    | Record<
        string,
        {isa?: string; files?: Array<{value: string; comment?: string}>}
      >
    | undefined
  const nativeTargets = objects.PBXNativeTarget as
    | Record<string, PbxNativeTargetish | string>
    | undefined

  if (!fileRefs || !buildFiles || !sourcesPhases || !nativeTargets) return

  let notificationServiceFileRef: string | null = null
  for (const key of Object.keys(fileRefs)) {
    if (key.endsWith('_comment')) continue
    const ref = fileRefs[key]
    if (typeof ref === 'string' || !ref || typeof ref !== 'object') continue
    const path = ref.path ? trimPbxQuotes(String(ref.path)) : ''
    const name = ref.name ? trimPbxQuotes(String(ref.name)) : ''
    if (
      path.endsWith('NotificationService.swift') ||
      name === 'NotificationService.swift'
    ) {
      notificationServiceFileRef = key
      break
    }
  }
  if (!notificationServiceFileRef) return

  let swiftInSourcesBuildFileUuid: string | null = null
  for (const key of Object.keys(buildFiles)) {
    if (key.endsWith('_comment')) continue
    const bf = buildFiles[key]
    if (typeof bf === 'string' || !bf || bf.isa !== 'PBXBuildFile') continue
    if (bf.fileRef !== notificationServiceFileRef) continue
    const c = buildFiles[`${key}_comment`]
    if (typeof c === 'string' && c.includes('NotificationService.swift in Sources')) {
      swiftInSourcesBuildFileUuid = key
      break
    }
  }
  if (!swiftInSourcesBuildFileUuid) return

  const mainNt = nativeTargets[mainTargetUuid] as PbxNativeTargetish | undefined
  const nseNt = nativeTargets[nseTargetUuid] as PbxNativeTargetish | undefined
  if (!mainNt?.buildPhases || !nseNt?.buildPhases) return

  ensureAppExtensionHasSourcesAndFrameworksPhases(project, nseTargetUuid)

  const mainSourcesUuid = mainNt.buildPhases.find((p) => p.comment === 'Sources')
    ?.value
  const nseSourcesUuid = (
    nativeTargets[nseTargetUuid] as PbxNativeTargetish
  ).buildPhases?.find((p) => p.comment === 'Sources')?.value

  if (!mainSourcesUuid || !nseSourcesUuid) return

  const mainPhase = sourcesPhases[mainSourcesUuid] as
    | {files?: Array<{value: string; comment?: string}>}
    | undefined
  const nsePhase = sourcesPhases[nseSourcesUuid] as
    | {files?: Array<{value: string; comment?: string}>}
    | undefined
  if (!mainPhase?.files || !nsePhase) return

  const inMain = mainPhase.files.some((f) => f.value === swiftInSourcesBuildFileUuid)
  if (!inMain) return

  mainPhase.files = mainPhase.files.filter(
    (f) => f.value !== swiftInSourcesBuildFileUuid,
  )

  const comment =
    (buildFiles[`${swiftInSourcesBuildFileUuid}_comment`] as string) ||
    'NotificationService.swift in Sources'
  if (!nsePhase.files) nsePhase.files = []
  if (!nsePhase.files.some((f) => f.value === swiftInSourcesBuildFileUuid)) {
    nsePhase.files.push({
      value: swiftInSourcesBuildFileUuid,
      comment,
    })
  }
}

/**
 * Xcode fails with "Unexpected duplicate tasks" if the main app embeds the same
 * .appex twice (e.g. Expo adds "Copy Files" and we add "Embed Foundation Extensions").
 */
function dedupeNseEmbedCopyPhases(
  project: {hash: {project: {objects: PbxObjectsRoot}}},
  mainNativeTarget: PbxNativeTargetish,
  nseProductRef: string,
): void {
  const objects = project.hash.project.objects
  const copySections = objects.PBXCopyFilesBuildPhase
  const buildFiles = objects.PBXBuildFile
  const phases = mainNativeTarget.buildPhases
  if (!copySections || !buildFiles || !phases?.length) return

  const matching: Array<{uuid: string; displayName: string}> = []

  for (const bp of phases) {
    const uuid = bp.value
    const phase = copySections[uuid] as
      | {
          isa?: string
          dstSubfolderSpec?: number | string
          files?: Array<{value: string}>
          name?: string
        }
      | undefined
    if (!phase || phase.isa !== 'PBXCopyFilesBuildPhase') continue
    if (Number(phase.dstSubfolderSpec) !== EMBED_EXTENSIONS_DST) continue

    const embedsNse = (phase.files ?? []).some((f) => {
      const bf = buildFiles[f.value] as {fileRef?: string} | undefined
      return bf?.fileRef === nseProductRef
    })
    if (!embedsNse) continue

    const raw = phase.name ?? ''
    const displayName =
      typeof raw === 'string' ? raw.replace(/^"(.*)"$/, '$1') : String(raw)
    matching.push({uuid, displayName})
  }

  if (matching.length <= 1) return

  const keep =
    matching.find((m) =>
      m.displayName.includes('Embed Foundation Extensions'),
    ) ?? matching[0]

  for (const {uuid} of matching) {
    if (uuid === keep.uuid) continue

    const phase = copySections[uuid] as {files?: Array<{value: string}>}
    for (const f of phase.files ?? []) {
      const bfUuid = f.value
      delete buildFiles[bfUuid]
      delete buildFiles[`${bfUuid}_comment`]
    }
    delete copySections[uuid]
    delete copySections[`${uuid}_comment`]

    const idx = phases.findIndex((p) => p.value === uuid)
    if (idx !== -1) phases.splice(idx, 1)
  }
}

/**
 * Minimal NSE subclass. RavenIOSSDK's `RavenNotificationServiceExtension` is
 * configured by the SDK / host app — do not assign URLs or keys in `init()`.
 * @see raven-client/example/ios/NotificationServiceExtension/NotificationService.swift
 */
function generateNotificationServiceSwift(): string {
  return `import UserNotifications
import RavenIOSSDK

class NotificationServiceExtension: RavenNotificationServiceExtension {

    override init() {
        super.init()
    }

    override func didReceive(
        _ request: UNNotificationRequest,
        withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void
    ) {
        super.didReceive(request, withContentHandler: contentHandler)
    }
}
`
}

function generateNSEInfoPlist(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>CFBundleExecutable</key>
\t<string>$(EXECUTABLE_NAME)</string>
\t<key>CFBundleIdentifier</key>
\t<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
\t<key>CFBundleName</key>
\t<string>$(PRODUCT_NAME)</string>
\t<key>CFBundlePackageType</key>
\t<string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
\t<key>CFBundleShortVersionString</key>
\t<string>$(MARKETING_VERSION)</string>
\t<key>CFBundleVersion</key>
\t<string>$(CURRENT_PROJECT_VERSION)</string>
\t<key>NSExtension</key>
\t<dict>
\t\t<key>NSExtensionPointIdentifier</key>
\t\t<string>com.apple.usernotifications.service</string>
\t\t<key>NSExtensionPrincipalClass</key>
\t\t<string>$(PRODUCT_MODULE_NAME).NotificationServiceExtension</string>
\t</dict>
</dict>
</plist>
`
}

/**
 * Write NotificationServiceExtension Swift and Info.plist files to disk.
 */
const withNSEFiles: ConfigPlugin<RavenNotificationServiceExtensionProps> = (
  config,
  _props,
) => {
  return withDangerousMod(config, [
    'ios',
    (dangerousModConfig) => {
      const nsePath = path.join(
        dangerousModConfig.modRequest.platformProjectRoot,
        NSE_TARGET_NAME,
      )

      fs.mkdirSync(nsePath, {recursive: true})

      fs.writeFileSync(
        path.join(nsePath, 'NotificationService.swift'),
        generateNotificationServiceSwift(),
      )

      fs.writeFileSync(path.join(nsePath, 'Info.plist'), generateNSEInfoPlist())

      return dangerousModConfig
    },
  ])
}

/**
 * Add the NotificationServiceExtension target to the Xcode project,
 * configure build settings, and add source files.
 */
const withNSEXcodeTarget: ConfigPlugin<{
  bundleIdentifier?: string
}> = (config, {bundleIdentifier}) => {
  return withXcodeProject(config, (xcodeConfig) => {
    const project = xcodeConfig.modResults
    const p = project as unknown as XcodeProjectExtras
    const mainBundleId = xcodeConfig.ios?.bundleIdentifier ?? ''
    const nseBundleId = bundleIdentifier ?? `${mainBundleId}.${NSE_TARGET_NAME}`

    const nativeTargetsEarly = project.pbxNativeTargetSection()
    const mainNativeEarly = project.getFirstTarget()
      .firstTarget as PbxNativeTargetish
    const mainTargetUuidEarly = project.getFirstTarget().uuid
    const nseTargetUuidEarly = p.findTargetKey(NSE_TARGET_NAME)
    if (nseTargetUuidEarly && mainTargetUuidEarly) {
      moveNseSwiftFromHostAppToExtension(
        p,
        mainTargetUuidEarly,
        nseTargetUuidEarly,
      )
    }

    const existingNse = project.pbxTargetByName(NSE_TARGET_NAME)
    if (existingNse) {
      const refEarly = nseTargetUuidEarly
        ? (nativeTargetsEarly[nseTargetUuidEarly] as {productReference?: string})
            ?.productReference
        : undefined
      if (refEarly) {
        dedupeNseEmbedCopyPhases(project, mainNativeEarly, refEarly)
      }
      return xcodeConfig
    }

    const target = project.addTarget(
      NSE_TARGET_NAME,
      'app_extension',
      NSE_TARGET_NAME,
      nseBundleId,
    )

    ensureAppExtensionHasSourcesAndFrameworksPhases(p, target.uuid)

    // Create a PBX group and add files
    const groupKey = project.pbxCreateGroup(NSE_TARGET_NAME, NSE_TARGET_NAME)

    const mainGroupId = project.getFirstProject().firstProject.mainGroup
    project.addToPbxGroup(groupKey, mainGroupId)

    // Paths are relative to the group (path = NotificationServiceExtension), not the repo root.
    project.addSourceFile(
      'NotificationService.swift',
      {target: target.uuid},
      groupKey,
    )

    project.addFile('Info.plist', groupKey)

    // Configure build settings for all build configurations of this target
    const configurations = project.pbxXCBuildConfigurationSection()
    for (const key in configurations) {
      const buildConfig = configurations[key]
      if (typeof buildConfig !== 'string' && buildConfig.buildSettings) {
        const bs = buildConfig.buildSettings
        if (
          bs.PRODUCT_BUNDLE_IDENTIFIER === `"${nseBundleId}"` ||
          bs.PRODUCT_BUNDLE_IDENTIFIER === nseBundleId
        ) {
          bs.INFOPLIST_FILE = `${NSE_TARGET_NAME}/Info.plist`
          bs.SWIFT_VERSION = '5.0'
          bs.TARGETED_DEVICE_FAMILY = '"1,2"'
          bs.CODE_SIGN_STYLE = 'Automatic'
          bs.CURRENT_PROJECT_VERSION = '1'
          bs.MARKETING_VERSION = '1.0'
          bs.GENERATE_INFOPLIST_FILE = 'NO'
        }
      }
    }

    // Establish the host-target relationship so CocoaPods recognises
    // the main app as the host for this app extension.
    const objects = project.hash.project.objects
    const mainTarget = project.getFirstTarget()
    const nativeTargets = project.pbxNativeTargetSection()
    // getFirstTarget() returns { uuid, firstTarget } where firstTarget
    // IS the PBXNativeTarget object directly.
    const mainNativeTarget = mainTarget.firstTarget as PbxNativeTargetish

    // 1. PBXContainerItemProxy — links the extension to the project
    const proxyUuid = project.generateUuid()
    objects.PBXContainerItemProxy = objects.PBXContainerItemProxy ?? {}
    objects.PBXContainerItemProxy[proxyUuid] = {
      isa: 'PBXContainerItemProxy',
      containerPortal: project.hash.project.rootObject,
      containerPortal_comment: project.hash.project.rootObject_comment,
      proxyType: 1,
      remoteGlobalIDString: target.uuid,
      remoteInfo: NSE_TARGET_NAME,
    }
    objects.PBXContainerItemProxy[`${proxyUuid}_comment`] =
      'PBXContainerItemProxy'

    // 2. PBXTargetDependency — main app depends on the extension
    const depUuid = project.generateUuid()
    objects.PBXTargetDependency = objects.PBXTargetDependency ?? {}
    objects.PBXTargetDependency[depUuid] = {
      isa: 'PBXTargetDependency',
      target: target.uuid,
      targetProxy: proxyUuid,
    }
    objects.PBXTargetDependency[`${depUuid}_comment`] = 'PBXTargetDependency'

    mainNativeTarget.dependencies = mainNativeTarget.dependencies ?? []
    mainNativeTarget.dependencies.push({
      value: depUuid,
      comment: 'PBXTargetDependency',
    })

    // 3. "Embed Foundation Extensions" build phase (PBXCopyFilesBuildPhase)
    //    dstSubfolderSpec 13 = PlugIns & Foundation Extensions
    const nseProductRef = nativeTargets[target.uuid]?.productReference

    const embedBuildFileUuid = project.generateUuid()
    objects.PBXBuildFile[embedBuildFileUuid] = {
      isa: 'PBXBuildFile',
      fileRef: nseProductRef,
      settings: {ATTRIBUTES: ['RemoveHeadersOnCopy']},
    }
    objects.PBXBuildFile[`${embedBuildFileUuid}_comment`] =
      `${NSE_TARGET_NAME}.appex in Embed Foundation Extensions`

    const copyPhaseUuid = project.generateUuid()
    objects.PBXCopyFilesBuildPhase = objects.PBXCopyFilesBuildPhase ?? {}
    objects.PBXCopyFilesBuildPhase[copyPhaseUuid] = {
      isa: 'PBXCopyFilesBuildPhase',
      buildActionMask: 2147483647,
      dstPath: '""',
      dstSubfolderSpec: EMBED_EXTENSIONS_DST,
      files: [
        {
          value: embedBuildFileUuid,
          comment: `${NSE_TARGET_NAME}.appex in Embed Foundation Extensions`,
        },
      ],
      name: '"Embed Foundation Extensions"',
      runOnlyForDeploymentPostprocessing: 0,
    }
    objects.PBXCopyFilesBuildPhase[`${copyPhaseUuid}_comment`] =
      'Embed Foundation Extensions'

    mainNativeTarget.buildPhases.push({
      value: copyPhaseUuid,
      comment: 'Embed Foundation Extensions',
    })

    if (nseProductRef) {
      dedupeNseEmbedCopyPhases(project, mainNativeTarget, nseProductRef)
    }

    return xcodeConfig
  })
}

/**
 * Composes the file-creation and Xcode target mods.
 */
const withNotificationServiceExtension: ConfigPlugin<
  RavenNotificationServiceExtensionProps
> = (config, props) => {
  config = withNSEFiles(config, props)
  config = withNSEXcodeTarget(config, {
    bundleIdentifier: props.bundleIdentifier,
  })
  return config
}

export default withNotificationServiceExtension
