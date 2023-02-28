"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.either = exports.safely = void 0;
function safely(fn) {
    return (k) => {
        if (!k)
            return null;
        return fn(k);
    };
}
exports.safely = safely;
function either(o, e) {
    if (o) {
        return o;
    }
    return e;
}
exports.either = either;
//# sourceMappingURL=types.js.map