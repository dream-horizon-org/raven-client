"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const generateCode_1 = require("@expo/config-plugins/build/utils/generateCode");
/** Default Maven version for `com.google.gms:google-services` classpath. */
const DEFAULT_GOOGLE_SERVICES_CLASSPATH_VERSION = '4.4.4';
/** Default FCM `android:name` for the messaging service (Raven / ds-comms Android SDK). */
const DEFAULT_FCM_MESSAGING_SERVICE_CLASS = 'com.ds.horizon.comms.platform.fcm.DsCommsFcmService';
function assertSupportedGradleLanguage(language, fileLabel) {
    if (language !== 'groovy' && language !== 'kotlin') {
        throw new Error(`Raven plugin: Unsupported Gradle DSL for ${fileLabel} (language="${language}"). ` +
            'Supported: groovy (.gradle) and kotlin (.gradle.kts).');
    }
}
/** Classpath line for com.google.gms:google-services (valid in Groovy and Kotlin DSL). */
function googleServicesClasspathLine(version) {
    return `        classpath("com.google.gms:google-services:${version}")`;
}
/**
 * Matches RN / Expo classpath for the react-native-gradle-plugin
 * (Groovy or Kotlin DSL, single or double quotes).
 */
const REACT_NATIVE_GRADLE_PLUGIN_CLASSPATH = /classpath\([^)]*react-native-gradle-plugin[^)]*\)/;
/**
 * Maven repo block for GitHub Packages (valid in Groovy and Kotlin DSL Gradle scripts).
 */
function mavenRepoBlockGroovyStyle(repoUrl) {
    return [
        `        maven {`,
        `            url = uri(project.findProperty("GITHUB_PACKAGES_REPO_URL") ?: "${repoUrl}")`,
        `            credentials {`,
        `                username = project.findProperty("GITHUB_USERNAME") ?: System.getenv("GITHUB_USERNAME") ?: ""`,
        `                password = project.findProperty("GITHUB_TOKEN") ?: System.getenv("GITHUB_TOKEN") ?: ""`,
        `            }`,
        `        }`,
    ].join('\n');
}
function mavenRepoBlockKotlinStyle(repoUrl) {
    return [
        `        maven {`,
        `            url = uri((project.findProperty("GITHUB_PACKAGES_REPO_URL") as String?) ?: "${repoUrl}")`,
        `            credentials {`,
        `                username = (project.findProperty("GITHUB_USERNAME") as String?) ?: System.getenv("GITHUB_USERNAME") ?: ""`,
        `                password = (project.findProperty("GITHUB_TOKEN") as String?) ?: System.getenv("GITHUB_TOKEN") ?: ""`,
        `            }`,
        `        }`,
    ].join('\n');
}
function insertRavenMavenRepo(contents, repoUrl, language) {
    if (contents.includes('raven-maven-repo')) {
        return contents;
    }
    const mavenBlock = language === 'kotlin'
        ? mavenRepoBlockKotlinStyle(repoUrl)
        : mavenRepoBlockGroovyStyle(repoUrl);
    const allprojectsMatch = contents.match(/allprojects\s*\{[\s\S]*?repositories\s*\{/);
    if (allprojectsMatch) {
        const insertPos = contents.indexOf(allprojectsMatch[0]) + allprojectsMatch[0].length;
        return (contents.slice(0, insertPos) +
            '\n// @generated begin raven-maven-repo - expo prebuild (DO NOT MODIFY)\n' +
            mavenBlock +
            '\n// @generated end raven-maven-repo\n' +
            contents.slice(insertPos));
    }
    return (0, generateCode_1.mergeContents)({
        tag: 'raven-maven-repo',
        src: contents,
        newSrc: mavenBlock,
        anchor: /mavenCentral\(\)/,
        offset: 1,
        comment: '//',
    }).contents;
}
function patchProjectBuildGradleContents(contents, language, githubMavenRepoUrl, googleServicesClasspathVersion) {
    let next = contents;
    if (!next.includes('com.google.gms:google-services')) {
        next = (0, generateCode_1.mergeContents)({
            tag: 'raven-google-services-classpath',
            src: next,
            newSrc: googleServicesClasspathLine(googleServicesClasspathVersion),
            anchor: REACT_NATIVE_GRADLE_PLUGIN_CLASSPATH,
            offset: 1,
            comment: '//',
        }).contents;
    }
    const repoUrl = githubMavenRepoUrl !== null && githubMavenRepoUrl !== void 0 ? githubMavenRepoUrl : 'https://maven.pkg.github.com/dream11/ds-comms-android-sdk';
    return insertRavenMavenRepo(next, repoUrl, language);
}
/**
 * Steps 6 + 8: Add GitHub Maven repository and Google Services classpath
 * to android/build.gradle or build.gradle.kts
 */
const withRavenProjectBuildGradle = (config, { githubMavenRepoUrl, googleServicesClasspathVersion }) => {
    const gmsVersion = googleServicesClasspathVersion !== null && googleServicesClasspathVersion !== void 0 ? googleServicesClasspathVersion : DEFAULT_GOOGLE_SERVICES_CLASSPATH_VERSION;
    return (0, config_plugins_1.withProjectBuildGradle)(config, (gradleConfig) => {
        const language = gradleConfig.modResults.language;
        assertSupportedGradleLanguage(language, 'android/build.gradle');
        gradleConfig.modResults.contents = patchProjectBuildGradleContents(gradleConfig.modResults.contents, language, githubMavenRepoUrl, gmsVersion);
        return gradleConfig;
    });
};
function patchAppBuildGradleForGoogleServices(contents, language) {
    if (contents.includes('com.google.gms.google-services')) {
        return contents;
    }
    if (language === 'groovy') {
        return (0, generateCode_1.mergeContents)({
            tag: 'raven-google-services-plugin',
            src: contents,
            newSrc: 'apply plugin: "com.google.gms.google-services"',
            anchor: /apply plugin.*com\.android\.application/,
            offset: 1,
            comment: '//',
        }).contents;
    }
    // Kotlin DSL: plugins { id("com.android.application") ... }
    if (/id\("com\.google\.gms\.google-services"\)/.test(contents)) {
        return contents;
    }
    if (/id\("com\.android\.application"\)/.test(contents)) {
        return (0, generateCode_1.mergeContents)({
            tag: 'raven-google-services-plugin-kts',
            src: contents,
            newSrc: '    id("com.google.gms.google-services")',
            anchor: /id\("com\.android\.application"\)/,
            offset: 1,
            comment: '//',
        }).contents;
    }
    // Fallback: first line inside plugins { ... }
    if (/plugins\s*\{/.test(contents)) {
        return (0, generateCode_1.mergeContents)({
            tag: 'raven-google-services-plugin-kts-fallback',
            src: contents,
            newSrc: '    id("com.google.gms.google-services")\n',
            anchor: /plugins\s*\{/,
            offset: 1,
            comment: '//',
        }).contents;
    }
    throw new Error('Raven plugin: Could not apply com.google.gms.google-services in app build.gradle.kts. ' +
        'Expected a plugins { } block with id("com.android.application") or plugins {.');
}
/**
 * Step 9: Apply the Google Services plugin in android/app/build.gradle(.kts)
 */
const withGoogleServicesPlugin = (config) => {
    return (0, config_plugins_1.withAppBuildGradle)(config, (gradleConfig) => {
        const language = gradleConfig.modResults.language;
        assertSupportedGradleLanguage(language, 'android/app/build.gradle');
        gradleConfig.modResults.contents = patchAppBuildGradleForGoogleServices(gradleConfig.modResults.contents, language);
        return gradleConfig;
    });
};
/**
 * Steps 10 + 11 + 12: Add POST_NOTIFICATIONS permission, Firebase Messaging Service,
 * and optionally enable cleartext traffic in AndroidManifest.xml
 */
const withRavenAndroidManifest = (config, { enableCleartextTraffic = false, fcmMessagingServiceClass: fcmMessagingServiceClassProp, }) => {
    const fcmMessagingServiceClass = fcmMessagingServiceClassProp !== null && fcmMessagingServiceClassProp !== void 0 ? fcmMessagingServiceClassProp : DEFAULT_FCM_MESSAGING_SERVICE_CLASS;
    return (0, config_plugins_1.withAndroidManifest)(config, (manifestConfig) => {
        var _a, _b, _c, _d;
        const manifest = manifestConfig.modResults;
        // Step 10: POST_NOTIFICATIONS permission
        const permissions = (_a = manifest.manifest['uses-permission']) !== null && _a !== void 0 ? _a : [];
        const hasPostNotifications = permissions.some((p) => { var _a; return ((_a = p.$) === null || _a === void 0 ? void 0 : _a['android:name']) === 'android.permission.POST_NOTIFICATIONS'; });
        if (!hasPostNotifications) {
            permissions.push({
                $: { 'android:name': 'android.permission.POST_NOTIFICATIONS' },
            });
            manifest.manifest['uses-permission'] = permissions;
        }
        // Step 11: Cleartext traffic for dev HTTP backends
        if (enableCleartextTraffic) {
            const application = (_b = manifest.manifest.application) === null || _b === void 0 ? void 0 : _b[0];
            if (application) {
                application.$['android:usesCleartextTraffic'] = 'true';
            }
        }
        // Step 12: Add Firebase Messaging Service for push notifications
        const application = (_c = manifest.manifest.application) === null || _c === void 0 ? void 0 : _c[0];
        if (application) {
            const services = (_d = application.service) !== null && _d !== void 0 ? _d : [];
            const hasMessagingService = services.some((s) => { var _a; return ((_a = s.$) === null || _a === void 0 ? void 0 : _a['android:name']) === fcmMessagingServiceClass; });
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
                });
                application.service = services;
            }
        }
        return manifestConfig;
    });
};
/**
 * Step 7: Add GitHub credential placeholders to gradle.properties
 */
const withRavenGradleProperties = (config) => {
    return (0, config_plugins_1.withGradleProperties)(config, (gradlePropsConfig) => {
        const props = gradlePropsConfig.modResults;
        const hasRavenComment = props.some((p) => p.type === 'comment' &&
            typeof p.value === 'string' &&
            p.value.includes('Raven Android SDK'));
        if (!hasRavenComment) {
            props.push({
                type: 'comment',
                value: ' GitHub Packages auth for Raven Android SDK',
            }, {
                type: 'comment',
                value: ' Set via env vars GITHUB_USERNAME / GITHUB_TOKEN, or uncomment below:',
            }, {
                type: 'comment',
                value: ' GITHUB_USERNAME=your-github-username',
            }, {
                type: 'comment',
                value: ' GITHUB_TOKEN=your-personal-access-token',
            });
        }
        return gradlePropsConfig;
    });
};
const withRavenAndroid = (config, props = {}) => {
    config = withRavenProjectBuildGradle(config, {
        githubMavenRepoUrl: props.githubMavenRepoUrl,
        googleServicesClasspathVersion: props.googleServicesClasspathVersion,
    });
    config = withGoogleServicesPlugin(config);
    config = withRavenAndroidManifest(config, {
        enableCleartextTraffic: props.enableCleartextTraffic,
        fcmMessagingServiceClass: props.fcmMessagingServiceClass,
    });
    config = withRavenGradleProperties(config);
    return config;
};
exports.default = withRavenAndroid;
