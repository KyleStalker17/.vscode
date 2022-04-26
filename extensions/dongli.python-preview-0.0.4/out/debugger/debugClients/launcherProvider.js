'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
class DebuggerLauncherScriptProvider {
    getLauncherFilePath() {
        return path.join(path.dirname(__dirname), '..', '..', 'pythonFiles', 'pydev', 'launcher.py');
    }
}
exports.DebuggerLauncherScriptProvider = DebuggerLauncherScriptProvider;
//# sourceMappingURL=launcherProvider.js.map