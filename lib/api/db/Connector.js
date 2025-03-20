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
exports.Connector = exports.Connection = void 0;
const spec_1 = require("../spec");
const mongodb_1 = require("mongodb");
class Connection {
    constructor(db) {
        this.db = db;
    }
    getCollection(collection) {
        return this.db.collection(collection);
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            // no action
        });
    }
}
exports.Connection = Connection;
class Connector {
    constructor(url, dbname) {
        this.init = false;
        this.url = url;
        this.dbname = dbname;
    }
    getConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.init) {
                this.init = true;
                const client = new mongodb_1.MongoClient(this.url, { maxPoolSize: 30, minPoolSize: 0 });
                yield client.connect();
                this.db = client.db(this.dbname);
            }
            while (!this.db)
                yield (0, spec_1.sleep)(3000);
            return new Connection(this.db);
        });
    }
}
exports.Connector = Connector;
//# sourceMappingURL=Connector.js.map