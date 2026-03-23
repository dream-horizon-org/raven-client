"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const generateCode_1 = require("@expo/config-plugins/build/utils/generateCode");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const withNotificationServiceExtension_1 = __importDefault(require("./withNotificationServiceExtension"));
const NSE_TARGET_NAME = 'NotificationServiceExtension';
/**
 * Step 13: Add raven-ios-sdk pod to Podfile (main target + NSE target).
 */
const withRavenPodfile = (config, { ravenIosSdkGitUrl, ravenIosSdkTag, includeNSETarget }) => {
    return (0, config_plugins_1.withDangerousMod)(config, [
        'ios',
        (config) => {
            const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
            let contents = fs.readFileSync(podfilePath, 'utf-8');
            const gitUrl = ravenIosSdkGitUrl !== null && ravenIosSdkGitUrl !== void 0 ? ravenIosSdkGitUrl : 'git@github.com:dream11/raven-ios-sdk.git';
            const podSpec = ravenIosSdkTag
                ? `pod 'raven-ios-sdk', :git => '${gitUrl}', :tag => '${ravenIosSdkTag}'`
                : `pod 'raven-ios-sdk', :git => '${gitUrl}'`;
            // Add the pod to the main app target (before use_react_native! block)
            if (!contents.includes('raven-ios-sdk')) {
                contents = (0, generateCode_1.mergeContents)({
                    tag: 'raven-ios-sdk-pod',
                    src: contents,
                    newSrc: `  ${podSpec}`,
                    anchor: /use_react_native!/,
                    offset: 0,
                    comment: '#',
                }).contents;
            }
            // Remove old nested NSE target block if present (from previous plugin version).
            const nestedNseBlockRegex = /# @generated begin raven-nse-target[^\n]*\n[\s\S]*?# @generated end raven-nse-target\n?/g;
            contents = contents.replace(nestedNseBlockRegex, (match) => match.includes('inherit!') ? '' : match);
            // Add sibling NSE target (same structure as Raven-Demo-RN-App).
            const siblingNsePattern = `\ntarget '${NSE_TARGET_NAME}' do`;
            if (includeNSETarget &&
                !contents.includes(siblingNsePattern)) {
                const nseTargetBlock = [
                    '',
                    '# @generated begin raven-nse-target - expo prebuild (DO NOT MODIFY)',
                    `target '${NSE_TARGET_NAME}' do`,
                    '  use_frameworks! :linkage => :static',
                    `  ${podSpec}`,
                    'end',
                    '# @generated end raven-nse-target',
                ].join('\n');
                const lines = contents.split('\n');
                let insertAfterIndex = -1;
                for (let i = lines.length - 1; i >= 0; i--) {
                    if (/^\s*end\s*$/.test(lines[i])) {
                        insertAfterIndex = i;
                        break;
                    }
                }
                if (insertAfterIndex >= 0) {
                    const blockLines = nseTargetBlock.split('\n');
                    lines.splice(insertAfterIndex + 1, 0, ...blockLines);
                    contents = lines.join('\n');
                }
            }
            fs.writeFileSync(podfilePath, contents);
            return config;
        },
    ]);
};
/**
 * Step 14: Configure Firebase in AppDelegate.swift
 * - Import FirebaseCore and FirebaseMessaging
 * - Call FirebaseApp.configure()
 * - Forward APNs device token to Firebase Messaging
 */
const withFirebaseAppDelegate = (config) => {
    return (0, config_plugins_1.withAppDelegate)(config, (config) => {
        if (config.modResults.language !== 'swift') {
            throw new Error('Raven plugin: Expected AppDelegate to be Swift. ' +
                'Objective-C AppDelegate is not supported.');
        }
        let contents = config.modResults.contents;
        // Add Firebase imports (after existing imports)
        if (!contents.includes('import FirebaseCore')) {
            contents = (0, generateCode_1.mergeContents)({
                tag: 'raven-firebase-imports',
                src: contents,
                newSrc: 'import FirebaseCore\nimport FirebaseMessaging',
                anchor: /^import\s+\w+/m,
                offset: 1,
                comment: '//',
            }).contents;
        }
        // Add FirebaseApp.configure() at the top of didFinishLaunchingWithOptions
        // The function signature spans multiple lines; anchor on the `-> Bool {` line
        if (!contents.includes('FirebaseApp.configure()')) {
            contents = (0, generateCode_1.mergeContents)({
                tag: 'raven-firebase-configure',
                src: contents,
                newSrc: '    FirebaseApp.configure()',
                anchor: /\)\s*->\s*Bool\s*\{/,
                offset: 1,
                comment: '//',
            }).contents;
        }
        // Add APNs token forwarding + error handling methods
        if (!contents.includes('didRegisterForRemoteNotificationsWithDeviceToken')) {
            const apnsMethods = [
                '',
                '  override func application(',
                '    _ application: UIApplication,',
                '    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data',
                '  ) {',
                '    Messaging.messaging().apnsToken = deviceToken',
                '  }',
                '',
                '  override func application(',
                '    _ application: UIApplication,',
                '    didFailToRegisterForRemoteNotificationsWithError error: Error',
                '  ) {',
                '    print("Failed to register for remote notifications: \\(error)")',
                '  }',
            ].join('\n');
            // Insert before the "Linking API" comment or before class closing brace
            contents = (0, generateCode_1.mergeContents)({
                tag: 'raven-apns-delegate',
                src: contents,
                newSrc: apnsMethods,
                anchor: /\/\/\s*Linking API/,
                offset: 0,
                comment: '//',
            }).contents;
        }
        config.modResults.contents = contents;
        return config;
    });
};
/**
 * Steps 15 + 17: Configure Info.plist
 * - Disable Firebase delegate proxy
 * - Allow local networking (dev)
 * - Add remote-notification background mode
 */
const withRavenInfoPlist = (config, { enableLocalNetworking = false, disableFirebaseProxy = true }) => {
    return (0, config_plugins_1.withInfoPlist)(config, (config) => {
        var _a, _b;
        // Step 15: Disable Firebase delegate proxy for manual APNs token handling
        if (disableFirebaseProxy) {
            config.modResults.FirebaseAppDelegateProxyEnabled = false;
        }
        // Step 17: Allow local networking for HTTP dev backends
        if (enableLocalNetworking) {
            config.modResults.NSAppTransportSecurity =
                (_a = config.modResults.NSAppTransportSecurity) !== null && _a !== void 0 ? _a : {};
            config.modResults.NSAppTransportSecurity.NSAllowsLocalNetworking = true;
        }
        // Ensure remote-notification background mode is present
        const bgModes = (_b = config.modResults.UIBackgroundModes) !== null && _b !== void 0 ? _b : [];
        if (!bgModes.includes('remote-notification')) {
            bgModes.push('remote-notification');
        }
        config.modResults.UIBackgroundModes = bgModes;
        return config;
    });
};
/**
 * Step 16: Add push notification entitlement (aps-environment).
 */
const withRavenEntitlements = (config, { apsEnvironment = 'development' }) => {
    return (0, config_plugins_1.withEntitlementsPlist)(config, (config) => {
        config.modResults['aps-environment'] = apsEnvironment;
        return config;
    });
};
/**
 * Compose all iOS mods.
 */
const withRavenIos = (config, props = {}) => {
    const hasNSE = !!props.notificationServiceExtension;
    config = withRavenPodfile(config, {
        ravenIosSdkGitUrl: props.ravenIosSdkGitUrl,
        ravenIosSdkTag: props.ravenIosSdkTag,
        includeNSETarget: hasNSE,
    });
    config = withFirebaseAppDelegate(config);
    config = withRavenInfoPlist(config, {
        enableLocalNetworking: props.enableLocalNetworking,
        disableFirebaseProxy: props.disableFirebaseProxy,
    });
    config = withRavenEntitlements(config, {
        apsEnvironment: props.apsEnvironment,
    });
    if (hasNSE) {
        config = (0, withNotificationServiceExtension_1.default)(config, props.notificationServiceExtension);
    }
    return config;
};
exports.default = withRavenIos;
