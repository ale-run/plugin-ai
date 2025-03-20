"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Errors = void 0;
class Errors extends Error {
    constructor(message, code, cause) {
        super(message);
        this.type = 'Errors';
        this.errors = [];
        if (code instanceof Error)
            cause = code;
        if (typeof code === 'number')
            this.code = code;
        if (cause instanceof Error) {
            this.cause = cause;
            this.stack = `${this.stack}\n  Cause: ${cause.stack.split('\n').join('\n  ')}`;
        }
        Object.setPrototypeOf(this, Errors.prototype);
    }
    get length() {
        return this.errors.length;
    }
    push(error) {
        this.errors.push(error);
    }
    toJSON() {
        return {
            type: this.type,
            message: this.message,
            cause: this.cause,
            code: this.code,
            stack: this.stack,
            errors: this.errors
        };
    }
}
exports.Errors = Errors;
//# sourceMappingURL=Errors.js.map