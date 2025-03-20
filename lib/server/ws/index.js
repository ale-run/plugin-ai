"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = __importDefault(require("url"));
const run_1 = __importDefault(require("./run"));
let listner;
exports.default = (server, context, authenticator) => {
    const wsrun = (0, run_1.default)(context, authenticator);
    if (listner)
        server.off('upgrade', listner);
    listner = (request, socket, head) => {
        const pathname = url_1.default.parse(request.url).pathname;
        const pathes = pathname.split('/');
        const program = pathes.slice(2).join('/');
        if (program === 'run') {
            wsrun.handleUpgrade(request, socket, head, (ws) => {
                wsrun.emit('connection', ws, request);
            });
        }
    };
    server.on('upgrade', listner);
};
//# sourceMappingURL=index.js.map