import { IAssistant, IDataStore, DataStoreInfo, WebPage, FileAttach, UserPermission, DatabaseQuery } from './spec';
import { Assistant } from './Assistant';
import { AIContext } from './AIContext';
export declare class DataStore implements IDataStore {
    private assistant;
    private doc;
    private context;
    constructor(assistant: Assistant, doc: DataStoreInfo, context: AIContext);
    get assistantId(): string;
    get id(): string;
    get name(): string;
    get displayName(): string;
    get owner(): string;
    get permissions(): any[];
    get files(): FileAttach[];
    get webpages(): WebPage[];
    get queries(): DatabaseQuery[];
    get enable(): boolean;
    get createdAt(): Date;
    get updatedAt(): Date;
    private get persist();
    getAssistant(): IAssistant;
    changeName(name: string): Promise<void>;
    changeOwner(owner: string): Promise<void>;
    addPermission(permission: UserPermission): Promise<void>;
    removePermission(uid: string): Promise<void>;
    addFile(file: FileAttach): Promise<void>;
    removeFile(id: string): Promise<void>;
    listFile(): Promise<FileAttach[]>;
    addWebPage(url: string): Promise<void>;
    removeWebPage(id: string): Promise<void>;
    listWebPage(): Promise<WebPage[]>;
    listDatabaseQuery(): Promise<DatabaseQuery[]>;
    addDatabaseQuery(query: {
        database: string;
        query: string;
        instructions?: string;
    }): Promise<DatabaseQuery>;
    removeDatabaseQuery(id: string): Promise<void>;
    reindex(): Promise<void>;
    toJSON(): {
        assistantId: string;
        id: string;
        name: string;
        owner: string;
        permissions: UserPermission[];
        files: FileAttach[];
        webpages: WebPage[];
        queries: DatabaseQuery[];
        createdAt: Date;
        updatedAt: Date;
    };
    toString(): string;
}
