"use strict";
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
exports.AIServer = void 0;
const api_1 = require("../api");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const body_parser_1 = __importDefault(require("body-parser"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ansi_colors_1 = __importDefault(require("ansi-colors"));
const routes_1 = __importDefault(require("./routes"));
const ws_1 = __importDefault(require("./ws"));
const logger = api_1.Logger.getLogger('httpd');
const version = (() => {
    try {
        const versionfile = path_1.default.join(process.cwd(), 'VERSION');
        return fs_1.default.existsSync(versionfile) && fs_1.default.readFileSync(versionfile).toString();
    }
    catch (err) {
        logger.error(err);
    }
})();
class AIServer {
    constructor(options) {
        if (!options)
            throw new Error('options required');
        if (!options.context)
            throw new Error('options.context required');
        this.options = options;
    }
    getToken() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.token || this.options.token;
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.stop();
            const options = this.options;
            const host = (this.host = options.host || '0.0.0.0');
            const port = (this.port = +options.port || 9700);
            const context = options.context;
            const servertoken = yield this.getToken();
            const app = (0, express_1.default)();
            app
                .set('trust proxy', true)
                .disable('x-powered-by')
                /*
                .use(async (req, res, next) => {
                  try {
                    if (!req.headers?.authorization || !req.headers?.authorization?.toLowerCase()?.startsWith('bearer ')) {
                      res.status(403).end();
                      throw new Error(`invalid access token`);
                    }
          
                    const clienttoken = req.headers?.authorization?.split(' ')[1];
                    if (!clienttoken || !clienttoken.startsWith('cat-')) {
                      res.status(403).end();
                      throw new Error(`invalid access token`);
                    }
          
                    if (clienttoken !== servertoken) {
                      res.status(401).send();
                      throw new Error(`invalid access token`);
                    }
          
                    next();
                  } catch (err) {
                    logger.error(`${chalk.blueBright(req.ip)} ${chalk.magentaBright(req.method)} ${chalk.white(req.originalUrl)}`, err);
                  }
                })
                */
                .get('/', (req, res) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                res.send({
                    version,
                    client: ~((_a = req.ip) === null || _a === void 0 ? void 0 : _a.indexOf(',')) ? (_b = req.ip) === null || _b === void 0 ? void 0 : _b.split(',')[0].trim() : req.ip
                });
            }))
                .use(body_parser_1.default.urlencoded({ extended: false }))
                .use(body_parser_1.default.json())
                .use((req, res, next) => __awaiter(this, void 0, void 0, function* () {
                req['startedAt'] = new Date();
                res.on('finish', (a) => {
                    const ms = new Date().getTime() - req['startedAt'].getTime();
                    if (!~['OPTIONS'].indexOf(req.method.toUpperCase())) {
                        logger.log(req.method.toUpperCase() === 'GET' ? api_1.LOG_LEVEL.debug : api_1.LOG_LEVEL.info, `${ansi_colors_1.default.blueBright(req.ip)} ${~['GET'].indexOf(req.method) ? ansi_colors_1.default.magentaBright(req.method) : ansi_colors_1.default.yellowBright(req.method)} ${ansi_colors_1.default.white(req.originalUrl)} +${ms > 1000 ? ansi_colors_1.default.red(ms.toString()) : ms > 100 ? ansi_colors_1.default.yellow(ms.toString()) : ansi_colors_1.default.green(ms.toString())}ms`);
                    }
                });
                next();
            }))
                .use((0, routes_1.default)(context))
                .use((req, res) => {
                res.status(404).send('Not Found');
            })
                .use((err, req, res, next) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                const code = err.code || ((_a = err.cause) === null || _a === void 0 ? void 0 : _a.code) || ((_c = (_b = err.cause) === null || _b === void 0 ? void 0 : _b.cause) === null || _c === void 0 ? void 0 : _c.code) || ((_f = (_e = (_d = err.cause) === null || _d === void 0 ? void 0 : _d.cause) === null || _e === void 0 ? void 0 : _e.cause) === null || _f === void 0 ? void 0 : _f.code) || ((_k = (_j = (_h = (_g = err.cause) === null || _g === void 0 ? void 0 : _g.cause) === null || _h === void 0 ? void 0 : _h.cause) === null || _j === void 0 ? void 0 : _j.cause) === null || _k === void 0 ? void 0 : _k.code);
                if (code)
                    logger.error(`${ansi_colors_1.default.blueBright(req.ip)} ${ansi_colors_1.default.magentaBright(req.method)} ${ansi_colors_1.default.white(req.originalUrl)} [${code}] ${err.message}`, JSON.stringify(err));
                else
                    logger.error(`${ansi_colors_1.default.blueBright(req.ip)} ${ansi_colors_1.default.magentaBright(req.method)} ${ansi_colors_1.default.white(req.originalUrl)} ${err.message}`, JSON.stringify(err));
                if (err instanceof api_1.Errors) {
                    for (const e of err.errors) {
                        const lines = e.stack.split('\n');
                        logger.error(ansi_colors_1.default.red(lines[0]));
                        logger.error(ansi_colors_1.default.gray(lines.slice(1).join('\n')));
                    }
                }
                else {
                    const lines = err.stack.split('\n');
                    logger.error(ansi_colors_1.default.red(lines[0]));
                    logger.error(ansi_colors_1.default.gray(lines.slice(1).join('\n')));
                }
                res
                    .status(500)
                    .type('application/json')
                    .send(JSON.stringify({
                    error: true,
                    code,
                    type: err.type,
                    message: err.message,
                    cause: err.cause,
                    stack: err.stack,
                    errors: err.errors
                }));
            });
            this.app = app;
            this.httpd = yield http_1.default.createServer(app).listen({ host, port });
            (0, ws_1.default)(this.httpd, context, servertoken &&
                ((message) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    const headers = message.headers || message.request.headers;
                    const tokenheader = headers['Authorization'] || headers['authorization'];
                    const clienttoken = Array.isArray(tokenheader) ? (_a = tokenheader[0]) === null || _a === void 0 ? void 0 : _a.split(' ')[1] : tokenheader === null || tokenheader === void 0 ? void 0 : tokenheader.split(' ')[1];
                    if (!clienttoken)
                        throw new Error(`Access has been restricted`);
                    return clienttoken && servertoken === clienttoken;
                })));
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.httpd)
                return;
            yield this.httpd.close();
        });
    }
    getCurrentNamespace() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const namespacefile = '/var/run/secrets/kubernetes.io/serviceaccount/namespace';
            return process.env.AGENT_NAMESPACE || (fs_1.default.existsSync(namespacefile) && ((_b = (_a = fs_1.default.readFileSync(namespacefile)) === null || _a === void 0 ? void 0 : _a.toString('utf-8')) === null || _b === void 0 ? void 0 : _b.trim()));
        });
    }
}
exports.AIServer = AIServer;
//# sourceMappingURL=AIServer.js.map