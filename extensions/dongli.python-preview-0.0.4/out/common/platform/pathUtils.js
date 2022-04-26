"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
exports.IPathUtils = Symbol('IPathUtils');
class PathUtils {
    constructor(_isWindows) {
        this._isWindows = _isWindows;
    }
    getPathVariableName() {
        return this._isWindows ? 'Path' : 'PATH';
    }
    basename(pathValue, ext) {
        return path.basename(pathValue, ext);
    }
}
exports.PathUtils = PathUtils;
//# sourceMappingURL=pathUtils.js.map