"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const generateCode_1 = require("@expo/config-plugins/build/utils/generateCode");
/**
 * Steps 6 + 8: Add GitHub Maven repository and Google Services classpath
 * to android/build.gradle
 */
const withRavenProjectBuildGradle = (config, { githubMavenRepoUrl }) => {
    return (0, config_plugins_1.withProjectBuildGradle)(config, (config) => {
        if (config.modResults.language !== 'groovy') {
            throw new Error('Raven plugin: Expected android/build.gradle to be Groovy (found Kotlin DSL). ' +
                'Kotlin DSL build files are not yet supported.');
        }
        let contents = config.modResults.contents;
        // Step 8: Add Google Services classpath in buildscript.dependencies
        if (!contents.includes('com.google.gms:google-services')) {
            contents = (0, generateCode_1.mergeContents)({
                tag: 'raven-google-services-classpath',
                src: contents,
                newSrc: '        classpath("com.google.gms:google-services:4.4.4")',
                anchor: /classpath\(.*react-native-gradle-plugin.*\)/,
                offset: 1,
                comment: '//',
            }).contents;
        }
        // Step 6: Add GitHub Maven repository in allprojects.repositories
        const repoUrl = githubMavenRepoUrl !== null && githubMavenRepoUrl !== void 0 ? githubMavenRepoUrl : 'https://maven.pkg.github.com/dream11/ds-comms-android-sdk';
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
            const allprojectsMatch = contents.match(/allprojects\s*\{[\s\S]*?repositories\s*\{/);
            if (allprojectsMatch) {
                const insertPos = contents.indexOf(allprojectsMatch[0]) +
                    allprojectsMatch[0].length;
                contents =
                    contents.slice(0, insertPos) +
                        '\n// @generated begin raven-maven-repo - expo prebuild (DO NOT MODIFY)\n' +
                        mavenBlock +
                        '\n// @generated end raven-maven-repo\n' +
                        contents.slice(insertPos);
            }
            else {
                // Fallback: insert after the last mavenCentral() in the file
                contents = (0, generateCode_1.mergeContents)({
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
const withGoogleServicesPlugin = (config) => {
    return (0, config_plugins_1.withAppBuildGradle)(config, (config) => {
        if (config.modResults.language !== 'groovy') {
            throw new Error('Raven plugin: Expected android/app/build.gradle to be Groovy.');
        }
        if (!config.modResults.contents.includes('com.google.gms.google-services')) {
            config.modResults.contents = (0, generateCode_1.mergeContents)({
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
const withRavenAndroidManifest = (config, { enableCleartextTraffic = false }) => {
    return (0, config_plugins_1.withAndroidManifest)(config, (config) => {
        var _a, _b, _c, _d;
        const manifest = config.modResults;
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
            const hasMessagingService = services.some((s) => { var _a; return ((_a = s.$) === null || _a === void 0 ? void 0 : _a['android:name']) === 'com.ds.horizon.comms.platform.fcm.DsCommsFcmService'; });
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
const withRavenGradleProperties = (config) => {
    return (0, config_plugins_1.withGradleProperties)(config, (config) => {
        const props = config.modResults;
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
        return config;
    });
};
const withRavenAndroid = (config, props = {}) => {
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
exports.default = withRavenAndroid;
