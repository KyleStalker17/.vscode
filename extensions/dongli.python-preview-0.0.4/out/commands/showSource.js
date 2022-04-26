"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class ShowSourceCommand {
    constructor(_previewManager) {
        this._previewManager = _previewManager;
        this.id = 'pythonPreview.showSource';
    }
    execute() {
        if (this._previewManager.activePreviewResource) {
            return vscode.workspace.openTextDocument(this._previewManager.activePreviewResource)
                .then(document => vscode.window.showTextDocument(document));
        }
        return undefined;
    }
}
exports.ShowSourceCommand = ShowSourceCommand;
//# sourceMappingURL=showSource.js.map