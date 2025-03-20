"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uniqid = void 0;
const crypto_1 = __importDefault(require("crypto"));
const now = () => {
    const t = Date.now();
    const last = now.last || t;
    return (now.last = t > last ? t : last + 1);
};
const random = (digit) => {
    return crypto_1.default.randomBytes((+digit || 8) / 2).toString('hex');
};
const time = () => {
    return now().toString(36);
};
const uniqid = (prefix, suffix) => {
    return (prefix ? prefix : '') + time() + random() + (suffix ? suffix : '');
};
exports.uniqid = uniqid;
exports.uniqid.time = time;
exports.uniqid.random = random;
//# sourceMappingURL=Uniqid.js.map