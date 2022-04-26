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
const previewConfig_1 = require("./previewConfig");
const preview_1 = require("./preview");
const dispose_1 = require("../common/dispose");
const pythonProcess_1 = require("../debugger/pythonProcess");
const utils_1 = require("../debugger/common/utils");
const launcherProvider_1 = require("../debugger/debugClients/launcherProvider");
const localDebugClient_1 = require("../debugger/debugClients/localDebugClient");
const pythonOutput_1 = require("./pythonOutput");
const helpers_1 = require("../common/helpers");
class PythonPreviewManager {
    constructor(_context, _contentProvider, _logger) {
        this._context = _context;
        this._contentProvider = _contentProvider;
        this._logger = _logger;
        this._previewConfigurationManager = new previewConfig_1.PythonPreviewConfigurationManager();
        this._previews = [];
        this._activePreview = undefined;
        this._disposables = [];
        this._disposables.push(vscode.window.registerWebviewPanelSerializer(preview_1.PythonPreview.viewtype, this));
        this._cachedOutputs = new Map();
    }
    dispose() {
        dispose_1.disposeAll(this._disposables);
        dispose_1.disposeAll(this._previews);
        this._cachedOutputs.clear();
        this.stopDebugServer();
    }
    refresh() {
        for (const preview of this._previews) {
            preview.initialContent();
        }
    }
    updateConfiguration() {
        for (const preview of this._previews) {
            preview.updateConfiguration();
        }
    }
    preview(resource, previewSettings) {
        // 第一次预览，首先创建调试器。
        if (this._debuggerLoaded === undefined) {
            this._launchArgs = {
                pythonPath: 'python'
            };
            this._debuggerLoaded = new Promise(resolve => {
                this._debuggerLoadedPromiseResolve = resolve;
            });
            this.createDebugger(this._launchArgs);
        }
        // 这段代码永远找不到已存在的preview，原因是preview的列输入参数是vscode.ViewColumn.Beside或者vscode.ViewColumn.Beside！！！
        let preview = this.getExistingPreview(resource, previewSettings);
        if (preview) {
            preview.reveal(previewSettings.previewColumn);
        }
        else {
            preview = this.createNewPreview(resource, previewSettings);
            preview.initialContent();
        }
    }
    get activePreviewResource() {
        return this._activePreview && this._activePreview.resource;
    }
    get lang() {
        return this._lang;
    }
    toggleLock() {
        const preview = this._activePreview;
        if (preview) {
            preview.toggleLock();
            // 关闭冗余的预览
            for (const otherPreview of this._previews) {
                if (otherPreview !== preview && preview.matches(otherPreview)) {
                    otherPreview.dispose();
                }
            }
        }
    }
    deserializeWebviewPanel(webviewPanel, state) {
        return __awaiter(this, void 0, void 0, function* () {
            const preview = yield preview_1.PythonPreview.receive(webviewPanel, state, this, this._context, this._cachedOutputs, this._contentProvider, this._previewConfigurationManager, this._logger);
            this.registerPreview(preview);
        });
    }
    getExistingPreview(resource, previewSettings) {
        return this._previews.find(preview => preview.matchesResource(resource, previewSettings.previewColumn, previewSettings.locked));
    }
    createNewPreview(resource, previewSettings) {
        const preview = preview_1.PythonPreview.create(resource, previewSettings.previewColumn, previewSettings.locked, this, this._context, this._cachedOutputs, this._contentProvider, this._previewConfigurationManager, this._logger);
        this.setPreviewActiveContext(true);
        this._activePreview = preview;
        return this.registerPreview(preview);
    }
    registerPreview(preview) {
        this._previews.push(preview);
        preview.onDidDispose(() => {
            const existing = this._previews.indexOf(preview);
            if (existing === -1) {
                return;
            }
            this._previews.splice(existing, 1);
            if (this._activePreview === preview) {
                this.setPreviewActiveContext(false);
                this._activePreview = undefined;
            }
            if (this._previews.length === 0) {
                this.stopDebugServer();
                this._cachedOutputs.clear();
            }
            else {
                const isSameResource = this._previews.some(item => {
                    if (item.resource.fsPath == preview.resource.fsPath)
                        return true;
                });
                if (!isSameResource && this._cachedOutputs.has(preview.resource.fsPath)) {
                    this._cachedOutputs.delete(preview.resource.fsPath);
                }
            }
        });
        preview.onDidChangeViewState(({ webviewPanel }) => {
            dispose_1.disposeAll(this._previews.filter(otherPreview => preview !== otherPreview && preview.matches(otherPreview)));
            this.setPreviewActiveContext(webviewPanel.active);
            this._activePreview = webviewPanel.active ? preview : undefined;
        });
        return preview;
    }
    setPreviewActiveContext(value) {
        vscode.commands.executeCommand('setContext', PythonPreviewManager._pythonPreviewActiveContextKey, value);
    }
    createDebugger(args) {
        try {
            args.pythonPath = utils_1.getPythonExecutable(args.pythonPath);
        }
        catch (ex) { }
        this._launchArgs = args;
        let launchScriptProvider = new launcherProvider_1.DebuggerLauncherScriptProvider();
        this._debugClient = new localDebugClient_1.LocalDebugClient(args, launchScriptProvider, this, this._logger);
        const that = this;
        this.startDebugServer().then(debugServer => {
            this._logger.info(`Started Debug Server. It is listening port - ${debugServer.port}`);
            return that._debugClient.launchApplicationToDebug(debugServer);
        }).catch(error => {
            let errorMsg = typeof error === 'string' ? error : ((error.message && error.message.length > 0) ? error.message : error);
            if (helpers_1.isNotInstalledError(error)) {
                errorMsg = `Failed to launch the Python Process, please valiate the path '${this._launchArgs.pythonPath}'`;
            }
            vscode.window.showErrorMessage(errorMsg);
            this._logger.error('Starting Debugger with error.', errorMsg);
            this.dispose();
        });
    }
    initializeEventHandlers() {
        const pythonProcess = this._pythonProcess;
        pythonProcess.on('processLoaded', pythonVersion => this.onPythonProcessLoaded(pythonVersion));
        pythonProcess.on('output', (fileName, output) => this.onDebuggerOutput(fileName, output));
        pythonProcess.on('detach', () => this.onDetachDebugger());
        this._debugServer.on('detach', () => this.onDetachDebugger());
    }
    postMessageToDebugger(fileName, code) {
        if (this._debuggerLoaded === undefined) {
            this._launchArgs = {
                pythonPath: 'python'
            };
            this._debuggerLoaded = new Promise(resolve => {
                this._debuggerLoadedPromiseResolve = resolve;
            });
            this.createDebugger(this._launchArgs);
        }
        this._debuggerLoaded.then(() => {
            let output = this._cachedOutputs.get(fileName);
            // 第一次传送数据，则直接传送
            if (!output) {
                this._cachedOutputs.set(fileName, new pythonOutput_1.PythonOutput());
                this.sendMessage(fileName, code);
                output.status = pythonOutput_1.PythonOutputStatus.Initialized;
            }
            else {
                // 如果是之后的传送，则设置定时器
                clearTimeout(output.throttleTimer);
                output.throttleTimer = setTimeout(() => {
                    this.sendMessage(fileName, code);
                    output.status = pythonOutput_1.PythonOutputStatus.Processing;
                    output.throttleTimer = undefined;
                }, 300);
            }
        });
    }
    sendMessage(fileName, code) {
        const config = this._previewConfigurationManager.getConfigCacheForResource(vscode.Uri.file(fileName));
        const folder = PythonPreviewManager.getWorkspacePathOrPathRealtiveToFile(fileName);
        const cumulativeMode = config.traceConfig.cumulativeMode;
        const allowAllModules = config.traceConfig.allowAllModules;
        const maxExecutedLines = config.traceConfig.maxExecutedLines;
        this._logger.info('Sending executed code to debugger');
        this._pythonProcess.sendExecutableText(folder, fileName, code, cumulativeMode, allowAllModules, maxExecutedLines);
    }
    static getWorkspacePathOrPathRealtiveToFile(fileName) {
        let root = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(fileName));
        if (root) {
            return root.uri.fsPath;
        }
        return path.dirname(fileName);
    }
    onPythonProcessLoaded(pythonVersion) {
        this._logger.info('Python Process loaded');
        this._lang = `Python ${pythonVersion}`;
        this._debuggerLoadedPromiseResolve();
    }
    onDebuggerOutput(fileName, output) {
        const data = JSON.parse(output);
        let cacheOutput = this._cachedOutputs.get(fileName);
        cacheOutput.status = pythonOutput_1.PythonOutputStatus.Prcoessed;
        cacheOutput.trace = data;
        this._previews.forEach(item => {
            if (item.isPreviewOf(vscode.Uri.file(fileName))) {
                if (item.visibale) {
                    item.updateContent();
                }
            }
        });
    }
    onDetachDebugger() {
        this.stopDebugServer();
    }
    startDebugServer() {
        this._pythonProcess = new pythonProcess_1.PythonProcess(0, '');
        this._debugServer = this._debugClient.createDebugServer(this._pythonProcess);
        this.initializeEventHandlers();
        this._logger.info('Starting Debug Server');
        return this._debugServer.start();
    }
    stopDebugServer() {
        if (this._debugClient) {
            this._debugClient.stop();
            this._debugClient = undefined;
        }
        if (this._pythonProcess) {
            this._pythonProcess.kill();
            this._pythonProcess = undefined;
        }
        this._debuggerLoaded = undefined;
        if (this._lang) {
            this._lang = undefined;
            this._logger.info('Debugger exited');
        }
    }
}
PythonPreviewManager._pythonPreviewActiveContextKey = 'pythonPreviewFocus';
exports.PythonPreviewManager = PythonPreviewManager;
//# sourceMappingURL=previewManager.js.map