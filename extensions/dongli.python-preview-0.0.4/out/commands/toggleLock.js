"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ToggleLockCommand {
    constructor(_previewManager) {
        this._previewManager = _previewManager;
        this.id = 'pythonPreview.toggleLock';
    }
    execute() {
        this._previewManager.toggleLock();
    }
}
exports.ToggleLockCommand = ToggleLockCommand;
//# sourceMappingURL=toggleLock.js.map