"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function showPreview(previewManager, uri, previewSettings) {
    return __awaiter(this, void 0, void 0, function* () {
        let resource = uri;
        if (!(resource instanceof vscode.Uri)) {
            if (vscode.window.activeTextEditor) {
                resource = vscode.window.activeTextEditor.document.uri;
            }
            else {
                return vscode.commands.executeCommand('pythonPreview.showSource');
            }
        }
        previewManager.preview(resource, {
            resourceColumn: (vscode.window.activeTextEditor && vscode.window.activeTextEditor.viewColumn) || vscode.ViewColumn.One,
            previewColumn: previewSettings.sideBySide ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active,
            locked: previewSettings.locked
        });
    });
}
/**
 *
 */
class ShowPreviewCommand {
    constructor(_prviewManager) {
        this._prviewManager = _prviewManager;
        this.id = 'pythonPreview.showPreview';
    }
    execute() {
        showPreview(this._prviewManager, undefined, {
            sideBySide: false,
            locked: false
        });
    }
}
exports.ShowPreviewCommand = ShowPreviewCommand;
class ShowPreviewToSideCommand {
    constructor(_previewManager) {
        this._previewManager = _previewManager;
        this.id = 'pythonPreview.showPreviewToSide';
    }
    execute() {
        showPreview(this._previewManager, undefined, {
            sideBySide: true,
            locked: false
        });
    }
}
exports.ShowPreviewToSideCommand = ShowPreviewToSideCommand;
class ShowLockedPreviewToSideCommand {
    constructor(_previewManager) {
        this._previewManager = _previewManager;
        this.id = 'pythonPreview.showLockedPreviewToSide';
    }
    execute() {
        showPreview(this._previewManager, undefined, {
            sideBySide: true,
            locked: true
        });
    }
}
exports.ShowLockedPreviewToSideCommand = ShowLockedPreviewToSideCommand;
//# sourceMappingURL=showPreview.js.map