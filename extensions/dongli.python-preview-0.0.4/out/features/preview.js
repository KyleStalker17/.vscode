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
const path = require("path");
const dispose_1 = require("../common/dispose");
const file_1 = require("../common/file");
const pythonOutput_1 = require("./pythonOutput");
class PythonPreview {
    constructor(webviewPanel, resource, locked, staringInstruction, width, _previewManager, _context, _cachedOutputs, _contentProvider, _previewConfigurationManager, _logger) {
        this._previewManager = _previewManager;
        this._context = _context;
        this._cachedOutputs = _cachedOutputs;
        this._contentProvider = _contentProvider;
        this._previewConfigurationManager = _previewConfigurationManager;
        this._logger = _logger;
        this._disposables = [];
        this._disposed = false;
        this._onDidDisposeEmitter = new vscode.EventEmitter();
        this.onDidDispose = this._onDidDisposeEmitter.event;
        this._onDidChangeViewStateEmitter = new vscode.EventEmitter();
        this.onDidChangeViewState = this._onDidChangeViewStateEmitter.event;
        this._resource = resource;
        this._locked = locked;
        this._startingInstrcution = staringInstruction;
        this._codAndNavWidth = width;
        this._webviewPanel = webviewPanel;
        this._webviewPanel.onDidDispose(() => {
            this.dispose();
        }, null, this._disposables);
        this._webviewPanel.onDidChangeViewState(e => {
            this.updateContentWithStatus(true);
            this._onDidChangeViewStateEmitter.fire(e);
        }, null, this._disposables);
        // 处理来自webview的消息
        this._webviewPanel.webview.onDidReceiveMessage(e => {
            if (e.source !== this._resource.toString()) {
                return;
            }
            switch (e.type) {
                case 'command':
                    vscode.commands.executeCommand(e.body.command, ...e.body.args);
                    break;
                case 'updateStartingInstruction':
                    this.onDidUpdateStartingInstruction(e.body.curInstr);
                    break;
                case 'updateCodAndNavWidth':
                    this.onDidUpdataCodAndNavWidth(e.body.width);
                    break;
            }
        }, null, this._disposables);
        vscode.workspace.onDidChangeTextDocument(event => {
            if (this.isPreviewOf(event.document.uri)) {
                // 文本改变直接传送给调试器，等待调试器返回trace
                this._previewManager.postMessageToDebugger(event.document.fileName, event.document.getText());
            }
        }, null, this._disposables);
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor && file_1.isPythonFile(editor.document) && !this._locked) {
                this.update(editor.document.uri);
            }
        }, null, this._disposables);
    }
    // 反序列化时使用
    static receive(webviewPanel, state, previewManager, context, cachedOutputs, contentProvider, previewConfigurationManager, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            const resource = vscode.Uri.parse(state.resource);
            const locked = state.locked;
            const startingInstruction = state.startingInstruction;
            const width = state.width;
            const preview = new PythonPreview(webviewPanel, resource, locked, startingInstruction, width, previewManager, context, cachedOutputs, contentProvider, previewConfigurationManager, logger);
            yield preview.doUpdate();
            return preview;
        });
    }
    static create(resource, previewColumn, locked, previewManager, context, cachedOutputs, contentProvider, previewConfigurationManager, logger) {
        const webviewPanel = vscode.window.createWebviewPanel(PythonPreview.viewtype, PythonPreview.getPreviewTitle(resource, locked), previewColumn, Object.assign({ enableFindWidget: true }, PythonPreview.getWebviewOptions(resource, context)));
        return new PythonPreview(webviewPanel, resource, locked, undefined, undefined, previewManager, context, cachedOutputs, contentProvider, previewConfigurationManager, logger);
    }
    get resource() {
        return this._resource;
    }
    get locked() {
        return this._locked;
    }
    get state() {
        return {
            resource: this._resource.toString(),
            locked: this._locked,
            startingInstruction: this._startingInstrcution,
            width: this._codAndNavWidth
        };
    }
    get visibale() {
        return this._webviewPanel.visible;
    }
    get position() {
        return this._webviewPanel.viewColumn;
    }
    get disposed() {
        return this._disposed;
    }
    dispose() {
        if (this._disposed) {
            return;
        }
        this._disposed = true;
        this._onDidDisposeEmitter.fire();
        this._onDidDisposeEmitter.dispose();
        this._onDidChangeViewStateEmitter.dispose();
        this._webviewPanel.dispose();
        dispose_1.disposeAll(this._disposables);
    }
    updateConfiguration() {
        if (this._previewConfigurationManager.hasConfigurationChanged(this._resource)) {
            this.initialContent();
        }
    }
    update(resource) {
        const isResourceChange = resource.fsPath !== this._resource.fsPath;
        if (isResourceChange) {
            this._resource = resource;
            this._startingInstrcution = undefined;
            this.initialContent();
        }
    }
    doUpdate() {
        return __awaiter(this, void 0, void 0, function* () {
            const document = yield vscode.workspace.openTextDocument(this._resource);
            this._currentVersion = { resource: this._resource, version: document.version };
            this._webviewPanel.title = PythonPreview.getPreviewTitle(this._resource, this._locked);
            this._webviewPanel.webview.options = PythonPreview.getWebviewOptions(this._resource, this._context);
            this._webviewPanel.webview.html = this._contentProvider.provideTextDocumentContent(document, this._previewConfigurationManager, this.state);
            this._previewManager.postMessageToDebugger(document.fileName, document.getText());
        });
    }
    initialContent() {
        return __awaiter(this, void 0, void 0, function* () {
            const document = yield vscode.workspace.openTextDocument(this._resource);
            this._webviewPanel.title = PythonPreview.getPreviewTitle(this._resource, this._locked);
            this._webviewPanel.webview.options = PythonPreview.getWebviewOptions(this._resource, this._context);
            this._webviewPanel.webview.html = this._contentProvider.provideTextDocumentContent(document, this._previewConfigurationManager, this.state);
            this._previewManager.postMessageToDebugger(document.fileName, document.getText());
        });
    }
    updateContent() {
        return __awaiter(this, void 0, void 0, function* () {
            const document = yield vscode.workspace.openTextDocument(this._resource);
            if (this._currentVersion && this._resource.fsPath === this._currentVersion.resource.fsPath && document.version === this._currentVersion.version) {
                this.updateContentWithStatus(true);
            }
            else {
                this.updateContentWithStatus(false);
            }
            this._currentVersion = { resource: this._resource, version: document.version };
        });
    }
    updateStatus() {
        this._startingInstrcution = undefined;
    }
    updateContentWithStatus(hasStatus) {
        const cacheOutput = this._cachedOutputs.get(this._resource.fsPath);
        // 如果此时还没有缓存的输出或者正在调试中，则直接返回
        if (!cacheOutput || cacheOutput.status !== pythonOutput_1.PythonOutputStatus.Prcoessed)
            return;
        const config = this._previewConfigurationManager.getConfigCacheForResource(this._resource);
        if (this._codAndNavWidth === undefined) {
            this._codAndNavWidth = config.contentConfig.codAndNavWidth;
        }
        const options = {
            jumpToEnd: true,
            startingInstruction: undefined,
            disableHeapNesting: config.contentConfig.disableHeapNesting,
            textualMemoryLabels: config.contentConfig.textualMemoryLabels,
            compactFuncLabels: config.contentConfig.compactFuncLabels,
            showAllFrameLabels: config.contentConfig.showAllFrameLabels,
            hideCode: config.contentConfig.hideCode,
            lang: this._previewManager.lang,
            width: this._codAndNavWidth
        };
        if (hasStatus)
            options.startingInstruction = this._startingInstrcution;
        if (this.position) {
            this._logger.info(`Updating ${PythonPreview.getPreviewTitle(this._resource, this._locked)} (Group ${this.position})`);
        }
        else {
            this._logger.info(`Updating ${PythonPreview.getPreviewTitle(this._resource, this._locked)}`);
        }
        this.postMessage({
            type: 'updateContent',
            data: cacheOutput.trace,
            options: options
        });
    }
    matchesResource(otherResource, otherPosition, otherLocked) {
        if (this.position !== otherPosition) {
            return false;
        }
        if (this._locked !== otherLocked) {
            return false;
        }
        return this.isPreviewOf(otherResource);
    }
    matches(otherPreview) {
        return this.matchesResource(otherPreview._resource, otherPreview.position, otherPreview._locked);
    }
    reveal(viewColumn) {
        this._webviewPanel.reveal(viewColumn);
    }
    toggleLock() {
        this._locked = !this._locked;
        this._webviewPanel.title = PythonPreview.getPreviewTitle(this._resource, this._locked);
        this.postMessage({
            type: 'updateLock',
            locked: this._locked
        });
    }
    isPreviewOf(resource) {
        return this._resource.fsPath === resource.fsPath;
    }
    static getPreviewTitle(resource, locked) {
        return locked
            ? `[Preview] ${path.basename(resource.fsPath)}`
            : `Preview ${path.basename(resource.fsPath)}`;
    }
    postMessage(msg) {
        if (!this._disposed) {
            this._webviewPanel.webview.postMessage(msg);
        }
    }
    static getWebviewOptions(resource, context) {
        return {
            enableScripts: true,
            enableCommandUris: true,
            localResourceRoots: PythonPreview.getLocalResourceRoots(resource, context)
        };
    }
    static getLocalResourceRoots(resource, context) {
        const baseRoots = [vscode.Uri.file(context.extensionPath)];
        const folder = vscode.workspace.getWorkspaceFolder(resource);
        folder && baseRoots.push(folder.uri);
        (!resource.scheme || resource.scheme === 'file') && baseRoots.push(vscode.Uri.file(path.dirname(resource.fsPath)));
        return baseRoots;
    }
    onDidUpdateStartingInstruction(curInstr) {
        this._startingInstrcution = curInstr;
    }
    onDidUpdataCodAndNavWidth(width) {
        this._codAndNavWidth = width;
    }
}
PythonPreview.viewtype = 'pythonPreview';
exports.PythonPreview = PythonPreview;
//# sourceMappingURL=preview.js.map