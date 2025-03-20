"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../../api");
const ws_1 = __importStar(require("ws"));
const ansi_colors_1 = __importDefault(require("ansi-colors"));
const logger = api_1.Logger.getLogger('ws:logs');
exports.default = (api, authenticator) => {
    const wss = new ws_1.default.Server({ noServer: true });
    wss
        .on('error', (err) => {
        logger.error(err);
    })
        .on('connection', (ws, req) => {
        ws.on('message', (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const message = JSON.parse(data.toString());
                if (message.type === 'prepare') {
                    const assistantId = message.params.assistantId;
                    const threadId = message.params.threadId;
                    const ask = message.params.ask;
                    if (!assistantId)
                        throw new Error(`params.assistantId is required`);
                    if (!threadId)
                        throw new Error(`params.threadId is required`);
                    authenticator =
                        authenticator ||
                            ((message) => __awaiter(void 0, void 0, void 0, function* () {
                                var _a;
                                const headers = message.headers || message.request.headers;
                                const tokenheader = headers['Authorization'] || headers['authorization'];
                                const clienttoken = Array.isArray(tokenheader) ? (_a = tokenheader[0]) === null || _a === void 0 ? void 0 : _a.split(' ')[1] : tokenheader === null || tokenheader === void 0 ? void 0 : tokenheader.split(' ')[1];
                                if (!clienttoken)
                                    throw new Error(`Access has been restricted`);
                                const token = yield api.getAccessToken(assistantId);
                                return clienttoken && token === clienttoken;
                            }));
                    if (!(yield authenticator({ request: req, headers: message.headers, params: message.params }))) {
                        throw new Error(`permission denied`);
                    }
                    const assistant = yield api.getAssistant(assistantId);
                    if (!assistant)
                        throw new Error(`assistant id ${assistantId} not found`);
                    const thread = yield assistant.getThread(threadId);
                    if (!assistant)
                        throw new Error(`thread id ${threadId} not found`);
                    const readable = yield thread.run(Object.assign({}, ask, { streaming: true }));
                    const wsstream = (0, ws_1.createWebSocketStream)(ws, { encoding: 'utf8' });
                    readable === null || readable === void 0 ? void 0 : readable.on('error', (err) => {
                        logger.warn(err);
                    });
                    wsstream.on('error', (err) => {
                        logger.warn(err);
                    });
                    ws.send('accept');
                    readable === null || readable === void 0 ? void 0 : readable.pipe(wsstream);
                }
                else if (!message.type) {
                    throw new Error(`message type is required`);
                }
                else {
                    throw new Error(`unknown message type: ${message.type}`);
                }
            }
            catch (err) {
                logger.error(err);
                const lines = err.stack.split('\n');
                logger.error(ansi_colors_1.default.red(lines[0]));
                logger.error(ansi_colors_1.default.gray(lines.slice(1).join('\n')));
                try {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: err.message,
                        cause: err.cause,
                        errors: err.errors
                    }));
                }
                catch (err) { }
                try {
                    ws.close();
                }
                catch (err) { }
            }
        })).on('error', (err) => {
            logger.error(err);
        });
    });
    return wss;
};
//# sourceMappingURL=run.js.map