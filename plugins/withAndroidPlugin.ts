import {
  type ConfigPlugin,
  withProjectBuildGradle,
  withAppBuildGradle,
  withAndroidManifest,
  withGradleProperties,
} from '@expo/config-plugins'
import {mergeContents} from '@expo/config-plugins/build/utils/generateCode'
import type {RavenAndroidProps} from './types'

/** Default Maven version for `com.google.gms:google-services` classpath. */
const DEFAULT_GOOGLE_SERVICES_CLASSPATH_VERSION = '4.4.4'

/** Default FCM `android:name` for the messaging service (Raven / ds-comms Android SDK). */
const DEFAULT_FCM_MESSAGING_SERVICE_CLASS =
  'com.ds.horizon.comms.platform.fcm.DsCommsFcmService'

type GradleLanguage = 'groovy' | 'kotlin'

function assertSupportedGradleLanguage(
  language: string,
  fileLabel: string,
): asserts language is GradleLanguage {
  if (language !== 'groovy' && language !== 'kotlin') {
    throw new Error(
      `Raven plugin: Unsupported Gradle DSL for ${fileLabel} (language="${language}"). ` +
        'Supported: groovy (.gradle) and kotlin (.gradle.kts).',
    )
  }
}

/** Classpath line for com.google.gms:google-services (valid in Groovy and Kotlin DSL). */
function googleServicesClasspathLine(version: string): string {
  return `        classpath("com.google.gms:google-services:${version}")`
}

/**
 * Matches RN / Expo classpath for the react-native-gradle-plugin
 * (Groovy or Kotlin DSL, single or double quotes).
 */
const REACT_NATIVE_GRADLE_PLUGIN_CLASSPATH =
  /classpath\([^)]*react-native-gradle-plugin[^)]*\)/

/**
 * Maven repo block for GitHub Packages (valid in Groovy and Kotlin DSL Gradle scripts).
 */
function mavenRepoBlockGroovyStyle(repoUrl: string): string {
  return [
    `        maven {`,
    `            url = uri(project.findProperty("GITHUB_PACKAGES_REPO_URL") ?: "${repoUrl}")`,
    `            credentials {`,
    `                username = project.findProperty("GITHUB_USERNAME") ?: System.getenv("GITHUB_USERNAME") ?: ""`,
    `                password = project.findProperty("GITHUB_TOKEN") ?: System.getenv("GITHUB_TOKEN") ?: ""`,
    `            }`,
    `        }`,
  ].join('\n')
}

function mavenRepoBlockKotlinStyle(repoUrl: string): string {
  return [
    `        maven {`,
    `            url = uri((project.findProperty("GITHUB_PACKAGES_REPO_URL") as String?) ?: "${repoUrl}")`,
    `            credentials {`,
    `                username = (project.findProperty("GITHUB_USERNAME") as String?) ?: System.getenv("GITHUB_USERNAME") ?: ""`,
    `                password = (project.findProperty("GITHUB_TOKEN") as String?) ?: System.getenv("GITHUB_TOKEN") ?: ""`,
    `            }`,
    `        }`,
  ].join('\n')
}

function insertRavenMavenRepo(
  contents: string,
  repoUrl: string,
  language: GradleLanguage,
): string {
  if (contents.includes('raven-maven-repo')) {
    return contents
  }

  const mavenBlock =
    language === 'kotlin'
      ? mavenRepoBlockKotlinStyle(repoUrl)
      : mavenRepoBlockGroovyStyle(repoUrl)

  const allprojectsMatch = contents.match(
    /allprojects\s*\{[\s\S]*?repositories\s*\{/,
  )
  if (allprojectsMatch) {
    const insertPos =
      contents.indexOf(allprojectsMatch[0]) + allprojectsMatch[0].length
    return (
      contents.slice(0, insertPos) +
      '\n// @generated begin raven-maven-repo - expo prebuild (DO NOT MODIFY)\n' +
      mavenBlock +
      '\n// @generated end raven-maven-repo\n' +
      contents.slice(insertPos)
    )
  }

  return mergeContents({
    tag: 'raven-maven-repo',
    src: contents,
    newSrc: mavenBlock,
    anchor: /mavenCentral\(\)/,
    offset: 1,
    comment: '//',
  }).contents
}

function patchProjectBuildGradleContents(
  contents: string,
  language: GradleLanguage,
  githubMavenRepoUrl: string | undefined,
  googleServicesClasspathVersion: string,
): string {
  let next = contents

  if (!next.includes('com.google.gms:google-services')) {
    next = mergeContents({
      tag: 'raven-google-services-classpath',
      src: next,
      newSrc: googleServicesClasspathLine(googleServicesClasspathVersion),
      anchor: REACT_NATIVE_GRADLE_PLUGIN_CLASSPATH,
      offset: 1,
      comment: '//',
    }).contents
  }

  const repoUrl =
    githubMavenRepoUrl ??
    'https://maven.pkg.github.com/dream11/ds-comms-android-sdk'

  return insertRavenMavenRepo(next, repoUrl, language)
}

/**
 * Steps 6 + 8: Add GitHub Maven repository and Google Services classpath
 * to android/build.gradle or build.gradle.kts
 */
const withRavenProjectBuildGradle: ConfigPlugin<{
  githubMavenRepoUrl?: string
  googleServicesClasspathVersion?: string
}> = (config, {githubMavenRepoUrl, googleServicesClasspathVersion}) => {
  const gmsVersion =
    googleServicesClasspathVersion ?? DEFAULT_GOOGLE_SERVICES_CLASSPATH_VERSION

  return withProjectBuildGradle(config, (gradleConfig) => {
    const language = gradleConfig.modResults.language
    assertSupportedGradleLanguage(language, 'android/build.gradle')

    gradleConfig.modResults.contents = patchProjectBuildGradleContents(
      gradleConfig.modResults.contents,
      language,
      githubMavenRepoUrl,
      gmsVersion,
    )
    return gradleConfig
  })
}

function patchAppBuildGradleForGoogleServices(
  contents: string,
  language: GradleLanguage,
): string {
  if (contents.includes('com.google.gms.google-services')) {
    return contents
  }

  if (language === 'groovy') {
    return mergeContents({
      tag: 'raven-google-services-plugin',
      src: contents,
      newSrc: 'apply plugin: "com.google.gms.google-services"',
      anchor: /apply plugin.*com\.android\.application/,
      offset: 1,
      comment: '//',
    }).contents
  }

  // Kotlin DSL: plugins { id("com.android.application") ... }
  if (/id\("com\.google\.gms\.google-services"\)/.test(contents)) {
    return contents
  }

  if (/id\("com\.android\.application"\)/.test(contents)) {
    return mergeContents({
      tag: 'raven-google-services-plugin-kts',
      src: contents,
      newSrc: '    id("com.google.gms.google-services")',
      anchor: /id\("com\.android\.application"\)/,
      offset: 1,
      comment: '//',
    }).contents
  }

  // Fallback: first line inside plugins { ... }
  if (/plugins\s*\{/.test(contents)) {
    return mergeContents({
      tag: 'raven-google-services-plugin-kts-fallback',
      src: contents,
      newSrc: '    id("com.google.gms.google-services")\n',
      anchor: /plugins\s*\{/,
      offset: 1,
      comment: '//',
    }).contents
  }

  throw new Error(
    'Raven plugin: Could not apply com.google.gms.google-services in app build.gradle.kts. ' +
      'Expected a plugins { } block with id("com.android.application") or plugins {.',
  )
}

/**
 * Step 9: Apply the Google Services plugin in android/app/build.gradle(.kts)
 */
const withGoogleServicesPlugin: ConfigPlugin = (config) => {
  return withAppBuildGradle(config, (gradleConfig) => {
    const language = gradleConfig.modResults.language
    assertSupportedGradleLanguage(language, 'android/app/build.gradle')

    gradleConfig.modResults.contents = patchAppBuildGradleForGoogleServices(
      gradleConfig.modResults.contents,
      language,
    )

    return gradleConfig
  })
}

/**
 * Steps 10 + 11 + 12: Add POST_NOTIFICATIONS permission, Firebase Messaging Service,
 * and optionally enable cleartext traffic in AndroidManifest.xml
 */
const withRavenAndroidManifest: ConfigPlugin<{
  enableCleartextTraffic?: boolean
  fcmMessagingServiceClass?: string
}> = (
  config,
  {
    enableCleartextTraffic = false,
    fcmMessagingServiceClass: fcmMessagingServiceClassProp,
  },
) => {
  const fcmMessagingServiceClass =
    fcmMessagingServiceClassProp ?? DEFAULT_FCM_MESSAGING_SERVICE_CLASS

  return withAndroidManifest(config, (manifestConfig) => {
    const manifest = manifestConfig.modResults

    // Step 10: POST_NOTIFICATIONS permission
    const permissions = manifest.manifest['uses-permission'] ?? []
    const hasPostNotifications = permissions.some(
      (p) => p.$?.['android:name'] === 'android.permission.POST_NOTIFICATIONS',
    )
    if (!hasPostNotifications) {
      permissions.push({
        $: {'android:name': 'android.permission.POST_NOTIFICATIONS'},
      })
      manifest.manifest['uses-permission'] = permissions
    }

    // Step 11: Cleartext traffic for dev HTTP backends
    if (enableCleartextTraffic) {
      const application = manifest.manifest.application?.[0]
      if (application) {
        application.$['android:usesCleartextTraffic'] = 'true'
      }
    }

    // Step 12: Add Firebase Messaging Service for push notifications
    const application = manifest.manifest.application?.[0]
    if (application) {
      const services = application.service ?? []
      const hasMessagingService = services.some(
        (s) => s.$?.['android:name'] === fcmMessagingServiceClass,
      )

      if (!hasMessagingService) {
        services.push({
          $: {
            'android:name': fcmMessagingServiceClass,
            'android:exported': 'false',
          },
          'intent-filter': [
            {
              action: [
                {
                  $: {
                    'android:name': 'com.google.firebase.MESSAGING_EVENT',
                  },
                },
              ],
            },
          ],
        })
        application.service = services
      }
    }

    return manifestConfig
  })
}

/**
 * Step 7: Add GitHub credential placeholders to gradle.properties
 */
const withRavenGradleProperties: ConfigPlugin = (config) => {
  return withGradleProperties(config, (gradlePropsConfig) => {
    const props = gradlePropsConfig.modResults

    const hasRavenComment = props.some(
      (p) =>
        p.type === 'comment' &&
        typeof p.value === 'string' &&
        p.value.includes('Raven Android SDK'),
    )

    if (!hasRavenComment) {
      props.push(
        {
          type: 'comment',
          value: ' GitHub Packages auth for Raven Android SDK',
        } as any,
        {
          type: 'comment',
          value:
            ' Set via env vars GITHUB_USERNAME / GITHUB_TOKEN, or uncomment below:',
        } as any,
        {
          type: 'comment',
          value: ' GITHUB_USERNAME=your-github-username',
        } as any,
        {
          type: 'comment',
          value: ' GITHUB_TOKEN=your-personal-access-token',
        } as any,
      )
    }

    return gradlePropsConfig
  })
}

const withRavenAndroid: ConfigPlugin<RavenAndroidProps> = (
  config,
  props = {},
) => {
  config = withRavenProjectBuildGradle(config, {
    githubMavenRepoUrl: props.githubMavenRepoUrl,
    googleServicesClasspathVersion: props.googleServicesClasspathVersion,
  })
  config = withGoogleServicesPlugin(config)
  config = withRavenAndroidManifest(config, {
    enableCleartextTraffic: props.enableCleartextTraffic,
    fcmMessagingServiceClass: props.fcmMessagingServiceClass,
  })
  config = withRavenGradleProperties(config)
  return config
}

export default withRavenAndroid
