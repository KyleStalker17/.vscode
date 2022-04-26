'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class PythonProcessCallbackHandler extends events_1.EventEmitter {
    constructor(pythonProcess, stream) {
        super();
        this._pythonProcess = pythonProcess;
        this._stream = stream;
    }
    handleIncomingData() {
        if (this._stream.length === 0) {
            return;
        }
        this._stream.beginTransaction();
        let cmd = this._stream.readAsciiString(4);
        if (this._stream.hasInsufficientDataForReading) {
            return;
        }
        switch (cmd) {
            case 'LOAD':
                this.handleProcessLoad();
                break;
            case 'OUTP':
                this.handleDebuggerOutput();
                break;
            case 'DETC':
                this.handleDetach();
                break;
            default:
                this.emit('error', `Unhandled command '${cmd}'`);
        }
        if (this._stream.hasInsufficientDataForReading) {
            this._stream.rollBackTransaction();
            return;
        }
        this._stream.endTransaction();
        if (this._stream.length > 0) {
            this.handleIncomingData();
        }
    }
    handleProcessLoad() {
        let pythonVersion = this._stream.readString();
        if (this._stream.hasInsufficientDataForReading) {
            return;
        }
        this.emit('processLoaded', pythonVersion);
    }
    handleDebuggerOutput() {
        let fileName = this._stream.readString();
        let output = this._stream.readString();
        if (this._stream.hasInsufficientDataForReading) {
            return;
        }
        this.emit("output", fileName, output);
    }
    handleDetach() {
        this.emit('detach');
    }
}
exports.PythonProcessCallbackHandler = PythonProcessCallbackHandler;
//# sourceMappingURL=pythonProcessCallbackHandler.js.map