'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const pythonProcessCallbackHandler_1 = require("./pythonProcessCallbackHandler");
const socketStream_1 = require("../common/net/socket/socketStream");
const proxyCommands_1 = require("./proxyCommands");
class PythonProcess extends events_1.EventEmitter {
    constructor(id, guid) {
        super();
        this._id = id;
        this._guid = guid;
    }
    kill() {
        if (this._pid && typeof this._pid === 'number') {
            try {
                let kill = require('tree-kill');
                kill(this._pid);
                this._pid = undefined;
            }
            catch (e) {
            }
        }
    }
    detach() {
        this._stream.write(Buffer.from('detc'));
    }
    connect(buffer, socket) {
        if (!this._stream) {
            this._stream = new socketStream_1.SocketStream(socket, buffer);
        }
        else {
            this._stream.append(buffer);
        }
        if (!this._guidRead) {
            this._stream.beginTransaction();
            this._stream.readString();
            if (this._stream.hasInsufficientDataForReading) {
                this._stream.rollBackTransaction();
                return false;
            }
            this._guidRead = true;
            this._stream.endTransaction();
        }
        if (!this._statusRead) {
            this._stream.beginTransaction();
            this._stream.readInt32();
            if (this._stream.hasInsufficientDataForReading) {
                this._stream.rollBackTransaction();
                return false;
            }
            this._statusRead = true;
            this._stream.endTransaction();
        }
        if (!this._pidRead) {
            this._stream.beginTransaction();
            this._pid = this._stream.readInt32();
            if (this._stream.hasInsufficientDataForReading) {
                this._stream.rollBackTransaction();
                return false;
            }
            this._pidRead = true;
            this._stream.endTransaction();
        }
        this._callbackHandler = new pythonProcessCallbackHandler_1.PythonProcessCallbackHandler(this, this._stream);
        this._callbackHandler.on('processLoaded', pythonVersion => this.emit('processLoaded', pythonVersion));
        this._callbackHandler.on('output', (fileName, output) => this.emit('output', fileName, output));
        this._callbackHandler.on('detach', () => this.emit('detach'));
        this._callbackHandler.handleIncomingData();
        return true;
    }
    handleInComingData(buffer) {
        this._stream.append(buffer);
        if (!this._guidRead) {
            this._stream.rollBackTransaction();
            this._stream.readString();
            if (this._stream.hasInsufficientDataForReading) {
                return;
            }
            this._guidRead = true;
            this._stream.endTransaction();
        }
        if (!this._statusRead) {
            this._stream.beginTransaction();
            this._stream.readInt32();
            if (this._stream.hasInsufficientDataForReading) {
                this._stream.rollBackTransaction();
                return;
            }
            this._pidRead = true;
            this._stream.endTransaction();
        }
        this._callbackHandler.handleIncomingData();
    }
    sendExecutableText(folder, fileName, code, cumulativeModde, allowAllModules, maxExecutedLines) {
        this._stream.write(proxyCommands_1.Commands.OutputCommandBytes);
        if (cumulativeModde) {
            this._stream.writeInt64(1);
        }
        else {
            this._stream.writeInt64(0);
        }
        if (allowAllModules) {
            this._stream.writeInt64(1);
        }
        else {
            this._stream.writeInt64(0);
        }
        this._stream.writeInt64(maxExecutedLines);
        this._stream.writeString(folder);
        this._stream.writeString(fileName);
        this._stream.writeString(code);
    }
}
exports.PythonProcess = PythonProcess;
//# sourceMappingURL=pythonProcess.js.map