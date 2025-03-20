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
exports.Thread = void 0;
const spec_1 = require("./spec");
const Logger_1 = require("./Logger");
const ansi_colors_1 = __importDefault(require("ansi-colors"));
const stream_1 = require("stream");
const Download_1 = require("./Download");
const logger = Logger_1.Logger.getLogger('ai:thread');
class Thread {
    constructor(assistant, doc, context) {
        this.assistant = assistant;
        this.doc = doc;
        this.context = context;
    }
    get assistantId() {
        return this.doc.assistantId;
    }
    get id() {
        return this.doc.id;
    }
    get owner() {
        return this.doc.owner;
    }
    get participants() {
        return this.doc.participants;
    }
    get latest() {
        return this.doc.latest;
    }
    get model() {
        return this.doc.model;
    }
    get summary() {
        return this.doc.summary;
    }
    get archivedAt() {
        return this.doc.archivedAt;
    }
    get updatedAt() {
        return this.doc.updatedAt;
    }
    get createdAt() {
        return this.doc.createdAt;
    }
    get persist() {
        return this.context.persist;
    }
    getAssistant() {
        return this.assistant;
    }
    listAnswer(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`[thread/${this.assistantId}/${this.id}] listAnswer`, ansi_colors_1.default.cyan(JSON.stringify(filter, null, 2)));
            filter = filter || {
                condition: {},
                offset: 0,
                limit: 50
            };
            filter.condition = filter.condition || {};
            filter.condition.assistantId = this.assistant.id;
            filter.condition.threadId = this.id;
            return yield this.persist.listAnswer(filter);
        });
    }
    getAnswer(id) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`[thread/${this.assistantId}/${this.id}] getAnswer`, ansi_colors_1.default.cyan(JSON.stringify(id, null, 2)));
            const doc = yield this.persist.findAnswer({ id });
            if (!doc || doc.assistantId !== this.id)
                return null;
            return doc;
        });
    }
    removeAnswer(id) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`[thread/${this.assistantId}/${this.id}] removeAnswer`, ansi_colors_1.default.cyan(JSON.stringify(id, null, 2)));
            const answer = yield this.getAnswer(id);
            if (answer) {
                yield this.persist.removeAnswer(this.assistantId, answer.id);
            }
        });
    }
    getModelConfig(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = yield this.assistant.getModel(name);
            if (!model)
                return null;
            return yield this.persist.findModelConfig({ assistantId: this.id, threadId: this.id, name });
        });
    }
    setModelConfig(name, config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!config) {
                yield this.persist.removeModelConfig(this.assistantId, this.id, name);
            }
            else {
                yield this.persist.upsertModelConfig(this.assistantId, this.id, name, config);
            }
        });
    }
    run(ask) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('ask', JSON.stringify(ask, null, 2));
            const response = new stream_1.PassThrough();
            const answer = yield this.persist.createAnswer({
                id: (0, spec_1.uniqid)(),
                assistantId: this.assistant.id,
                threadId: this.id,
                status: spec_1.ANSWER_STATUS.inprogress,
                ask,
                temporary: ask.temporary === true ? true : false,
                createdAt: new Date()
            });
            (() => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                try {
                    const model = yield this.assistant.getModel(ask.model);
                    if (!model)
                        throw new Error(`[thread/${this.assistantId}/${this.id}] model "${ask.model}" not found`);
                    const provider = yield this.context.getProvider(model.provider);
                    const providerconfig = yield this.assistant.getProviderConfig(model.provider);
                    const config = Object.assign({}, providerconfig, yield this.getModelConfig(ask.model), model.config);
                    console.log('config', JSON.stringify(config, null, 2));
                    yield this.persist.updateAnswer(this.assistantId, answer.id, {
                        model: model.name
                    });
                    const messages = [];
                    if (ask.temporary !== true) {
                        const answers = yield this.listAnswer({
                            condition: {
                                temporary: { $ne: true },
                                $or: [{ error: null }, { error: { $exists: false } }],
                                result: { $exists: true },
                                completedAt: { $ne: true }
                            },
                            offset: 0,
                            limit: 50,
                            sort: 'createdAt',
                            fields: 'id result ask.prompt createdAt completedAt'
                        });
                        (_a = answers === null || answers === void 0 ? void 0 : answers.rows) === null || _a === void 0 ? void 0 : _a.forEach((o) => {
                            var _a;
                            if (!o.result || !((_a = o.ask) === null || _a === void 0 ? void 0 : _a.prompt))
                                return;
                            messages.unshift({
                                role: 'assistant',
                                content: typeof o.result === 'string' ? o.result : JSON.stringify(o.result)
                            });
                            messages.unshift({
                                role: 'user',
                                content: o.ask.prompt
                            });
                        });
                    }
                    // add system prompt
                    messages.unshift({
                        role: 'system',
                        content: "You are a helpful assistant. Respond to the user's questions in the language in which they were asked, and write responses to text in Markdown format."
                    });
                    const userMessages = [];
                    // add files to message
                    if ((_b = ask.files) === null || _b === void 0 ? void 0 : _b.length) {
                        for (const file of ask.files) {
                            const type = file.type;
                            const dataurl = yield (0, Download_1.downloadAsDataURL)(file.src);
                            userMessages.push({
                                type: 'image_url',
                                image_url: {
                                    url: dataurl
                                }
                            });
                        }
                    }
                    userMessages.push({
                        type: 'text',
                        text: ask.prompt
                    });
                    // add prompt
                    messages.push({
                        role: 'user',
                        content: userMessages
                    });
                    const store = yield this.persist.findDataStore({ name: ask.store });
                    const stream = yield provider.run({
                        thread: this,
                        ask,
                        config,
                        user: ask.user,
                        model: ask.model,
                        prompt: ask.prompt,
                        messages
                    });
                    yield this.persist.updateThread(this.assistantId, this.id, {
                        owner: this.owner || ask.user,
                        latest: ask,
                        updatedAt: new Date()
                    });
                    if (ask.streaming === false) {
                        //
                    }
                    stream
                        .on('data', (chunk) => {
                        response.write(chunk);
                    })
                        .on('error', (error) => __awaiter(this, void 0, void 0, function* () {
                        try {
                            yield this.persist.updateAnswer(this.assistantId, answer.id, {
                                status: spec_1.ANSWER_STATUS.error,
                                error: error.message
                            });
                            response.emit('error', error);
                        }
                        catch (err) {
                            logger.error(err);
                        }
                        finally {
                            response.end();
                        }
                    }))
                        .on('usage', (usage) => __awaiter(this, void 0, void 0, function* () {
                        yield this.persist.updateAnswer(this.assistantId, answer.id, {
                            usage
                        });
                        response.emit('usage', usage);
                    }))
                        .on('complete', (values) => __awaiter(this, void 0, void 0, function* () {
                        try {
                            logger.debug('complete', values);
                            answer.status = spec_1.ANSWER_STATUS.complete;
                            answer.raw = values.raw;
                            answer.result = values.result;
                            answer.usage = values.usage;
                            answer.annotations = values.annotations;
                            answer.completedAt = new Date();
                            yield this.persist.updateThread(this.assistantId, this.id, {
                                summary: values.summary,
                                channel: ask.channel,
                                updatedAt: answer.completedAt
                            });
                            yield this.persist.updateAnswer(this.assistantId, answer.id, {
                                status: spec_1.ANSWER_STATUS.complete,
                                raw: answer.raw,
                                result: answer.result,
                                usage: answer.usage,
                                annotations: answer.annotations,
                                completedAt: answer.completedAt
                            });
                            response.emit('complete', yield this.persist.findAnswer({ id: answer.id }));
                        }
                        catch (err) {
                            logger.error(err);
                            try {
                                yield this.persist.updateAnswer(this.assistantId, answer.id, {
                                    status: spec_1.ANSWER_STATUS.error,
                                    error: err.message
                                });
                            }
                            catch (err) {
                                logger.error(err);
                            }
                            response.emit('complete', yield this.persist.findAnswer({ id: answer.id }));
                        }
                        finally {
                            response.end();
                        }
                    }));
                }
                catch (err) {
                    logger.error(err);
                    try {
                        yield this.persist.updateAnswer(this.assistantId, answer.id, {
                            status: spec_1.ANSWER_STATUS.error,
                            error: err.message
                        });
                    }
                    catch (err) {
                        logger.error(err);
                    }
                    response.emit('complete', yield this.persist.findAnswer({ id: answer.id }));
                    response.end();
                }
            }))();
            return response;
        });
    }
    cancel(id) {
        return __awaiter(this, void 0, void 0, function* () {
            //
        });
    }
    reload() {
        return __awaiter(this, void 0, void 0, function* () {
            this.doc = yield this.persist.findThread({ id: this.id });
        });
    }
    // misc
    toJSON() {
        const doc = this.doc;
        if (!doc)
            return null;
        return {
            assistantId: doc.assistantId,
            id: doc.id,
            owner: doc.owner,
            model: doc.model,
            latest: doc.latest,
            summary: doc.summary,
            archivedAt: doc.archivedAt,
            updatedAt: doc.updatedAt,
            createdAt: doc.createdAt
        };
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
}
exports.Thread = Thread;
//# sourceMappingURL=Thread.js.map