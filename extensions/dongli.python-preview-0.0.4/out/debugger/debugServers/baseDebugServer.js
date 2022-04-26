'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const helpers_1 = require("../../common/helpers");
class BaseDebugServer extends events_1.EventEmitter {
    constructor(pythonProcess) {
        super();
        this._pythonProcess = pythonProcess;
        this._debugClientConnected = helpers_1.createDeferred();
        this._clientSocket = helpers_1.createDeferred();
    }
    get isRunning() {
        return this._isRunning;
    }
    get debugClientConnected() {
        return this._debugClientConnected.promise;
    }
}
exports.BaseDebugServer = BaseDebugServer;
//# sourceMappingURL=baseDebugServer.js.map