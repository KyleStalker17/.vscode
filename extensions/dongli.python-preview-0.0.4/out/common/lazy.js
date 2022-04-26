"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LazyValue {
    constructor(_getValue) {
        this._getValue = _getValue;
        this._hasValue = false;
    }
    get hasValue() {
        return this._hasValue;
    }
    get value() {
        if (!this._hasValue) {
            this._hasValue = true;
            this._value = this._getValue();
        }
        return this._value;
    }
    map(f) {
        return new LazyValue(() => f(this.value));
    }
}
function lazy(getValue) {
    return new LazyValue(getValue);
}
exports.lazy = lazy;
//# sourceMappingURL=lazy.js.map