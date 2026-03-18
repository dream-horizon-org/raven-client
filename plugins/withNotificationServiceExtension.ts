import {
  type ConfigPlugin,
  withDangerousMod,
  withXcodeProject,
} from '@expo/config-plugins';
import * as fs from 'fs';
import * as path from 'path';
import type {RavenNotificationServiceExtensionProps} from './types';

const NSE_TARGET_NAME = 'NotificationServiceExtension';

function generateNotificationServiceSwift(
  props: RavenNotificationServiceExtensionProps,
): string {
  const mediaUrlKey = props.mediaUrlKey ?? 'media_url';
  const mediaTypeKey = props.mediaTypeKey ?? 'media_type';
  const baseUrl = props.baseUrl ?? '';
  const eventsBaseUrl = props.eventsBaseUrl ?? '';
  const apiKey = props.apiKey ?? '';
  const enableLogging = props.enableLogging ?? false;

  return `import UserNotifications
import RavenIOSSDK

class NotificationServiceExtension: RavenNotificationServiceExtension {

    override init() {
        super.init()
        self.mediaUrlKey = "${mediaUrlKey}"
        self.mediaTypeKey = "${mediaTypeKey}"
        self.baseUrl = "${baseUrl}"
        self.eventsBaseUrl = "${eventsBaseUrl}"
        self.apiKey = "${apiKey}"
        self.retryConfig = RetryConfig.default
        self.enableLogging = ${enableLogging}
    }

    override func didReceive(
        _ request: UNNotificationRequest,
        withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void
    ) {
        super.didReceive(request, withContentHandler: contentHandler)
    }
}
`;
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
`;
}

/**
 * Write NotificationServiceExtension Swift and Info.plist files to disk.
 */
const withNSEFiles: ConfigPlugin<RavenNotificationServiceExtensionProps> = (
  config,
  props,
) => {
  return withDangerousMod(config, [
    'ios',
    (config) => {
      const nsePath = path.join(
        config.modRequest.platformProjectRoot,
        NSE_TARGET_NAME,
      );

      fs.mkdirSync(nsePath, {recursive: true});

      fs.writeFileSync(
        path.join(nsePath, 'NotificationService.swift'),
        generateNotificationServiceSwift(props),
      );

      fs.writeFileSync(
        path.join(nsePath, 'Info.plist'),
        generateNSEInfoPlist(),
      );

      return config;
    },
  ]);
};

/**
 * Add the NotificationServiceExtension target to the Xcode project,
 * configure build settings, and add source files.
 */
const withNSEXcodeTarget: ConfigPlugin<{
  bundleIdentifier?: string;
}> = (config, {bundleIdentifier}) => {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;
    const mainBundleId = config.ios?.bundleIdentifier ?? '';
    const nseBundleId =
      bundleIdentifier ?? `${mainBundleId}.${NSE_TARGET_NAME}`;

    if (project.pbxTargetByName(NSE_TARGET_NAME)) {
      return config;
    }

    const target = project.addTarget(
      NSE_TARGET_NAME,
      'app_extension',
      NSE_TARGET_NAME,
      nseBundleId,
    );

    // Create a PBX group and add files
    const groupKey = project.pbxCreateGroup(
      NSE_TARGET_NAME,
      NSE_TARGET_NAME,
    );

    const mainGroupId = project.getFirstProject().firstProject.mainGroup;
    project.addToPbxGroup(groupKey, mainGroupId);

    project.addSourceFile(
      `${NSE_TARGET_NAME}/NotificationService.swift`,
      {target: target.uuid},
      groupKey,
    );

    project.addFile(
      `${NSE_TARGET_NAME}/Info.plist`,
      groupKey,
    );

    // Configure build settings for all build configurations of this target
    const configurations = project.pbxXCBuildConfigurationSection();
    for (const key in configurations) {
      const buildConfig = configurations[key];
      if (typeof buildConfig !== 'string' && buildConfig.buildSettings) {
        const bs = buildConfig.buildSettings;
        if (bs.PRODUCT_BUNDLE_IDENTIFIER === `"${nseBundleId}"` ||
            bs.PRODUCT_BUNDLE_IDENTIFIER === nseBundleId) {
          bs.INFOPLIST_FILE = `${NSE_TARGET_NAME}/Info.plist`;
          bs.SWIFT_VERSION = '5.0';
          bs.TARGETED_DEVICE_FAMILY = '"1,2"';
          bs.CODE_SIGN_STYLE = 'Automatic';
          bs.CURRENT_PROJECT_VERSION = '1';
          bs.MARKETING_VERSION = '1.0';
          bs.GENERATE_INFOPLIST_FILE = 'NO';
        }
      }
    }

    // Establish the host-target relationship so CocoaPods recognises
    // the main app as the host for this app extension.
    const objects = project.hash.project.objects;
    const mainTarget = project.getFirstTarget();
    const nativeTargets = project.pbxNativeTargetSection();
    // getFirstTarget() returns { uuid, firstTarget } where firstTarget
    // IS the PBXNativeTarget object directly.
    const mainTargetUuid = mainTarget.uuid;
    const mainNativeTarget = mainTarget.firstTarget;

    // 1. PBXContainerItemProxy — links the extension to the project
    const proxyUuid = project.generateUuid();
    objects['PBXContainerItemProxy'] =
      objects['PBXContainerItemProxy'] ?? {};
    objects['PBXContainerItemProxy'][proxyUuid] = {
      isa: 'PBXContainerItemProxy',
      containerPortal: project.hash.project.rootObject,
      containerPortal_comment: project.hash.project.rootObject_comment,
      proxyType: 1,
      remoteGlobalIDString: target.uuid,
      remoteInfo: NSE_TARGET_NAME,
    };
    objects['PBXContainerItemProxy'][`${proxyUuid}_comment`] =
      'PBXContainerItemProxy';

    // 2. PBXTargetDependency — main app depends on the extension
    const depUuid = project.generateUuid();
    objects['PBXTargetDependency'] =
      objects['PBXTargetDependency'] ?? {};
    objects['PBXTargetDependency'][depUuid] = {
      isa: 'PBXTargetDependency',
      target: target.uuid,
      targetProxy: proxyUuid,
    };
    objects['PBXTargetDependency'][`${depUuid}_comment`] =
      'PBXTargetDependency';

    mainNativeTarget.dependencies = mainNativeTarget.dependencies ?? [];
    mainNativeTarget.dependencies.push({
      value: depUuid,
      comment: 'PBXTargetDependency',
    });

    // 3. "Embed Foundation Extensions" build phase (PBXCopyFilesBuildPhase)
    //    dstSubfolderSpec 13 = PlugIns & Foundation Extensions
    const nseProductRef = nativeTargets[target.uuid]?.productReference;

    const embedBuildFileUuid = project.generateUuid();
    objects['PBXBuildFile'][embedBuildFileUuid] = {
      isa: 'PBXBuildFile',
      fileRef: nseProductRef,
      settings: {ATTRIBUTES: ['RemoveHeadersOnCopy']},
    };
    objects['PBXBuildFile'][`${embedBuildFileUuid}_comment`] =
      `${NSE_TARGET_NAME}.appex in Embed Foundation Extensions`;

    const copyPhaseUuid = project.generateUuid();
    objects['PBXCopyFilesBuildPhase'] =
      objects['PBXCopyFilesBuildPhase'] ?? {};
    objects['PBXCopyFilesBuildPhase'][copyPhaseUuid] = {
      isa: 'PBXCopyFilesBuildPhase',
      buildActionMask: 2147483647,
      dstPath: '""',
      dstSubfolderSpec: 13,
      files: [
        {
          value: embedBuildFileUuid,
          comment: `${NSE_TARGET_NAME}.appex in Embed Foundation Extensions`,
        },
      ],
      name: '"Embed Foundation Extensions"',
      runOnlyForDeploymentPostprocessing: 0,
    };
    objects['PBXCopyFilesBuildPhase'][`${copyPhaseUuid}_comment`] =
      'Embed Foundation Extensions';

    mainNativeTarget.buildPhases.push({
      value: copyPhaseUuid,
      comment: 'Embed Foundation Extensions',
    });

    return config;
  });
};

/**
 * Composes the file-creation and Xcode target mods.
 */
const withNotificationServiceExtension: ConfigPlugin<
  RavenNotificationServiceExtensionProps
> = (config, props) => {
  config = withNSEFiles(config, props);
  config = withNSEXcodeTarget(config, {
    bundleIdentifier: props.bundleIdentifier,
  });
  return config;
};

export default withNotificationServiceExtension;
