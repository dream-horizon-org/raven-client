import {
  type ConfigPlugin,
  withProjectBuildGradle,
  withAppBuildGradle,
  withAndroidManifest,
  withGradleProperties,
} from '@expo/config-plugins';
import {mergeContents} from '@expo/config-plugins/build/utils/generateCode';
import type {RavenAndroidProps} from './types';

/**
 * Steps 6 + 8: Add GitHub Maven repository and Google Services classpath
 * to android/build.gradle
 */
const withRavenProjectBuildGradle: ConfigPlugin<{
  githubMavenRepoUrl?: string;
}> = (config, {githubMavenRepoUrl}) => {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      throw new Error(
        'Raven plugin: Expected android/build.gradle to be Groovy (found Kotlin DSL). ' +
          'Kotlin DSL build files are not yet supported.',
      );
    }

    let contents = config.modResults.contents;

    // Step 8: Add Google Services classpath in buildscript.dependencies
    if (!contents.includes('com.google.gms:google-services')) {
      contents = mergeContents({
        tag: 'raven-google-services-classpath',
        src: contents,
        newSrc:
          '        classpath("com.google.gms:google-services:4.4.4")',
        anchor: /classpath\(.*react-native-gradle-plugin.*\)/,
        offset: 1,
        comment: '//',
      }).contents;
    }

    // Step 6: Add GitHub Maven repository in allprojects.repositories
    const repoUrl =
      githubMavenRepoUrl ??
      'https://maven.pkg.github.com/dream11/ds-comms-android-sdk';

    if (!contents.includes('raven-maven-repo')) {
      const mavenBlock = [
        `        maven {`,
        `            url = uri(project.findProperty("GITHUB_PACKAGES_REPO_URL") ?: "${repoUrl}")`,
        `            credentials {`,
        `                username = project.findProperty("GITHUB_USERNAME") ?: System.getenv("GITHUB_USERNAME") ?: ""`,
        `                password = project.findProperty("GITHUB_TOKEN") ?: System.getenv("GITHUB_TOKEN") ?: ""`,
        `            }`,
        `        }`,
      ].join('\n');

      // Try allprojects.repositories first; fall back to the second mavenCentral()
      // (the first is in buildscript.repositories)
      const allprojectsMatch = contents.match(
        /allprojects\s*\{[\s\S]*?repositories\s*\{/,
      );
      if (allprojectsMatch) {
        const insertPos =
          contents.indexOf(allprojectsMatch[0]) +
          allprojectsMatch[0].length;
        contents =
          contents.slice(0, insertPos) +
          '\n// @generated begin raven-maven-repo - expo prebuild (DO NOT MODIFY)\n' +
          mavenBlock +
          '\n// @generated end raven-maven-repo\n' +
          contents.slice(insertPos);
      } else {
        // Fallback: insert after the last mavenCentral() in the file
        contents = mergeContents({
          tag: 'raven-maven-repo',
          src: contents,
          newSrc: mavenBlock,
          anchor: /mavenCentral\(\)/,
          offset: 1,
          comment: '//',
        }).contents;
      }
    }

    config.modResults.contents = contents;
    return config;
  });
};

/**
 * Step 9: Apply the Google Services plugin in android/app/build.gradle
 */
const withGoogleServicesPlugin: ConfigPlugin = (config) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      throw new Error(
        'Raven plugin: Expected android/app/build.gradle to be Groovy.',
      );
    }

    if (
      !config.modResults.contents.includes('com.google.gms.google-services')
    ) {
      config.modResults.contents = mergeContents({
        tag: 'raven-google-services-plugin',
        src: config.modResults.contents,
        newSrc: 'apply plugin: "com.google.gms.google-services"',
        anchor: /apply plugin.*com\.android\.application/,
        offset: 1,
        comment: '//',
      }).contents;
    }

    return config;
  });
};

/**
 * Steps 10 + 11 + 12: Add POST_NOTIFICATIONS permission, Firebase Messaging Service,
 * and optionally enable cleartext traffic in AndroidManifest.xml
 */
const withRavenAndroidManifest: ConfigPlugin<{
  enableCleartextTraffic?: boolean;
}> = (config, {enableCleartextTraffic = false}) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;

    // Step 10: POST_NOTIFICATIONS permission
    const permissions = manifest.manifest['uses-permission'] ?? [];
    const hasPostNotifications = permissions.some(
      (p) =>
        p.$?.['android:name'] === 'android.permission.POST_NOTIFICATIONS',
    );
    if (!hasPostNotifications) {
      permissions.push({
        $: {'android:name': 'android.permission.POST_NOTIFICATIONS'},
      });
      manifest.manifest['uses-permission'] = permissions;
    }

    // Step 11: Cleartext traffic for dev HTTP backends
    if (enableCleartextTraffic) {
      const application = manifest.manifest.application?.[0];
      if (application) {
        application.$['android:usesCleartextTraffic'] = 'true';
      }
    }

    // Step 12: Add Firebase Messaging Service for push notifications
    const application = manifest.manifest.application?.[0];
    if (application) {
      const services = application.service ?? [];
      const hasMessagingService = services.some(
        (s) =>
          s.$?.['android:name'] === 'com.ds.horizon.comms.platform.fcm.DsCommsFcmService',
      );

      if (!hasMessagingService) {
        services.push({
          $: {
            'android:name': 'com.ds.horizon.comms.platform.fcm.DsCommsFcmService',
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
        });
        application.service = services;
      }
    }

    return config;
  });
};

/**
 * Step 7: Add GitHub credential placeholders to gradle.properties
 */
const withRavenGradleProperties: ConfigPlugin = (config) => {
  return withGradleProperties(config, (config) => {
    const props = config.modResults;

    const hasRavenComment = props.some(
      (p) =>
        p.type === 'comment' &&
        typeof p.value === 'string' &&
        p.value.includes('Raven Android SDK'),
    );

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
      );
    }

    return config;
  });
};

const withRavenAndroid: ConfigPlugin<RavenAndroidProps> = (
  config,
  props = {},
) => {
  config = withRavenProjectBuildGradle(config, {
    githubMavenRepoUrl: props.githubMavenRepoUrl,
  });
  config = withGoogleServicesPlugin(config);
  config = withRavenAndroidManifest(config, {
    enableCleartextTraffic: props.enableCleartextTraffic,
  });
  config = withRavenGradleProperties(config);
  return config;
};

export default withRavenAndroid;
