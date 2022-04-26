"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RefreshPreviewCommand {
    constructor(_previewManager) {
        this._previewManager = _previewManager;
        this.id = 'pythonPreview.refresh';
    }
    execute() {
        this._previewManager.refresh();
    }
}
exports.RefreshPreviewCommand = RefreshPreviewCommand;
//# sourceMappingURL=refreshPreview.js.map