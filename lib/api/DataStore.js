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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataStore = void 0;
class DataStore {
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
    get name() {
        return this.doc.name;
    }
    get displayName() {
        return this.doc.displayName;
    }
    get owner() {
        return this.doc.owner;
    }
    get permissions() {
        return this.doc.permissions;
    }
    get files() {
        return this.doc.files;
    }
    get webpages() {
        return this.doc.webpages;
    }
    get queries() {
        return this.doc.queries;
    }
    get enable() {
        return this.doc.enable;
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
    getAssistant() {
        return this.assistant;
    }
    changeName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    changeOwner(owner) {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    addPermission(permission) {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    removePermission(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    addFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    removeFile(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    listFile() {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    addWebPage(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    removeWebPage(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    listWebPage() {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    listDatabaseQuery() {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    addDatabaseQuery(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    removeDatabaseQuery(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    reindex() {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
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
            name: doc.name,
            owner: doc.owner,
            permissions: doc.permissions,
            files: doc.files,
            webpages: doc.webpages,
            queries: doc.queries,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        };
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
}
exports.DataStore = DataStore;
//# sourceMappingURL=DataStore.js.map