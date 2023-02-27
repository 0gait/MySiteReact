"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
/* eslint no-console: 0 */
function log(message, data = undefined) {
    const debugEnvVariableName = 'THEMEBUILDER_DEBUG';
    const needLog = typeof process !== 'undefined' && process.env && process.env[debugEnvVariableName] !== undefined;
    if (!needLog)
        return;
    let timedMessage = `${new Date().toISOString()}: ${message}`;
    if (data !== undefined) {
        timedMessage += `: ${JSON.stringify(data, null, 2).substr(0, 50)}`;
    }
    console.log(timedMessage);
}
exports.log = log;
