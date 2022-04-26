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
const baseDebugServer_1 = require("./baseDebugServer");
const net = require("net");
class LocalDebugServer extends baseDebugServer_1.BaseDebugServer {
    constructor(pythonProcess, _args, _logger) {
        super(pythonProcess);
        this._args = _args;
        this._logger = _logger;
    }
    stop() {
        if (!this._debugSocketServer) {
            return;
        }
        try {
            this._debugSocketServer.close();
        }
        catch (_a) { }
        this._debugSocketServer = undefined;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let connectedResolve = this._debugClientConnected.resolve.bind(this._debugClientConnected);
                let connected = false;
                let disconnected = false;
                this._debugSocketServer = net.createServer(c => {
                    // "connection"监听器
                    c.on('data', (buffer) => {
                        if (connectedResolve) {
                            // debug客户端已经连接到debug服务器
                            connectedResolve(true);
                            this._logger.info('Debug Client Connected');
                            connectedResolve = null;
                        }
                        if (!connected) {
                            connected = this._pythonProcess.connect(buffer, c);
                        }
                        else {
                            this._pythonProcess.handleInComingData(buffer);
                            this._isRunning = true;
                        }
                    });
                    c.on('close', d => {
                        disconnected = true;
                        this.emit('detach', d);
                    });
                    c.on('timeout', () => {
                        const msg = `Debugger client timeout.`;
                        this._logger.warn(msg);
                    });
                    c.on('error', ex => {
                        if (connected || disconnected) {
                            return;
                        }
                        const msg = `There was an error in starting the debug server. Error = ${JSON.stringify(ex)}`;
                        reject(msg);
                    });
                });
                this._debugSocketServer.on('error', ex => {
                    const exMsg = JSON.stringify(ex);
                    let msg = '';
                    if (ex.code === 'EADDRINUSE') {
                        msg = `The port used for debugging is in use, please try again or try restarting Visual Studio Code, Error = ${exMsg}`;
                    }
                    else {
                        if (connected) {
                            return;
                        }
                        msg = `There was an error in starting the debug server. Error = ${exMsg}`;
                    }
                    reject(msg);
                });
                const port = typeof this._args.port === 'number' ? this._args.port : 0;
                const host = typeof this._args.host === 'string' && this._args.host.trim().length > 0 ? this._args.host.trim() : 'localhost';
                this._debugSocketServer.listen({ port: port, host: host }, () => {
                    const server = this._debugSocketServer.address();
                    resolve({ port: server.port });
                });
            });
        });
    }
}
exports.LocalDebugServer = LocalDebugServer;
//# sourceMappingURL=localDebugServer.js.map