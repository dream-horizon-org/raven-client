"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const withAndroidPlugin_1 = __importDefault(require("./withAndroidPlugin"));
const withIosPlugins_1 = __importDefault(require("./withIosPlugins"));
const withRavenPlugin = (config) => {
    config = (0, withAndroidPlugin_1.default)(config);
    config = (0, withIosPlugins_1.default)(config);
    return config;
};
exports.default = withRavenPlugin;
