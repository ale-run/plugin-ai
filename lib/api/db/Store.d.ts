import { AnyObject, ListFilter, DocumentList } from '../spec';
import { IndexSpecification, CreateIndexesOptions } from 'mongodb';
import { Connector } from './Connector';
export declare class Store {
    private collection;
    private connector;
    constructor(connector: Connector, collection: string);
    createIndex(index: IndexSpecification, options?: CreateIndexesOptions): Promise<void>;
    count(condition?: AnyObject): Promise<number>;
    aggregate<T>(pipeline?: AnyObject[], options?: AnyObject): Promise<T[]>;
    list<T>(filter: ListFilter): Promise<DocumentList<T>>;
    find<T>(filter: ListFilter): Promise<T[]>;
    findOne<T>(filter: ListFilter): Promise<T>;
    insert(values: AnyObject): Promise<void>;
    upsert(condition: AnyObject, values: AnyObject): Promise<void>;
    updateOne(condition: AnyObject, values: AnyObject): Promise<void>;
    updateMany(condition: AnyObject, values: AnyObject): Promise<void>;
    replace(condition: AnyObject, values: AnyObject): Promise<void>;
    remove(condition: AnyObject): Promise<void>;
    private getConnection;
}
