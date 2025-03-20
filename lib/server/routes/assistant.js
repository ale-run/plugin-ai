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
const express_1 = __importDefault(require("express"));
const express_asyncify_1 = __importDefault(require("express-asyncify"));
exports.default = (api) => {
    return ((0, express_asyncify_1.default)(express_1.default.Router({ mergeParams: true }))
        .use((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const id = req.params.id;
        if (!id)
            return res.send();
        const assistant = yield api.getAssistant(id);
        if (!assistant)
            return res.send();
        req['assistant'] = assistant;
        next();
    }))
        .get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.send(req['assistant']);
    }))
        .put('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        res.send(yield assistant.updateConfig(req.body));
    }))
        // provider
        .get('/provider/:name', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        res.send(yield assistant.getProviderConfig(req.params.name));
    }))
        .put('/provider/:name', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        res.send(yield assistant.setProviderConfig(req.params.name, req.body));
    }))
        // modelconfig
        .get('/modelconfig/:name', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        res.send(yield assistant.getModelConfig(req.params.name));
    }))
        .put('/modelconfig/:name', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        res.send(yield assistant.setModelConfig(req.params.name, req.body));
    }))
        .delete('/modelconfig/:name', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        res.send(yield assistant.removeModelConfig(req.params.name));
    }))
        // model
        .get('/model', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        res.send(yield assistant.listModel());
    }))
        .get('/model/:name', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        res.send(yield assistant.getModel(req.params.name));
    }))
        .put('/model/:name', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        res.send(yield assistant.upsertModel(req.params.name, req.body));
    }))
        .put('/model/:name/enable', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        res.send(yield assistant.setModelEnabled(req.params.name, req.body.enable === true ? true : false));
    }))
        .delete('/model/:name', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        res.send(yield assistant.removeModel(req.params.name));
    }))
        // datastore
        .post('/datastore', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        res.send(yield assistant.createDataStore(req.body));
    }))
        .get('/datastore', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        res.send(yield assistant.listDataStore());
    }))
        .get('/datastore/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        res.send(yield assistant.getDataStore(req.params.id));
    }))
        .delete('/datastore/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        res.send(yield assistant.removeDataStore(req.params.id));
    }))
        // datastore permission
        .post('/datastore/:id/permission', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        const datastore = yield assistant.getDataStore(req.params.id);
        res.send(yield datastore.addPermission(req.body));
    }))
        .delete('/datastore/:id/permission/:uid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        const datastore = yield assistant.getDataStore(req.params.id);
        res.send(yield datastore.removePermission(req.params.uid));
    }))
        // datastore file
        .get('/datastore/:id/file', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        const datastore = yield assistant.getDataStore(req.params.id);
        res.send(yield datastore.listFile());
    }))
        .post('/datastore/:id/file', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        const datastore = yield assistant.getDataStore(req.params.id);
        res.send(yield datastore.addFile(req.body));
    }))
        .delete('/datastore/:id/file/:oid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        const datastore = yield assistant.getDataStore(req.params.id);
        res.send(yield datastore.removeFile(req.params.oid));
    }))
        // datastore webpage
        .get('/datastore/:id/webpage', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        const datastore = yield assistant.getDataStore(req.params.id);
        res.send(yield datastore.listWebPage());
    }))
        .post('/datastore/:id/webpage', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        const datastore = yield assistant.getDataStore(req.params.id);
        res.send(yield datastore.addWebPage(req.body));
    }))
        .delete('/datastore/:id/webpage/:oid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        const datastore = yield assistant.getDataStore(req.params.id);
        res.send(yield datastore.removeWebPage(req.params.oid));
    }))
        // datastore query
        .get('/datastore/:id/query', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        const datastore = yield assistant.getDataStore(req.params.id);
        res.send(yield datastore.listDatabaseQuery());
    }))
        .post('/datastore/:id/query', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        const datastore = yield assistant.getDataStore(req.params.id);
        res.send(yield datastore.addDatabaseQuery(req.body));
    }))
        .delete('/datastore/:id/query/:oid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        const datastore = yield assistant.getDataStore(req.params.id);
        res.send(yield datastore.removeDatabaseQuery(req.params.oid));
    }))
        // datastore reindex
        .put('/datastore/:id/reindex', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        const datastore = yield assistant.getDataStore(req.params.id);
        res.send(yield datastore.reindex());
    }))
        // answer
        .get('/answer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        res.send(yield assistant.listAnswer(req.body));
    }))
        .get('/answer/:answerid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        res.send(yield assistant.getAnswer(req.params.answerid));
    }))
        .delete('/answer/:answerid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        res.send(yield assistant.removeAnswer(req.params.answerid));
    }))
        // thread
        .post('/thread', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        res.send(yield assistant.createThread(req.body.owner));
    }))
        .get('/thread', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        res.send(yield assistant.listThread());
    }))
        .use('/thread/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const id = req.params.id;
        if (!id)
            return res.send();
        const assistant = req['assistant'];
        const thread = yield assistant.getThread(id);
        if (!thread)
            return res.send();
        req['thread'] = thread;
        next();
    }))
        .get('/thread/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const thread = req['thread'];
        res.send(thread);
    }))
        .delete('/thread/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        const thread = req['thread'];
        res.send(yield assistant.removeThread(thread.id));
    }))
        // answer
        .get('/thread/:id/answer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const thread = req['thread'];
        res.send(yield thread.listAnswer(req.body));
    }))
        .get('/thread/:id/answer/:answerid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const thread = req['thread'];
        res.send(yield thread.getAnswer(req.params.answerid));
    }))
        .put('/thread/:id/answer/:answerid/cancel', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const thread = req['thread'];
        res.send(yield thread.cancel(req.params.answerid));
    }))
        .delete('/thread/:id/answer/:answerid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const thread = req['thread'];
        res.send(yield thread.removeAnswer(req.params.answerid));
    }))
        .post('/thread/:id/run', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const thread = req['thread'];
        res.send(yield thread.run(req.body));
    }))
        // usage
        .get('/usage', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const assistant = req['assistant'];
        const start = req.query.start ? new Date(req.query.start) : null;
        const end = req.query.end ? new Date(req.query.end) : null;
        res.send(yield assistant.listUsage(start, end));
    })));
};
//# sourceMappingURL=assistant.js.map