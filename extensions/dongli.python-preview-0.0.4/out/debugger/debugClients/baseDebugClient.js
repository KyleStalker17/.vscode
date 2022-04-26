'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class BaseDebugClient extends events_1.EventEmitter {
    constructor(_args) {
        super();
        this._args = _args;
    }
    stop() { }
    launchApplicationToDebug(debugServer) {
        return Promise.resolve();
    }
}
exports.BaseDebugClient = BaseDebugClient;
//# sourceMappingURL=baseDebugClient.js.map