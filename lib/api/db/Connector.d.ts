import { Db, Collection } from 'mongodb';
export declare class Connection {
    private db;
    constructor(db: Db);
    getCollection(collection: string): Collection;
    close(): Promise<void>;
}
export declare class Connector {
    private init;
    private db;
    private url;
    private dbname;
    constructor(url: string, dbname: string);
    getConnection(): Promise<Connection>;
}
