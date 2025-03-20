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
exports.Assistant = void 0;
const spec_1 = require("./spec");
const Thread_1 = require("./Thread");
const DataStore_1 = require("./DataStore");
const Logger_1 = require("./Logger");
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const ansi_colors_1 = __importDefault(require("ansi-colors"));
const logger = Logger_1.Logger.getLogger('ai:assistant');
class Assistant {
    constructor(doc, context) {
        this.doc = doc;
        this.context = context;
        this.tmpdir = path_1.default.join(os_1.default.homedir(), '.ale', 'ai', 'tmp');
    }
    get id() {
        return this.doc.id;
    }
    get name() {
        return this.doc.name;
    }
    get owner() {
        return this.doc.owner;
    }
    get displayName() {
        return this.doc.displayName;
    }
    get config() {
        return this.doc.config;
    }
    get createdAt() {
        return this.doc.createdAt;
    }
    get updatedAt() {
        return this.doc.updatedAt;
    }
    get persist() {
        return this.context.persist;
    }
    // config
    updateConfig(config) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            logger.debug(`[${this.id}] updateConfig`, ansi_colors_1.default.cyan(JSON.stringify(config, null, 2)));
            if (((_a = config.defaults) === null || _a === void 0 ? void 0 : _a.text) && typeof ((_b = config.defaults) === null || _b === void 0 ? void 0 : _b.text) !== 'string')
                throw new Error(`defaults.text must be a string`);
            if (((_c = config.defaults) === null || _c === void 0 ? void 0 : _c.image) && typeof ((_d = config.defaults) === null || _d === void 0 ? void 0 : _d.image) !== 'string')
                throw new Error(`defaults.image must be a string`);
            if (((_e = config.defaults) === null || _e === void 0 ? void 0 : _e.ocr) && typeof ((_f = config.defaults) === null || _f === void 0 ? void 0 : _f.ocr) !== 'string')
                throw new Error(`defaults.ocr must be a string`);
            if (((_g = config.defaults) === null || _g === void 0 ? void 0 : _g.tts) && typeof ((_h = config.defaults) === null || _h === void 0 ? void 0 : _h.tts) !== 'string')
                throw new Error(`defaults.tts must be a string`);
            if (((_j = config.defaults) === null || _j === void 0 ? void 0 : _j.stt) && typeof ((_k = config.defaults) === null || _k === void 0 ? void 0 : _k.stt) !== 'string')
                throw new Error(`defaults.stt must be a string`);
            if (((_l = config.defaults) === null || _l === void 0 ? void 0 : _l.webSearch) && typeof ((_m = config.defaults) === null || _m === void 0 ? void 0 : _m.webSearch) !== 'string')
                throw new Error(`defaults.webSearch must be a string`);
            yield this.persist.updateAssistant(this.id, {
                config,
                updatedAt: new Date()
            });
            this.doc = yield this.persist.findAssistant({ id: this.id });
            return this.config;
        });
    }
    // provider
    getProviderConfig(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.persist.findProviderConfig({ assistantId: this.id, name });
        });
    }
    setProviderConfig(name, config) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.persist.upsertProviderConfig(this.id, name, config);
        });
    }
    // model
    listModel() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const custommodels = (_a = (yield this.persist.listModel({ condition: { assistantId: this.id } }))) === null || _a === void 0 ? void 0 : _a.rows;
            const models = yield this.context.listModel();
            const list = models === null || models === void 0 ? void 0 : models.map((model) => {
                const custommodel = custommodels === null || custommodels === void 0 ? void 0 : custommodels.find((m) => m.name === model.name);
                return {
                    assistantId: this.id,
                    name: (custommodel === null || custommodel === void 0 ? void 0 : custommodel.name) || model.name,
                    provider: (custommodel === null || custommodel === void 0 ? void 0 : custommodel.provider) || model.provider,
                    displayName: (custommodel === null || custommodel === void 0 ? void 0 : custommodel.displayName) || model.displayName,
                    schema: (custommodel === null || custommodel === void 0 ? void 0 : custommodel.schema) || model.schema,
                    enable: typeof (custommodel === null || custommodel === void 0 ? void 0 : custommodel.enable) === 'boolean' ? custommodel.enable : model.enable || false,
                    icon: (custommodel === null || custommodel === void 0 ? void 0 : custommodel.icon) || model.icon,
                    type: (custommodel === null || custommodel === void 0 ? void 0 : custommodel.type) || model.type,
                    createdAt: (custommodel === null || custommodel === void 0 ? void 0 : custommodel.createdAt) || model.createdAt,
                    updatedAt: (custommodel === null || custommodel === void 0 ? void 0 : custommodel.updatedAt) || model.updatedAt,
                    custom: model ? false : true
                };
            });
            custommodels === null || custommodels === void 0 ? void 0 : custommodels.forEach((model) => {
                const custommodel = Object.assign({}, model, {
                    custom: true
                });
                if (!models.find((m) => m.name === model.name)) {
                    list.push(custommodel);
                }
            });
            return list;
        });
    }
    getModel(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const models = yield this.listModel();
            const model = models === null || models === void 0 ? void 0 : models.find((model) => model.name === name);
            const custommodel = yield this.persist.findModel({ assistantId: this.id, name });
            if (!model && !custommodel)
                throw new Error(`[${this.id}] model not found: ${name}`);
            return {
                assistantId: this.id,
                name: (custommodel === null || custommodel === void 0 ? void 0 : custommodel.name) || model.name,
                provider: (custommodel === null || custommodel === void 0 ? void 0 : custommodel.provider) || model.provider,
                displayName: (custommodel === null || custommodel === void 0 ? void 0 : custommodel.displayName) || model.displayName,
                schema: (custommodel === null || custommodel === void 0 ? void 0 : custommodel.schema) || model.schema,
                enable: typeof (custommodel === null || custommodel === void 0 ? void 0 : custommodel.enable) === 'boolean' ? custommodel.enable : model.enable || false,
                icon: (custommodel === null || custommodel === void 0 ? void 0 : custommodel.icon) || model.icon,
                type: (custommodel === null || custommodel === void 0 ? void 0 : custommodel.type) || model.type,
                createdAt: (custommodel === null || custommodel === void 0 ? void 0 : custommodel.createdAt) || model.createdAt,
                updatedAt: (custommodel === null || custommodel === void 0 ? void 0 : custommodel.updatedAt) || model.updatedAt,
                custom: model ? false : true
            };
        });
    }
    upsertModel(name, values) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.persist.upsertModel(this.id, name, values);
            return yield this.getModel(name);
        });
    }
    removeModel(name) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.persist.removeModel(this.id, name);
        });
    }
    setModelEnabled(name, enable) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = yield this.getModel(name);
            if (!model)
                throw new Error(`[${this.id}] model not found: ${name}`);
            yield this.persist.setModelEnabled(this.id, name, enable);
        });
    }
    // model config
    getModelConfig(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.persist.findModelConfig({ assistantId: this.id, threadId: null, name });
            return doc === null || doc === void 0 ? void 0 : doc.config;
        });
    }
    setModelConfig(name, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = yield this.getModel(name);
            if (!model)
                throw new Error(`[${this.id}] model not found: ${name}`);
            if (!config) {
                yield this.persist.removeModelConfig(this.id, null, name);
            }
            else {
                yield this.persist.upsertModelConfig(this.id, null, name, config);
            }
        });
    }
    removeModelConfig(name) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.persist.removeModelConfig(this.id, null, name);
        });
    }
    // datastore
    listDataStore() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            logger.debug(`[${this.id}] listDataStore`);
            const filter = {
                condition: {
                    assistantId: this.id
                },
                offset: 0,
                limit: 50
            };
            const list = yield this.persist.listDataStore(filter);
            return ((_a = list === null || list === void 0 ? void 0 : list.rows) === null || _a === void 0 ? void 0 : _a.map((doc) => new DataStore_1.DataStore(this, doc, this.context))) || null;
        });
    }
    createDataStore(values) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(values === null || values === void 0 ? void 0 : values.name))
                throw new Error(`argument values.name is required`);
            const now = new Date();
            const vo = {
                assistantId: this.id,
                id: (0, spec_1.uniqid)(),
                owner: values.owner,
                name: values.name,
                createdAt: now,
                updatedAt: now
            };
            const doc = yield this.persist.createDataStore(vo);
            return null;
        });
    }
    getDataStore(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.persist.findDataStore({ assistantId: this.id, id });
            return doc && new DataStore_1.DataStore(this, doc, this.context);
        });
    }
    removeDataStore(id) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`[${this.id}] removeDataStore`, ansi_colors_1.default.cyan(JSON.stringify(id, null, 2)));
            yield this.persist.removeDataStore(this.id, id);
        });
    }
    // thread
    listThread(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`[assistant] listThread`, ansi_colors_1.default.cyan(JSON.stringify(filter, null, 2)));
            filter = filter || {
                condition: {},
                offset: 0,
                limit: 50,
                sort: '-updatedAt'
            };
            filter.condition = filter.condition || {};
            filter.condition.assistantId = this.id;
            return yield this.persist.listThread(filter);
        });
    }
    getThread(id) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`[${this.id}] getThread`, ansi_colors_1.default.cyan(JSON.stringify(id, null, 2)));
            const doc = yield this.persist.findThread({ assistantId: this.id, id });
            if (!doc)
                return null;
            return new Thread_1.Thread(this, doc, this.context);
        });
    }
    createThread(owner) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`[${this.id}] createThread`, ansi_colors_1.default.cyan(JSON.stringify(owner, null, 2)));
            const models = yield this.listModel();
            const model = models.find((m) => { var _a, _b; return m.name === ((_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.defaults) === null || _b === void 0 ? void 0 : _b.text); });
            const now = new Date();
            const vo = {
                assistantId: this.id,
                id: (0, spec_1.uniqid)(),
                model: model === null || model === void 0 ? void 0 : model.name,
                owner,
                createdAt: now,
                updatedAt: now
            };
            yield this.persist.createThread(vo);
            return yield this.getThread(vo.id);
        });
    }
    removeThread(id) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`[${this.id}] removeThread`, ansi_colors_1.default.cyan(JSON.stringify(id, null, 2)));
            const thread = yield this.persist.findThread({ id });
            if (!thread)
                throw new Error(`[${this.id}] thread not found: ${id}`);
            yield this.persist.removeThread(this.id, thread.id);
        });
    }
    // answer
    listAnswer(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`[${this.id}] listAnswer`, ansi_colors_1.default.cyan(JSON.stringify(filter, null, 2)));
            filter = filter || {
                condition: {},
                offset: 0,
                limit: 50
            };
            filter.condition = filter.condition || {};
            filter.condition.assistantId = this.id;
            return yield this.persist.listAnswer(filter);
        });
    }
    getAnswer(id) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`[${this.id}] getAnswer`, ansi_colors_1.default.cyan(JSON.stringify(id, null, 2)));
            return yield this.persist.findAnswer({ assistantId: this.id, id });
        });
    }
    removeAnswer(id) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`[${this.id}] removeAnswer`, ansi_colors_1.default.cyan(JSON.stringify(id, null, 2)));
            yield this.persist.removeAnswer(this.id, id);
        });
    }
    // database
    listDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    addDatabase(database) {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    removeDatabase(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    // usage
    listUsageByUser(uid, start, end, interval) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.persist.listUsageByUser(this.id, uid, { start, end, interval });
        });
    }
    listUsage(start, end, interval) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.persist.listUsage(this.id, { start, end, interval });
        });
    }
    // misc
    toJSON() {
        const doc = this.doc;
        if (!doc)
            return null;
        return {
            id: doc.id,
            owner: doc.owner,
            displayName: doc.displayName,
            name: doc.name,
            config: doc.config,
            info: doc.info,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        };
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
}
exports.Assistant = Assistant;
//# sourceMappingURL=Assistant.js.map