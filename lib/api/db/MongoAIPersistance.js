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
exports.MongoAIPersistance = exports.ModelConfigDocument = exports.AccessToken = void 0;
const spec_1 = require("../spec");
const Connector_1 = require("./Connector");
const Store_1 = require("./Store");
const string2date_1 = __importDefault(require("./string2date"));
class AccessToken {
}
exports.AccessToken = AccessToken;
class ModelConfigDocument {
}
exports.ModelConfigDocument = ModelConfigDocument;
class MongoAIPersistance {
    constructor(options) {
        if (!options || typeof options !== 'object')
            throw new Error('options must be an object');
        if (!options.url || typeof options.url !== 'string')
            throw new Error('options.url required');
        const connector = new Connector_1.Connector(options.url, options.db);
        this.tokens = new Store_1.Store(connector, 'ai-token');
        this.tokens.createIndex({ id: 1 }, { unique: true });
        this.tokens.createIndex({ createdAt: -1 });
        this.providers = new Store_1.Store(connector, 'ai-provider-config');
        this.providers.createIndex({ assistantId: 1, name: 1 }, { unique: true });
        this.providers.createIndex({ updatedAt: -1 });
        this.modelconfigs = new Store_1.Store(connector, 'ai-model-config');
        this.modelconfigs.createIndex({ assistantId: 1, threadId: 1, name: 1 }, { unique: true });
        this.modelconfigs.createIndex({ updatedAt: -1 });
        this.models = new Store_1.Store(connector, 'ai-model');
        this.models.createIndex({ assistantId: 1, name: 1 }, { unique: true });
        this.models.createIndex({ provider: 1 });
        this.models.createIndex({ createdAt: -1 });
        this.models.createIndex({ updatedAt: -1 });
        this.assistants = new Store_1.Store(connector, 'ai');
        this.assistants.createIndex({ id: 1 }, { unique: true });
        this.assistants.createIndex({ name: 1 }, { unique: true });
        this.assistants.createIndex({ createdAt: -1 });
        this.threads = new Store_1.Store(connector, 'ai-thread');
        this.threads.createIndex({ id: 1 }, { unique: true });
        this.threads.createIndex({ assistantId: 1 });
        this.threads.createIndex({ createdAt: -1 });
        this.answers = new Store_1.Store(connector, 'ai-answer');
        this.answers.createIndex({ id: 1 }, { unique: true });
        this.answers.createIndex({ threadId: 1 });
        this.answers.createIndex({ createdAt: -1 });
        this.answers.createIndex({ completedAt: -1 });
        this.datastore = new Store_1.Store(connector, 'ai-datastore');
        this.datastore.createIndex({ id: 1 }, { unique: true });
        this.datastore.createIndex({ assistantId: 1 });
        this.datastore.createIndex({ createdAt: -1 });
    }
    // access token
    createAccessToken(assistantId) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.tokens.findOne({
                condition: { assistantId },
                sort: '-createdAt'
            });
            if (doc)
                throw new Error(`already exist access token: ${assistantId}`);
            const token = `AIP-${(0, spec_1.uniqid)()}`;
            yield this.tokens.insert({
                assistantId,
                token,
                createdAt: new Date()
            });
            return token;
        });
    }
    getAccessToken(assistantId) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.tokens.findOne({
                condition: { assistantId },
                sort: '-createdAt'
            });
            return (doc === null || doc === void 0 ? void 0 : doc.token) || null;
        });
    }
    renewAccessToken(assistantId) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.getAccessToken(assistantId);
            if (!token)
                throw new Error(`access token not found: ${assistantId}`);
            const newToken = `AIP-${(0, spec_1.uniqid)()}`;
            yield this.tokens.updateOne({ assistantId }, {
                token: newToken,
                renewedAt: new Date()
            });
            return newToken;
        });
    }
    removeAccessToken(assistantId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!assistantId)
                throw new Error(`argument assistantId is required`);
            const token = yield this.getAccessToken(assistantId);
            if (!token)
                throw new Error(`access token not found: ${assistantId}`);
            yield this.tokens.remove({ assistantId });
        });
    }
    // provider config
    findProviderConfig(condition) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.providers.findOne({
                condition,
                sort: 'createdAt'
            });
            return doc === null || doc === void 0 ? void 0 : doc.config;
        });
    }
    upsertProviderConfig(assistantId, name, config) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.providers.upsert({ assistantId, name }, {
                $set: {
                    assistantId,
                    name,
                    config,
                    updatedAt: new Date()
                }
            });
            return yield this.findModelConfig({ assistantId, name });
        });
    }
    // model config
    listModelConfig(condition) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.modelconfigs.list({
                condition,
                sort: 'createdAt'
            });
            return doc === null || doc === void 0 ? void 0 : doc.rows;
        });
    }
    findModelConfig(condition) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.modelconfigs.findOne({
                condition,
                sort: 'createdAt'
            });
            return doc;
        });
    }
    upsertModelConfig(assistantId, threadId, name, config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!assistantId)
                throw new Error(`argument assistantId is required`);
            if (!name)
                throw new Error(`argument name is required`);
            yield this.modelconfigs.upsert({ assistantId, threadId, name }, {
                $set: {
                    assistantId,
                    threadId: threadId || null,
                    name,
                    config,
                    updatedAt: new Date()
                }
            });
            return yield this.findModelConfig({ assistantId, threadId, name });
        });
    }
    removeModelConfig(assistantId, threadId, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!assistantId)
                throw new Error(`argument assistantId is required`);
            if (!name)
                throw new Error(`argument name is required`);
            const doc = yield this.findModelConfig({ assistantId, threadId, name });
            if (!doc)
                throw new Error(`model ${name} not found`);
            yield this.modelconfigs.remove({ assistantId, threadId, name });
        });
    }
    // models
    listModel(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            filter = filter || { condition: {} };
            if ((_a = filter.condition) === null || _a === void 0 ? void 0 : _a.createdAt)
                filter.condition.createdAt = (0, string2date_1.default)(filter.condition.createdAt);
            if ((_b = filter.condition) === null || _b === void 0 ? void 0 : _b.updatedAt)
                filter.condition.updatedAt = (0, string2date_1.default)(filter.condition.updatedAt);
            filter.sort = filter.sort || '-createdAt';
            return yield this.models.list(filter);
        });
    }
    findModel(condition) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.models.findOne({
                condition,
                sort: 'createdAt'
            });
            return doc;
        });
    }
    upsertModel(assistantId, name, values) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!assistantId)
                throw new Error(`argument assistantId is required`);
            if (!name)
                throw new Error(`argument name is required`);
            if (!values)
                throw new Error(`argument values is required`);
            if (!name)
                throw new Error(`argument name is required`);
            yield this.models.upsert({ assistantId, name }, {
                $set: Object.assign({}, values, {
                    assistantId,
                    name,
                    updatedAt: new Date()
                })
            });
            return yield this.findModel({ assistantId, name });
        });
    }
    setModelEnabled(assistantId, name, enable) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!assistantId)
                throw new Error(`argument assistantId is required`);
            if (!name)
                throw new Error(`argument name is required`);
            yield this.models.upsert({ assistantId, name }, {
                $set: {
                    assistantId,
                    name,
                    enable,
                    updatedAt: new Date()
                }
            });
        });
    }
    removeModel(assistantId, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!assistantId)
                throw new Error(`argument assistantId is required`);
            if (!name)
                throw new Error(`argument name is required`);
            const doc = yield this.findModel({ assistantId, name });
            if (!doc)
                throw new Error(`model ${name} not found`);
            yield this.models.remove({ assistantId, name });
        });
    }
    // assistants
    listAssistant(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            filter = filter || { condition: {} };
            if ((_a = filter.condition) === null || _a === void 0 ? void 0 : _a.createdAt)
                filter.condition.createdAt = (0, string2date_1.default)(filter.condition.createdAt);
            if ((_b = filter.condition) === null || _b === void 0 ? void 0 : _b.updatedAt)
                filter.condition.updatedAt = (0, string2date_1.default)(filter.condition.updatedAt);
            filter.sort = filter.sort || '-updatedAt';
            return yield this.assistants.list(filter);
        });
    }
    findAssistant(condition) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.assistants.findOne({
                condition,
                sort: '-updatedAt'
            });
            return doc;
        });
    }
    createAssistant(values) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!values)
                throw new Error(`argument values is required`);
            if (!values.id)
                throw new Error(`values.id is required`);
            const doc = Object.assign({}, values, {
                createdAt: new Date()
            });
            yield this.assistants.insert(doc);
            return doc;
        });
    }
    updateAssistant(id, values) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id)
                throw new Error(`argument id is required`);
            if (!values)
                throw new Error(`argument values is required`);
            const exists = yield this.findAssistant({ id });
            if (!exists)
                throw new Error(`assistant ${id} not found`);
            delete values.id;
            yield this.assistants.updateOne({ id }, {
                $set: Object.assign({}, values, { updatedAt: new Date() })
            });
            return yield this.findAssistant({ id });
        });
    }
    removeAssistant(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id)
                throw new Error(`argument id is required`);
            const exists = yield this.findAssistant({ id });
            if (!exists)
                throw new Error(`assistant ${id} not found`);
            yield this.assistants.remove({ id });
        });
    }
    // threads
    listThread(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            filter = filter || { condition: {} };
            if ((_a = filter.condition) === null || _a === void 0 ? void 0 : _a.createdAt)
                filter.condition.createdAt = (0, string2date_1.default)(filter.condition.createdAt);
            if ((_b = filter.condition) === null || _b === void 0 ? void 0 : _b.updatedAt)
                filter.condition.updatedAt = (0, string2date_1.default)(filter.condition.updatedAt);
            filter.sort = filter.sort || '-updatedAt';
            return yield this.threads.list(filter);
        });
    }
    findThread(condition) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.threads.findOne({
                condition,
                sort: '-updatedAt'
            });
            return doc;
        });
    }
    createThread(values) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!values)
                throw new Error(`argument values is required`);
            if (!values.id)
                throw new Error(`values.id is required`);
            const doc = Object.assign({}, values, {
                createdAt: new Date()
            });
            yield this.threads.insert(doc);
            return doc;
        });
    }
    updateThread(assistantId, id, values) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!assistantId)
                throw new Error(`argument assistantId is required`);
            if (!id)
                throw new Error(`argument id is required`);
            if (!values)
                throw new Error(`argument values is required`);
            const exists = yield this.findThread({ id });
            if (!exists)
                throw new Error(`thread ${id} not found`);
            delete values.id;
            yield this.threads.updateOne({ assistantId, id }, {
                $set: Object.assign({}, values, { updatedAt: new Date() })
            });
            return yield this.findThread({ id });
        });
    }
    removeThread(assistantId, id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!assistantId)
                throw new Error(`argument assistantId is required`);
            if (!id)
                throw new Error(`argument id is required`);
            const exists = yield this.findThread({ assistantId, id });
            if (!exists)
                throw new Error(`thread ${assistantId}/${id} not found`);
            yield this.threads.remove({ assistantId, id });
        });
    }
    // messages
    listAnswer(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            filter = filter || { condition: {} };
            if ((_a = filter.condition) === null || _a === void 0 ? void 0 : _a.createdAt)
                filter.condition.createdAt = (0, string2date_1.default)(filter.condition.createdAt);
            if ((_b = filter.condition) === null || _b === void 0 ? void 0 : _b.updatedAt)
                filter.condition.updatedAt = (0, string2date_1.default)(filter.condition.updatedAt);
            filter.sort = filter.sort || '-createdAt';
            // filter.limit = filter.limit || 50;
            const list = yield this.answers.list(filter);
            list.rows = ((_c = list.rows) === null || _c === void 0 ? void 0 : _c.reverse()) || [];
            return list;
        });
    }
    findAnswer(condition) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.answers.findOne({
                condition,
                sort: '-createdAt'
            });
            return doc;
        });
    }
    createAnswer(values) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!values)
                throw new Error(`argument values is required`);
            if (!values.id)
                throw new Error(`values.id is required`);
            const doc = Object.assign({}, values, {
                createdAt: new Date()
            });
            yield this.answers.insert(doc);
            return doc;
        });
    }
    updateAnswer(assistantId, id, values) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!assistantId)
                throw new Error(`argument assistantId is required`);
            if (!id)
                throw new Error(`argument id is required`);
            if (!values)
                throw new Error(`argument values is required`);
            const exists = yield this.findAnswer({ id });
            if (!exists)
                throw new Error(`answer ${id} not found`);
            delete values.id;
            yield this.answers.updateOne({ assistantId, id }, {
                $set: Object.assign({}, values, { updatedAt: new Date() })
            });
            return yield this.findAnswer({ assistantId, id });
        });
    }
    removeAnswer(assistantId, id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!assistantId)
                throw new Error(`argument assistantId is required`);
            if (!id)
                throw new Error(`argument id is required`);
            const exists = yield this.findAnswer({ assistantId, id });
            if (!exists)
                throw new Error(`answer ${assistantId}/${id} not found`);
            yield this.answers.remove({ assistantId, id });
        });
    }
    // DataStore
    listDataStore(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            filter = filter || { condition: {} };
            if ((_a = filter.condition) === null || _a === void 0 ? void 0 : _a.createdAt)
                filter.condition.createdAt = (0, string2date_1.default)(filter.condition.createdAt);
            if ((_b = filter.condition) === null || _b === void 0 ? void 0 : _b.updatedAt)
                filter.condition.updatedAt = (0, string2date_1.default)(filter.condition.updatedAt);
            filter.sort = filter.sort || '-createdAt';
            return yield this.datastore.list(filter);
        });
    }
    findDataStore(condition) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.datastore.findOne({
                condition,
                sort: '-createdAt'
            });
            return doc;
        });
    }
    createDataStore(values) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!values)
                throw new Error(`argument values is required`);
            if (!values.name)
                throw new Error(`values.id is required`);
            const doc = Object.assign({}, values, {
                createdAt: new Date()
            });
            yield this.datastore.insert(doc);
            return doc;
        });
    }
    updateDataStore(assistantId, id, values) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!assistantId)
                throw new Error(`argument assistantId is required`);
            if (!id)
                throw new Error(`argument id is required`);
            if (!values)
                throw new Error(`argument values is required`);
            const exists = yield this.findDataStore({ assistantId, id });
            if (!exists)
                throw new Error(`datastore ${assistantId}/${id} not found`);
            delete values.id;
            yield this.datastore.updateOne({ id }, {
                $set: Object.assign({}, values, { updatedAt: new Date() })
            });
            return yield this.findDataStore({ assistantId, id });
        });
    }
    removeDataStore(assistantId, id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!assistantId)
                throw new Error(`argument assistantId is required`);
            if (!id)
                throw new Error(`argument name is required`);
            const exists = yield this.findDataStore({ assistantId, id });
            if (!exists)
                throw new Error(`datastore ${assistantId}/${id} not found`);
            yield this.datastore.remove({ assistantId, id });
        });
    }
    listUsageByUser(assistantId, uid, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!assistantId)
                throw new Error(`argument assistantId is required`);
            if ((options === null || options === void 0 ? void 0 : options.start) && !((options === null || options === void 0 ? void 0 : options.start) instanceof Date))
                throw new Error(`argument options.start must be a date`);
            if ((options === null || options === void 0 ? void 0 : options.end) && !((options === null || options === void 0 ? void 0 : options.end) instanceof Date))
                throw new Error(`argument options.start must be a date`);
            const now = new Date();
            const end = (options === null || options === void 0 ? void 0 : options.end) ? options.end : now;
            const start = (options === null || options === void 0 ? void 0 : options.start) ? options.start : new Date(end.setMonth(end.getMonth() - 1));
            const pipeline = [
                {
                    $match: {
                        assistantId,
                        'ask.uid': uid,
                        'completedAt': {
                            $gte: start,
                            $lt: end
                        }
                    }
                },
                {
                    $facet: {
                        channelStats: [
                            {
                                $group: {
                                    _id: {
                                        date: {
                                            $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Seoul' }
                                        },
                                        channel: '$ask.channel'
                                    },
                                    input: { $sum: '$usage.input' },
                                    output: { $sum: '$usage.output' },
                                    total: { $sum: '$usage.total' }
                                }
                            },
                            {
                                $group: {
                                    _id: '$_id.date',
                                    channels: {
                                        $push: {
                                            channel: '$_id.channel',
                                            tokens: {
                                                input: '$input',
                                                output: '$output',
                                                total: '$total'
                                            }
                                        }
                                    },
                                    dailyTotalInput: { $sum: '$input' },
                                    dailyTotalOutput: { $sum: '$output' },
                                    dailyTotalTokens: { $sum: '$total' }
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    date: '$_id',
                                    channels: 1,
                                    dailyTotal: {
                                        input: '$dailyTotalInput',
                                        output: '$dailyTotalOutput',
                                        total: '$dailyTotalTokens'
                                    }
                                }
                            },
                            { $sort: { date: 1 } }
                        ],
                        modelStats: [
                            {
                                $group: {
                                    _id: {
                                        date: {
                                            $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Seoul' }
                                        },
                                        model: '$model'
                                    },
                                    input: { $sum: '$usage.input' },
                                    output: { $sum: '$usage.output' },
                                    total: { $sum: '$usage.total' }
                                }
                            },
                            {
                                $group: {
                                    _id: '$_id.date',
                                    models: {
                                        $push: {
                                            model: '$_id.model',
                                            tokens: {
                                                input: '$input',
                                                output: '$output',
                                                total: '$total'
                                            }
                                        }
                                    }
                                }
                            },
                            { $sort: { _id: 1 } },
                            {
                                $project: {
                                    _id: 0,
                                    date: '$_id',
                                    models: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        combined: {
                            $map: {
                                input: { $range: [0, { $size: '$channelStats' }] },
                                as: 'idx',
                                in: {
                                    date: { $arrayElemAt: ['$channelStats.date', '$$idx'] },
                                    channels: { $arrayElemAt: ['$channelStats.channels', '$$idx'] },
                                    models: { $arrayElemAt: ['$modelStats.models', '$$idx'] },
                                    dailyTotal: { $arrayElemAt: ['$channelStats.dailyTotal', '$$idx'] }
                                }
                            }
                        }
                    }
                },
                { $unwind: '$combined' },
                { $sort: { 'combined.date': 1 } }
            ];
            const result = yield this.answers.aggregate(pipeline);
            return result.map((day) => ({
                date: day.combined.date,
                users: null,
                channels: day.combined.channels.map((c) => ({
                    channel: c.channel,
                    tokens: c.tokens,
                    percentage: (c.tokens / day.combined.dailyTotal) * 100
                })),
                models: day.combined.models.map((m) => ({
                    model: m.model,
                    tokens: m.tokens,
                    percentage: (m.tokens / day.combined.dailyTotal) * 100
                })),
                total: day.combined.dailyTotal
            }));
        });
    }
    listUsage(assistantId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!assistantId)
                throw new Error(`argument assistantId is required`);
            if ((options === null || options === void 0 ? void 0 : options.start) && !((options === null || options === void 0 ? void 0 : options.start) instanceof Date))
                throw new Error(`argument options.start must be a date`);
            if ((options === null || options === void 0 ? void 0 : options.end) && !((options === null || options === void 0 ? void 0 : options.end) instanceof Date))
                throw new Error(`argument options.start must be a date`);
            const now = new Date();
            const end = (options === null || options === void 0 ? void 0 : options.end) ? options.end : now;
            const start = (options === null || options === void 0 ? void 0 : options.start) ? options.start : new Date(end.setMonth(end.getMonth() - 1));
            const pipeline = [
                {
                    $match: {
                        assistantId,
                        completedAt: {
                            $gte: start,
                            $lt: end
                        }
                    }
                },
                {
                    $facet: {
                        channelStats: [
                            {
                                $group: {
                                    _id: {
                                        date: {
                                            $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Seoul' }
                                        },
                                        channel: '$ask.channel'
                                    },
                                    input: { $sum: '$usage.input' },
                                    output: { $sum: '$usage.output' },
                                    total: { $sum: '$usage.total' }
                                }
                            },
                            {
                                $group: {
                                    _id: '$_id.date',
                                    channels: {
                                        $push: {
                                            channel: '$_id.channel',
                                            tokens: {
                                                input: '$input',
                                                output: '$output',
                                                total: '$total'
                                            }
                                        }
                                    },
                                    dailyTotalInput: { $sum: '$input' },
                                    dailyTotalOutput: { $sum: '$output' },
                                    dailyTotalTokens: { $sum: '$total' }
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    date: '$_id',
                                    channels: 1,
                                    dailyTotal: {
                                        input: '$dailyTotalInput',
                                        output: '$dailyTotalOutput',
                                        total: '$dailyTotalTokens'
                                    }
                                }
                            },
                            { $sort: { date: 1 } }
                        ],
                        modelStats: [
                            {
                                $group: {
                                    _id: {
                                        date: {
                                            $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Seoul' }
                                        },
                                        model: '$model'
                                    },
                                    input: { $sum: '$usage.input' },
                                    output: { $sum: '$usage.output' },
                                    total: { $sum: '$usage.total' }
                                }
                            },
                            {
                                $group: {
                                    _id: '$_id.date',
                                    models: {
                                        $push: {
                                            model: '$_id.model',
                                            tokens: {
                                                input: '$input',
                                                output: '$output',
                                                total: '$total'
                                            }
                                        }
                                    }
                                }
                            },
                            { $sort: { _id: 1 } },
                            {
                                $project: {
                                    _id: 0,
                                    date: '$_id',
                                    models: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        combined: {
                            $map: {
                                input: { $range: [0, { $size: '$channelStats' }] },
                                as: 'idx',
                                in: {
                                    date: { $arrayElemAt: ['$channelStats.date', '$$idx'] },
                                    channels: { $arrayElemAt: ['$channelStats.channels', '$$idx'] },
                                    models: { $arrayElemAt: ['$modelStats.models', '$$idx'] },
                                    dailyTotal: { $arrayElemAt: ['$channelStats.dailyTotal', '$$idx'] }
                                }
                            }
                        }
                    }
                },
                { $unwind: '$combined' },
                { $sort: { 'combined.date': 1 } }
            ];
            const result = yield this.answers.aggregate(pipeline);
            return result.map((day) => ({
                date: day.combined.date,
                users: null,
                channels: day.combined.channels.map((c) => ({
                    channel: c.channel,
                    tokens: c.tokens,
                    percentage: (c.tokens / day.combined.dailyTotal) * 100
                })),
                models: day.combined.models.map((m) => ({
                    model: m.model,
                    tokens: m.tokens,
                    percentage: (m.tokens / day.combined.dailyTotal) * 100
                })),
                total: day.combined.dailyTotal
            }));
        });
    }
    getStore(collection) {
        return __awaiter(this, void 0, void 0, function* () {
            const store = this[collection];
            if (!store || !(store instanceof Store_1.Store))
                throw new Error(`store "${collection}" not found`);
            return store;
        });
    }
}
exports.MongoAIPersistance = MongoAIPersistance;
//# sourceMappingURL=MongoAIPersistance.js.map