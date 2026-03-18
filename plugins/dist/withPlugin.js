"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const withAndroidPlugin_1 = __importDefault(require("./withAndroidPlugin"));
const withIosPlugins_1 = __importDefault(require("./withIosPlugins"));
const withRavenPlugin = (config, _props) => {
    var _a, _b, _c;
    const props = (_a = _props) !== null && _a !== void 0 ? _a : {};
    config = (0, withAndroidPlugin_1.default)(config, (_b = props.android) !== null && _b !== void 0 ? _b : {});
    config = (0, withIosPlugins_1.default)(config, (_c = props.ios) !== null && _c !== void 0 ? _c : {});
    return config;
};
exports.default = (0, config_plugins_1.createRunOncePlugin)(withRavenPlugin, '@dreamhorizonorg/raven-client');
