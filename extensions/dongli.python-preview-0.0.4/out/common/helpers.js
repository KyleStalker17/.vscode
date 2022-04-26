"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isNotInstalledError(error) {
    const isError = typeof (error) === 'object' && error != null;
    const errorObj = error;
    if (!isError) {
        return false;
    }
    const isModuleNotInstalledError = error.message.indexOf('No module named') >= 0;
    return errorObj.code === 'ENOENT' || errorObj.code === 127 || isModuleNotInstalledError;
}
exports.isNotInstalledError = isNotInstalledError;
class DeferredImpl {
    constructor(_scope = null) {
        this._scope = _scope;
        this._resolved = false;
        this._rejected = false;
        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }
    get promise() {
        return this._promise;
    }
    get resolved() {
        return this._resolved;
    }
    get rejected() {
        return this._rejected;
    }
    get completed() {
        return this._resolved || this._rejected;
    }
    resolve(value) {
        this._resolve.apply(this._scope ? this._scope : this, arguments);
        this._resolved = true;
    }
    reject(reason) {
        this._reject.apply(this._scope ? this._scope : this, arguments);
        this._rejected = true;
    }
}
function createDeferred(scope = null) {
    return new DeferredImpl(scope);
}
exports.createDeferred = createDeferred;
//# sourceMappingURL=helpers.js.map