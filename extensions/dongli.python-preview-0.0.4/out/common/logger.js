"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const lazy_1 = require("./lazy");
const is = require("./is");
var Trace;
(function (Trace) {
    Trace[Trace["Off"] = 0] = "Off";
    Trace[Trace["Verbose"] = 1] = "Verbose";
})(Trace || (Trace = {}));
(function (Trace) {
    function fromString(value) {
        value = value.toLowerCase();
        switch (value) {
            case 'off':
                return Trace.Off;
            case 'verbose':
                return Trace.Verbose;
            default:
                return Trace.Off;
        }
    }
    Trace.fromString = fromString;
})(Trace || (Trace = {}));
class Logger {
    constructor() {
        this._outputChannel = lazy_1.lazy(() => vscode.window.createOutputChannel('PythonPreview'));
        this.updateConfiguration();
    }
    updateConfiguration() {
        this._trace = this.readTrace();
    }
    info(message, data) {
        this.logLevel('Info', message, data);
    }
    warn(message, data) {
        this.logLevel('Warn', message, data);
    }
    error(message, data) {
        this.logLevel('Error', message, data);
    }
    logLevel(level, message, data) {
        if (this._trace === Trace.Verbose) {
            this.appendLine(`[${level} - ${(new Date().toLocaleTimeString())}] ${message}`);
            if (data) {
                this.appendLine(Logger.data2String(data));
            }
        }
    }
    appendLine(value) {
        this._outputChannel.value.appendLine(value);
    }
    static data2String(data) {
        if (data instanceof Error) {
            if (is.string(data.stack)) {
                return data.stack;
            }
            return data.message;
        }
        if (is.boolean(data.success) && !data.success && is.string(data.message)) {
            return data.message;
        }
        if (is.string(data)) {
            return data;
        }
        return data.toString();
    }
    readTrace() {
        return Trace.fromString(vscode.workspace.getConfiguration().get('pythonPreview.trace', 'off'));
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map