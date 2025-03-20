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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Store = void 0;
const string2sort_1 = __importDefault(require("./string2sort"));
const string2projection_1 = __importDefault(require("./string2projection"));
const LIMIT = 25;
const MAX_LIMIT = 500;
class Store {
    constructor(connector, collection) {
        this.connector = connector;
        this.collection = collection;
    }
    createIndex(index, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield this.getConnection();
            try {
                const collection = conn.getCollection(this.collection);
                yield collection.createIndex(index, options);
            }
            catch (err) {
                throw err;
            }
            finally {
                yield conn.close();
            }
        });
    }
    count(condition) {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield this.getConnection();
            try {
                const collection = conn.getCollection(this.collection);
                return yield collection.countDocuments(condition || {});
            }
            catch (err) {
                throw err;
            }
            finally {
                yield conn.close();
            }
        });
    }
    aggregate(pipeline, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, e_1, _b, _c;
            const conn = yield this.getConnection();
            try {
                const collection = conn.getCollection(this.collection);
                const cursor = yield collection.aggregate(pipeline, options);
                const docs = [];
                try {
                    for (var _d = true, cursor_1 = __asyncValues(cursor), cursor_1_1; cursor_1_1 = yield cursor_1.next(), _a = cursor_1_1.done, !_a; _d = true) {
                        _c = cursor_1_1.value;
                        _d = false;
                        const doc = _c;
                        docs.push(doc);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_d && !_a && (_b = cursor_1.return)) yield _b.call(cursor_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return docs;
            }
            catch (err) {
                throw err;
            }
            finally {
                yield conn.close();
            }
        });
    }
    list(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!filter)
                throw new Error(`illegal argument: filter is required`);
            if (!+filter.limit)
                filter.limit = LIMIT;
            if (+filter.limit > MAX_LIMIT)
                filter.limit = MAX_LIMIT;
            const conn = yield this.getConnection();
            try {
                const collection = conn.getCollection(this.collection);
                const cursor = collection.find(filter.condition || {}, {
                    skip: +filter.offset || 0,
                    limit: +filter.limit,
                    sort: (0, string2sort_1.default)(filter.sort),
                    projection: Object.assign({ _id: 0 }, (0, string2projection_1.default)(filter.fields))
                });
                const total = yield collection.countDocuments(filter.condition || {});
                const rows = yield cursor.toArray();
                return {
                    filter,
                    total,
                    rows
                };
            }
            catch (err) {
                throw err;
            }
            finally {
                yield conn.close();
            }
        });
    }
    find(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield this.getConnection();
            try {
                const collection = conn.getCollection(this.collection);
                const cursor = yield collection.find(filter.condition, {
                    skip: filter.offset || 0,
                    limit: filter.limit || LIMIT,
                    sort: (0, string2sort_1.default)(filter.sort),
                    projection: Object.assign({ _id: 0 }, (0, string2projection_1.default)(filter.fields))
                });
                return yield cursor.toArray();
            }
            catch (err) {
                throw err;
            }
            finally {
                yield conn.close();
            }
        });
    }
    findOne(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield this.getConnection();
            try {
                const collection = conn.getCollection(this.collection);
                return yield collection.findOne(filter.condition, {
                    skip: filter.offset || 0,
                    limit: 1,
                    sort: (0, string2sort_1.default)(filter.sort),
                    projection: Object.assign({ _id: 0 }, (0, string2projection_1.default)(filter.fields))
                });
            }
            catch (err) {
                throw err;
            }
            finally {
                yield conn.close();
            }
        });
    }
    insert(values) {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield this.getConnection();
            try {
                const collection = conn.getCollection(this.collection);
                yield collection.insertOne(values);
            }
            catch (err) {
                throw err;
            }
            finally {
                yield conn.close();
            }
        });
    }
    upsert(condition, values) {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield this.getConnection();
            try {
                if (!condition || Object.keys(condition).length === 0)
                    throw new Error('upsert condition cannot be empty object');
                const collection = conn.getCollection(this.collection);
                yield collection.updateOne(condition, values, { upsert: true });
            }
            catch (err) {
                throw err;
            }
            finally {
                yield conn.close();
            }
        });
    }
    updateOne(condition, values) {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield this.getConnection();
            try {
                if (!condition || Object.keys(condition).length === 0)
                    throw new Error('update condition cannot be empty object');
                const collection = conn.getCollection(this.collection);
                yield collection.updateOne(condition, values);
            }
            catch (err) {
                throw err;
            }
            finally {
                yield conn.close();
            }
        });
    }
    updateMany(condition, values) {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield this.getConnection();
            try {
                if (!condition || Object.keys(condition).length === 0)
                    throw new Error('update condition cannot be empty object');
                const collection = conn.getCollection(this.collection);
                yield collection.updateMany(condition, values);
            }
            catch (err) {
                throw err;
            }
            finally {
                yield conn.close();
            }
        });
    }
    replace(condition, values) {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield this.getConnection();
            try {
                if (!condition || Object.keys(condition).length === 0)
                    throw new Error('update condition cannot be empty object');
                const collection = conn.getCollection(this.collection);
                yield collection.replaceOne(condition, values);
            }
            catch (err) {
                throw err;
            }
            finally {
                yield conn.close();
            }
        });
    }
    remove(condition) {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield this.getConnection();
            try {
                if (!condition || Object.keys(condition).length === 0)
                    throw new Error('remove condition cannot be empty object');
                const collection = conn.getCollection(this.collection);
                const backup = conn.getCollection(`${this.collection}.backup`);
                const cursor = yield collection.find(condition);
                let doc = null;
                while ((doc = yield cursor.next())) {
                    delete doc._id;
                    yield backup.insertOne(Object.assign({}, doc, { _deleted: new Date(), _deleted_condition: condition }));
                }
                yield collection.deleteMany(condition);
            }
            catch (err) {
                throw err;
            }
            finally {
                yield conn.close();
            }
        });
    }
    getConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.connector.getConnection();
        });
    }
}
exports.Store = Store;
//# sourceMappingURL=Store.js.map