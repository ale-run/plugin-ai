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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
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
const runtime_1 = require("@ale-run/runtime");
const api_1 = require("./api");
const server_1 = require("./server");
const provider_1 = require("./provider");
const node_path_1 = __importDefault(require("node:path"));
const ansi_colors_1 = __importDefault(require("ansi-colors"));
const logger = runtime_1.Logger.getLogger('plugin:ai');
class AIPlugin extends runtime_1.Plugin {
    activate() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info(ansi_colors_1.default.blue.bold(`plugin ${this.name} is activate`), this.options);
            // install apps
            const catalog = yield this.context.getCatalog();
            yield catalog.regist(`${node_path_1.default.resolve(__dirname, 'app/ai-assistant')}`);
            yield catalog.registPreset(`${node_path_1.default.resolve(__dirname, 'app/ai-assistant')}`);
            // init api routes
            const DB_URL = this.options.DB_URL || this.context.config.get('defaults').dburl;
            const DB_NAME = this.options.DB_NAME || this.options.DB_URL ? '' : 'ai';
            const OPENAI_API_KEY = this.options.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
            logger.info('options', this.options);
            logger.info('DB_URL', DB_URL);
            logger.info('DB_NAME', DB_NAME);
            logger.info('OPENAI_API_KEY', OPENAI_API_KEY);
            const context = new api_1.AIContext({
                db: {
                    url: DB_URL,
                    db: DB_NAME
                }
            });
            context.registProvider('openai', new provider_1.OpenAIProvider({
                apikey: OPENAI_API_KEY
            }));
            const airouter = (0, server_1.AIRouter)(context);
            const server = this.get('api-server');
            const router = server.routers.body.get(this.name);
            router.use('/ai', airouter);
            (0, server_1.AIRouterWebSocket)(server.httpd, context, (message) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const headers = message.headers || message.request.headers;
                const tokenheader = headers['Authorization'] || headers['authorization'];
                const clienttoken = Array.isArray(tokenheader) ? (_a = tokenheader[0]) === null || _a === void 0 ? void 0 : _a.split(' ')[1] : tokenheader === null || tokenheader === void 0 ? void 0 : tokenheader.split(' ')[1];
                if (!clienttoken)
                    throw new Error(`Access has been restricted`);
                return true;
            }));
            this.set('api', context);
        });
    }
    deactivate() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            logger.info(ansi_colors_1.default.red(`plugin ${this.name} will be deactivate`));
            const server = this.get('api-server');
            (_b = (_a = server === null || server === void 0 ? void 0 : server.routers) === null || _a === void 0 ? void 0 : _a.body) === null || _b === void 0 ? void 0 : _b.remove(this.name);
        });
    }
}
exports.default = AIPlugin;
__exportStar(require("./api/spec"), exports);
//# sourceMappingURL=index.js.map