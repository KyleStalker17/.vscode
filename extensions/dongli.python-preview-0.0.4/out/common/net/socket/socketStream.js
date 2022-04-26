'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const uint64be = require('uint64be');
class SocketStream {
    constructor(socket, buffer) {
        this._bytesRead = 0;
        this._hasInsufficientDataForReading = false;
        this._socket = socket;
        this._buffer = buffer;
    }
    get buffer() {
        return this._buffer;
    }
    get hasInsufficientDataForReading() {
        return this._hasInsufficientDataForReading;
    }
    get length() {
        return this._buffer.length;
    }
    writeInt32(num) {
        this.writeInt64(num);
    }
    writeInt64(num) {
        let buffer = uint64be.encode(num);
        this._socket.write(buffer);
    }
    writeString(str) {
        let stringBuffer = Buffer.from(str);
        this.writeInt32(stringBuffer.length);
        if (stringBuffer.length > 0) {
            this._socket.write(stringBuffer);
        }
    }
    write(buffer) {
        this._socket.write(buffer);
    }
    clearErrors() {
        this._hasInsufficientDataForReading = false;
    }
    beginTransaction() {
        this._isInTransaction = true;
        this._bytesRead = 0;
        this.clearErrors();
    }
    endTransaction() {
        this._isInTransaction = false;
        this._buffer = this._buffer.slice(this._bytesRead);
        this._bytesRead = 0;
        this.clearErrors();
    }
    rollBackTransaction() {
        this._isInTransaction = false;
        this._bytesRead = 0;
        this.clearErrors();
    }
    toString() {
        return this._buffer.toString();
    }
    append(additionalData) {
        if (this._buffer.length === 0) {
            this._buffer = additionalData;
            return;
        }
        let newBuffer = Buffer.alloc(this._buffer.length + additionalData.length);
        this._buffer.copy(newBuffer);
        additionalData.copy(newBuffer, this._buffer.length);
        this._buffer = newBuffer;
    }
    isSufficientDataAvailable(length) {
        if (this._buffer.length < (this._bytesRead + length)) {
            this._hasInsufficientDataForReading = true;
        }
        return !this._hasInsufficientDataForReading;
    }
    readByte() {
        if (!this.isSufficientDataAvailable(1)) {
            return null;
        }
        let value = this._buffer.slice(this._bytesRead, this._bytesRead + 1)[0];
        if (this._isInTransaction) {
            this._bytesRead++;
        }
        else {
            this._buffer = this._buffer.slice(1);
        }
        return value;
    }
    readInt32() {
        return this.readInt64();
    }
    readInt64() {
        if (!this.isSufficientDataAvailable(8)) {
            return null;
        }
        let buf = this._buffer.slice(this._bytesRead, this._bytesRead + 8);
        if (this._isInTransaction) {
            this._bytesRead += 8;
        }
        else {
            this._buffer = this._buffer.slice(8);
        }
        return uint64be.decode(buf);
    }
    readString() {
        let byteRead = this.readByte();
        if (this._hasInsufficientDataForReading) {
            return null;
        }
        if (byteRead < 0) {
            throw new Error('IOException() - Socket.readString() failed to read string value');
        }
        let type = Buffer.from([byteRead]).toString();
        let isUnicode = false;
        switch (type) {
            case 'N':
                return null;
            case 'U':
                isUnicode = true;
                break;
            case 'A':
                isUnicode = false;
                break;
            default:
                throw new Error(`IOException() - Socket.readString() failed to parse unknown string type ${type}`);
        }
        let len = this.readInt32();
        if (this._hasInsufficientDataForReading) {
            return null;
        }
        if (!this.isSufficientDataAvailable(len)) {
            return null;
        }
        let stringBuffer = this._buffer.slice(this._bytesRead, this._bytesRead + len);
        if (this._isInTransaction) {
            this._bytesRead += len;
        }
        else {
            this._buffer = this._buffer.slice(len);
        }
        return isUnicode ? stringBuffer.toString() : stringBuffer.toString('ascii');
    }
    readAsciiString(length) {
        if (!this.isSufficientDataAvailable(length)) {
            return null;
        }
        let stringBuffer = this._buffer.slice(this._bytesRead, this._bytesRead + length);
        if (this._isInTransaction) {
            this._bytesRead += length;
        }
        else {
            this._buffer = this._buffer.slice(length);
        }
        return stringBuffer.toString('ascii');
    }
    readValueInTransaction(dataType, length) {
        let startedTransaction = false;
        if (!this._isInTransaction) {
            this.beginTransaction();
            startedTransaction = true;
        }
        let data;
        switch (dataType) {
            case DataType.int32:
                data = this.readInt32();
                break;
            case DataType.int64:
                data = this.readInt64();
                break;
            case DataType.string:
                data = this.readString();
                break;
            case DataType.asciiString:
                data = this.readAsciiString(length);
                break;
        }
        if (this._hasInsufficientDataForReading) {
            if (startedTransaction) {
                this.rollBackTransaction();
            }
            return undefined;
        }
        if (startedTransaction) {
            this.endTransaction();
        }
        return data;
    }
    readInt32InTransaction() {
        return this.readValueInTransaction(DataType.int32);
    }
    readInt64InTransaction() {
        return this.readValueInTransaction(DataType.int64);
    }
    readStringInTransaction() {
        return this.readValueInTransaction(DataType.string);
    }
    readAsciiStringInTransaction(length) {
        return this.readValueInTransaction(DataType.asciiString, length);
    }
}
exports.SocketStream = SocketStream;
var DataType;
(function (DataType) {
    DataType[DataType["int32"] = 0] = "int32";
    DataType[DataType["int64"] = 1] = "int64";
    DataType[DataType["string"] = 2] = "string";
    DataType[DataType["asciiString"] = 3] = "asciiString";
})(DataType || (DataType = {}));
//# sourceMappingURL=socketStream.js.map