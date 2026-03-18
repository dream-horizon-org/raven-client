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
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const NSE_TARGET_NAME = 'NotificationServiceExtension';
function generateNotificationServiceSwift(props) {
    var _a, _b, _c, _d, _e, _f;
    const mediaUrlKey = (_a = props.mediaUrlKey) !== null && _a !== void 0 ? _a : 'media_url';
    const mediaTypeKey = (_b = props.mediaTypeKey) !== null && _b !== void 0 ? _b : 'media_type';
    const baseUrl = (_c = props.baseUrl) !== null && _c !== void 0 ? _c : '';
    const eventsBaseUrl = (_d = props.eventsBaseUrl) !== null && _d !== void 0 ? _d : '';
    const apiKey = (_e = props.apiKey) !== null && _e !== void 0 ? _e : '';
    const enableLogging = (_f = props.enableLogging) !== null && _f !== void 0 ? _f : false;
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
function generateNSEInfoPlist() {
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
const withNSEFiles = (config, props) => {
    return (0, config_plugins_1.withDangerousMod)(config, [
        'ios',
        (config) => {
            const nsePath = path.join(config.modRequest.platformProjectRoot, NSE_TARGET_NAME);
            fs.mkdirSync(nsePath, { recursive: true });
            fs.writeFileSync(path.join(nsePath, 'NotificationService.swift'), generateNotificationServiceSwift(props));
            fs.writeFileSync(path.join(nsePath, 'Info.plist'), generateNSEInfoPlist());
            return config;
        },
    ]);
};
/**
 * Add the NotificationServiceExtension target to the Xcode project,
 * configure build settings, and add source files.
 */
const withNSEXcodeTarget = (config, { bundleIdentifier }) => {
    return (0, config_plugins_1.withXcodeProject)(config, (config) => {
        var _a, _b, _c, _d, _e, _f, _g;
        const project = config.modResults;
        const mainBundleId = (_b = (_a = config.ios) === null || _a === void 0 ? void 0 : _a.bundleIdentifier) !== null && _b !== void 0 ? _b : '';
        const nseBundleId = bundleIdentifier !== null && bundleIdentifier !== void 0 ? bundleIdentifier : `${mainBundleId}.${NSE_TARGET_NAME}`;
        if (project.pbxTargetByName(NSE_TARGET_NAME)) {
            return config;
        }
        const target = project.addTarget(NSE_TARGET_NAME, 'app_extension', NSE_TARGET_NAME, nseBundleId);
        // Create a PBX group and add files
        const groupKey = project.pbxCreateGroup(NSE_TARGET_NAME, NSE_TARGET_NAME);
        const mainGroupId = project.getFirstProject().firstProject.mainGroup;
        project.addToPbxGroup(groupKey, mainGroupId);
        project.addSourceFile(`${NSE_TARGET_NAME}/NotificationService.swift`, { target: target.uuid }, groupKey);
        project.addFile(`${NSE_TARGET_NAME}/Info.plist`, groupKey);
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
            (_c = objects['PBXContainerItemProxy']) !== null && _c !== void 0 ? _c : {};
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
            (_d = objects['PBXTargetDependency']) !== null && _d !== void 0 ? _d : {};
        objects['PBXTargetDependency'][depUuid] = {
            isa: 'PBXTargetDependency',
            target: target.uuid,
            targetProxy: proxyUuid,
        };
        objects['PBXTargetDependency'][`${depUuid}_comment`] =
            'PBXTargetDependency';
        mainNativeTarget.dependencies = (_e = mainNativeTarget.dependencies) !== null && _e !== void 0 ? _e : [];
        mainNativeTarget.dependencies.push({
            value: depUuid,
            comment: 'PBXTargetDependency',
        });
        // 3. "Embed Foundation Extensions" build phase (PBXCopyFilesBuildPhase)
        //    dstSubfolderSpec 13 = PlugIns & Foundation Extensions
        const nseProductRef = (_f = nativeTargets[target.uuid]) === null || _f === void 0 ? void 0 : _f.productReference;
        const embedBuildFileUuid = project.generateUuid();
        objects['PBXBuildFile'][embedBuildFileUuid] = {
            isa: 'PBXBuildFile',
            fileRef: nseProductRef,
            settings: { ATTRIBUTES: ['RemoveHeadersOnCopy'] },
        };
        objects['PBXBuildFile'][`${embedBuildFileUuid}_comment`] =
            `${NSE_TARGET_NAME}.appex in Embed Foundation Extensions`;
        const copyPhaseUuid = project.generateUuid();
        objects['PBXCopyFilesBuildPhase'] =
            (_g = objects['PBXCopyFilesBuildPhase']) !== null && _g !== void 0 ? _g : {};
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
const withNotificationServiceExtension = (config, props) => {
    config = withNSEFiles(config, props);
    config = withNSEXcodeTarget(config, {
        bundleIdentifier: props.bundleIdentifier,
    });
    return config;
};
exports.default = withNotificationServiceExtension;
