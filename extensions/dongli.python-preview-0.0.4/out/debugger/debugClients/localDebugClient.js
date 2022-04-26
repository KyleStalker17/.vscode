'use strict';
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
const baseDebugClient_1 = require("./baseDebugClient");
const child_process_1 = require("child_process");
const localDebugServer_1 = require("../debugServers/localDebugServer");
const helpers_1 = require("../../common/helpers");
var DebugServerStatus;
(function (DebugServerStatus) {
    DebugServerStatus[DebugServerStatus["Unknown"] = 1] = "Unknown";
    DebugServerStatus[DebugServerStatus["Running"] = 2] = "Running";
    DebugServerStatus[DebugServerStatus["NotRunning"] = 3] = "NotRunning";
})(DebugServerStatus || (DebugServerStatus = {}));
class LocalDebugClient extends baseDebugClient_1.BaseDebugClient {
    constructor(args, _launcherScriptProvider, _previewManager, _logger) {
        super(args);
        this._launcherScriptProvider = _launcherScriptProvider;
        this._previewManager = _previewManager;
        this._logger = _logger;
    }
    get debugServerStatus() {
        if (this._debugServer) {
            switch (this._debugServer.isRunning) {
                case true:
                    return DebugServerStatus.Running;
                case false:
                    return DebugServerStatus.NotRunning;
            }
        }
        return DebugServerStatus.Unknown;
    }
    createDebugServer(pythonProcess) {
        this._pythonProcess = pythonProcess;
        this._debugServer = new localDebugServer_1.LocalDebugServer(this._pythonProcess, this._args, this._logger);
        return this._debugServer;
    }
    stop() {
        if (this._debugServer) {
            this._debugServer.stop();
            this._debugServer = undefined;
        }
        if (this._pyProc) {
            this._pyProc.kill();
            this._pyProc = undefined;
        }
    }
    displayError(error) {
        let errorMsg = typeof error === 'string' ? error : ((error.message && error.message.length > 0) ? error.message : '');
        if (helpers_1.isNotInstalledError(error)) {
            errorMsg = `Failed to launch the Python Process, please validate the path '${this._args.pythonPath}'`;
        }
        if (errorMsg.length > 0) {
            vscode.window.showErrorMessage(errorMsg);
            this._logger.error(errorMsg);
        }
    }
    launchApplicationToDebug(debugServer) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let pythonPath = 'python';
                if (typeof this._args.pythonPath === 'string' && this._args.pythonPath.trim().length > 0) {
                    pythonPath = this._args.pythonPath;
                }
                const args = this.buildLaunchArguments(debugServer.port);
                this._logger.info('Starting Debug Client');
                this._pyProc = child_process_1.spawn(pythonPath, args);
                this.handleProcessOutput(this._pyProc, reject);
                // Here we wait for the application to connect to the socket server.
                // Only once connected do we know that the application has successfully launched.
                this._debugServer.debugClientConnected
                    .then(resolve)
                    .catch(ex => console.error('Python Client Connect Exception: _debugServer.debugClientConnected', ex));
            });
        });
    }
    handleProcessOutput(proc, failedToLaunch) {
        proc.on('error', error => {
            const status = this.debugServerStatus;
            if (status === DebugServerStatus.Running) {
                return;
            }
            if (status === DebugServerStatus.NotRunning && typeof (error) === 'object' && error !== null) {
                return failedToLaunch(error);
            }
            // This could happen when the debugger didn't launch at all, e.g. python doesn't exist.
            this.displayError(error);
            this._previewManager.dispose();
        });
        proc.stderr.setEncoding('utf8');
        proc.stderr.on('data', error => {
            // if (this.debugServerStatus === DebugServerStatus.NotRunning) {
            //     return failedToLaunch(error);
            // }
            let x = 0;
        });
        proc.stdout.setEncoding('utf-8');
        proc.stdout.on('data', d => {
            const arr = d.toString().split('&');
            const length = arr.length;
            if (length <= 2)
                return;
            const dataType = arr[length - 2];
            const dataMessage = arr[length - 1];
            if (dataType === 'info') {
                this._logger.info(dataMessage);
            }
            else if (dataType === 'warn') {
                this._logger.warn(dataMessage);
            }
            else if (dataType === 'error') {
                this.displayError(dataMessage);
                this._previewManager.dispose();
            }
        });
    }
    buildLaunchArguments(debugPort) {
        return [...this.buildDebugArguments(debugPort)];
    }
    buildDebugArguments(debugPort) {
        const launcherFilePath = this._launcherScriptProvider.getLauncherFilePath();
        return [launcherFilePath, debugPort.toString(), 'ba648ec3-d025-44bb-92fb-7ded4267a243'];
    }
}
exports.LocalDebugClient = LocalDebugClient;
//# sourceMappingURL=localDebugClient.js.map