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
exports.AIContext = exports.AIContextOptions = void 0;
const spec_1 = require("./spec");
const db_1 = require("./db");
const Assistant_1 = require("./Assistant");
const Logger_1 = require("./Logger");
const ansi_colors_1 = __importDefault(require("ansi-colors"));
const logger = Logger_1.Logger.getLogger('ai');
class AIContextOptions {
}
exports.AIContextOptions = AIContextOptions;
class AIContext {
    constructor(options) {
        var _a;
        this.providers = {};
        this.initialized = false;
        logger.debug(`[assistant] init with`, ansi_colors_1.default.cyan(JSON.stringify(options, null, 2)));
        if (!options)
            throw new Error('options is required');
        if (!((_a = options.db) === null || _a === void 0 ? void 0 : _a.url))
            throw new Error('options.db.url is required');
        this.options = options;
        this.persist = new db_1.MongoAIPersistance(options.db);
    }
    listAssistant(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`[assistant] listAssistant`, ansi_colors_1.default.cyan(JSON.stringify(filter, null, 2)));
            return yield this.persist.listAssistant(filter);
        });
    }
    createAssistant(values) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`[assistant] createAssistant`, ansi_colors_1.default.cyan(JSON.stringify(values, null, 2)));
            const { name, owner, displayName, config, info } = values;
            if (!owner)
                throw new Error(`owner is required`);
            const id = (0, spec_1.uniqid)();
            const vo = {
                id: id,
                name: name || id,
                owner,
                displayName,
                config: config,
                info: info,
                createdAt: new Date()
            };
            yield this.persist.createAssistant(vo);
            return yield this.getAssistant(vo.id);
        });
    }
    getAssistant(id) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`[assistant] getAssistant`, ansi_colors_1.default.cyan(id));
            if (!id)
                throw new Error('id is required');
            const doc = yield this.persist.findAssistant({ id });
            if (!doc)
                return null;
            return new Assistant_1.Assistant(doc, this);
        });
    }
    getAssistantByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`[assistant] getAssistantByName`, ansi_colors_1.default.cyan(name));
            if (!name)
                throw new Error('name is required');
            const doc = yield this.persist.findAssistant({ name });
            if (!doc)
                return null;
            return new Assistant_1.Assistant(doc, this);
        });
    }
    getAssistantByUser(owner) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            logger.debug(`[assistant] getAssistantByUser`, ansi_colors_1.default.cyan(owner));
            if (!owner)
                throw new Error('uid is required');
            const list = yield this.persist.listAssistant({ condition: { owner } });
            if (!((_a = list === null || list === void 0 ? void 0 : list.rows) === null || _a === void 0 ? void 0 : _a.length))
                return null;
            return (_b = list === null || list === void 0 ? void 0 : list.rows) === null || _b === void 0 ? void 0 : _b.map((row) => new Assistant_1.Assistant(row, this));
        });
    }
    getProvider(name) {
        const provider = this.providers[name];
        if (!provider)
            throw new Error(`unsupported provider: ${name}`);
        return provider;
    }
    listProvider() {
        return Object.keys(this.providers).map((name) => {
            const provider = this.providers[name];
            return {
                name,
                displayName: provider.displayName,
                icon: provider.icon,
                schema: provider.schema,
                modelSchema: provider.modelSchema
            };
        });
    }
    listModel() {
        return __awaiter(this, void 0, void 0, function* () {
            const models = [];
            Object.keys(this.providers).forEach((name) => {
                const provider = this.providers[name];
                const list = provider.listModel();
                list === null || list === void 0 ? void 0 : list.forEach((model) => {
                    models.push({
                        name: model.name,
                        provider: name,
                        displayName: model.displayName,
                        schema: model.schema,
                        enable: model.enable,
                        icon: model.icon || provider.icon,
                        type: model.type || spec_1.MODEL_TYPE.text
                    });
                });
            });
            return models;
        });
    }
    removeAssistant(id) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`[assistant] removeAssistant`, ansi_colors_1.default.cyan(id));
            const doc = yield this.persist.findAssistant({ id });
            if (!doc)
                throw new Error(`assistant account not found: ${id}`);
            yield this.persist.removeAssistant(id);
        });
    }
    getAccessToken(id) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`[assistant] getAccessToken`, ansi_colors_1.default.cyan(id));
            return (yield this.persist.getAccessToken(id)) || (yield this.persist.createAccessToken(id));
        });
    }
    renewAccessToken(id) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`[assistant] renewAccessToken`, ansi_colors_1.default.cyan(id));
            return (yield this.persist.getAccessToken(id)) && (yield this.persist.renewAccessToken(id));
        });
    }
    removeAccessToken(id) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`[assistant] removeAccessToken`, ansi_colors_1.default.cyan(id));
            yield this.persist.removeAccessToken(id);
        });
    }
    registProvider(name, provider) {
        return __awaiter(this, void 0, void 0, function* () {
            this.providers[name] = provider;
        });
    }
    unregistProvider(name) {
        return __awaiter(this, void 0, void 0, function* () {
            delete this.providers[name];
        });
    }
}
exports.AIContext = AIContext;
//# sourceMappingURL=AIContext.js.map