import { AnyObject, IAssistant, AssistantInfo, ProviderInfo, DocumentList, ListFilter, AssistantConfig, Model, Provider } from './spec';
import { MongoAIPersistance } from './db';
export declare class AIContextOptions {
    db: {
        url: string;
        db?: string;
    };
}
export declare class AIContext {
    readonly options: AIContextOptions;
    readonly persist: MongoAIPersistance;
    readonly providers: {
        [name: string]: Provider;
    };
    initialized: boolean;
    constructor(options: AIContextOptions);
    listAssistant(filter?: ListFilter): Promise<DocumentList<AssistantInfo>>;
    createAssistant(values: {
        name?: string;
        owner: string;
        displayName?: string;
        config?: AssistantConfig;
        info?: AnyObject;
    }): Promise<IAssistant>;
    getAssistant(id: string): Promise<IAssistant>;
    getAssistantByName(name: string): Promise<IAssistant>;
    getAssistantByUser(owner: string): Promise<IAssistant[]>;
    getProvider(name: string): Provider;
    listProvider(): ProviderInfo[];
    listModel(): Promise<Model[]>;
    removeAssistant(id: string): Promise<void>;
    getAccessToken(id: string): Promise<string>;
    renewAccessToken(id: string): Promise<string>;
    removeAccessToken(id: string): Promise<void>;
    registProvider(name: string, provider: Provider): Promise<void>;
    unregistProvider(name: string): Promise<void>;
}
