"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PythonOutputStatus;
(function (PythonOutputStatus) {
    PythonOutputStatus[PythonOutputStatus["Initialized"] = 1] = "Initialized";
    PythonOutputStatus[PythonOutputStatus["Processing"] = 2] = "Processing";
    PythonOutputStatus[PythonOutputStatus["Prcoessed"] = 3] = "Prcoessed";
})(PythonOutputStatus = exports.PythonOutputStatus || (exports.PythonOutputStatus = {}));
class PythonOutput {
    constructor(_trace, _throttleTimer) {
        this._trace = _trace;
        this._throttleTimer = _throttleTimer;
        this._status = PythonOutputStatus.Initialized;
    }
    get trace() {
        return this._trace;
    }
    set trace(value) {
        this._trace = value;
    }
    get status() {
        return this._status;
    }
    set status(value) {
        this._status = value;
    }
    get throttleTimer() {
        return this._throttleTimer;
    }
    set throttleTimer(value) {
        this._throttleTimer = value;
    }
}
exports.PythonOutput = PythonOutput;
//# sourceMappingURL=pythonOutput.js.map