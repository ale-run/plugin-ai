import { DataStoreInfo, FileAttach, WebPage, UserPermission, DatabaseQuery } from './entity';
import { IAssistant } from './IAssistant';
export interface IDataStore extends DataStoreInfo {
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
}
