import { AssistantConfig, ThreadInfo, AssistantInfo, Usage, Model, Answer, Database } from './entity';
import { ListFilter, DocumentList, AnyObject } from './common';
import { IThread } from './IThread';
import { IDataStore } from './IDataStore';
export interface IAssistant extends AssistantInfo {
    updateConfig(config: AssistantConfig): Promise<AssistantConfig>;
    getProviderConfig(name: string): Promise<AnyObject>;
    setProviderConfig(name: string, config: AnyObject): Promise<void>;
    getModelConfig(name: string): Promise<AnyObject>;
    setModelConfig(name: string, config: AnyObject): Promise<void>;
    removeModelConfig(name: string): Promise<void>;
    setModelEnabled(name: string, enable: boolean): Promise<void>;
    listModel(): Promise<Model[]>;
    getModel(name: string): Promise<Model>;
    upsertModel(name: string, values: Model): Promise<Model>;
    removeModel(name: string): Promise<void>;
    listDataStore(): Promise<IDataStore[]>;
    createDataStore(values: {
        name?: string;
        owner: string;
    }): Promise<IDataStore>;
    getDataStore(id: string): Promise<IDataStore>;
    removeDataStore(id: string): Promise<void>;
    listThread(filter?: ListFilter): Promise<DocumentList<ThreadInfo>>;
    createThread(owner: string): Promise<IThread>;
    getThread(id: string): Promise<IThread>;
    removeThread(id: string): Promise<void>;
    listAnswer(filter?: ListFilter): Promise<DocumentList<Answer>>;
    getAnswer(id?: string): Promise<Answer>;
    removeAnswer(id: string): Promise<void>;
    listDatabase(): Promise<Database[]>;
    addDatabase(database: Database): Promise<void>;
    removeDatabase(id: string): Promise<void>;
    listUsageByUser(uid: string, start: Date, end: Date, interval?: 'm' | 'h' | 'd' | string): Promise<Usage[]>;
    listUsage(start: Date, end: Date, interval?: 'm' | 'h' | 'd' | string): Promise<Usage[]>;
}
