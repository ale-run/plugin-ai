import { ListFilter, DocumentList, AssistantInfo, ThreadInfo, Answer, AnyObject, Model, DataStoreInfo, Usage } from '../spec';
import { Store } from './Store';
export declare class AccessToken {
    assistantId: string;
    token: string;
    createdAt: Date;
    renewedAt?: Date;
}
export declare class ModelConfigDocument {
    assistantId: string;
    threadId: string;
    name: string;
    config: AnyObject;
    updatedAt: Date;
}
export declare class MongoAIPersistance {
    private tokens;
    private providers;
    private modelconfigs;
    private models;
    private assistants;
    private threads;
    private answers;
    private datastore;
    constructor(options: any);
    createAccessToken(assistantId: string): Promise<string>;
    getAccessToken(assistantId: string): Promise<string>;
    renewAccessToken(assistantId: string): Promise<string>;
    removeAccessToken(assistantId: string): Promise<void>;
    findProviderConfig(condition: AnyObject): Promise<AnyObject>;
    upsertProviderConfig(assistantId: string, name: string, config: AnyObject): Promise<AnyObject>;
    listModelConfig(condition: AnyObject): Promise<Array<ModelConfigDocument>>;
    findModelConfig(condition: AnyObject): Promise<ModelConfigDocument>;
    upsertModelConfig(assistantId: string, threadId: string, name: string, config: AnyObject): Promise<ModelConfigDocument>;
    removeModelConfig(assistantId: string, threadId: string, name: string): Promise<void>;
    listModel(filter?: ListFilter): Promise<DocumentList<Model>>;
    findModel(condition: AnyObject): Promise<Model>;
    upsertModel(assistantId: string, name: string, values: Model): Promise<Model>;
    setModelEnabled(assistantId: string, name: string, enable: boolean): Promise<void>;
    removeModel(assistantId: string, name: string): Promise<void>;
    listAssistant(filter?: ListFilter): Promise<DocumentList<AssistantInfo>>;
    findAssistant(condition: AnyObject): Promise<AssistantInfo>;
    createAssistant(values: AssistantInfo): Promise<AssistantInfo>;
    updateAssistant(id: string, values: AnyObject): Promise<AssistantInfo>;
    removeAssistant(id: string): Promise<void>;
    listThread(filter?: ListFilter): Promise<DocumentList<ThreadInfo>>;
    findThread(condition: AnyObject): Promise<ThreadInfo>;
    createThread(values: ThreadInfo): Promise<ThreadInfo>;
    updateThread(assistantId: string, id: string, values: AnyObject): Promise<ThreadInfo>;
    removeThread(assistantId: string, id: string): Promise<void>;
    listAnswer(filter?: ListFilter): Promise<DocumentList<Answer>>;
    findAnswer(condition: AnyObject): Promise<Answer>;
    createAnswer(values: Answer): Promise<Answer>;
    updateAnswer(assistantId: string, id: string, values: AnyObject): Promise<Answer>;
    removeAnswer(assistantId: string, id: string): Promise<void>;
    listDataStore(filter?: ListFilter): Promise<DocumentList<DataStoreInfo>>;
    findDataStore(condition: AnyObject): Promise<DataStoreInfo>;
    createDataStore(values: DataStoreInfo): Promise<DataStoreInfo>;
    updateDataStore(assistantId: string, id: string, values: AnyObject): Promise<DataStoreInfo>;
    removeDataStore(assistantId: string, id: string): Promise<void>;
    listUsageByUser(assistantId: string, uid: string, options?: {
        start: Date;
        end: Date;
        interval?: 'm' | 'h' | 'd' | string;
    }): Promise<Usage[]>;
    listUsage(assistantId: string, options?: {
        start: Date;
        end: Date;
        interval?: 'm' | 'h' | 'd' | string;
    }): Promise<Usage[]>;
    getStore(collection: string): Promise<Store>;
}
