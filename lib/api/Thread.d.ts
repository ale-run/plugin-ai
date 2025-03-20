import { IAssistant, ThreadInfo, IThread, Answer, DocumentList, AnyObject, ListFilter, Ask, AskSync, AskStreaming, StreamResponse } from './spec';
import { Assistant } from './Assistant';
import { AIContext } from './AIContext';
export declare class Thread implements IThread {
    private assistant;
    private doc;
    private context;
    constructor(assistant: Assistant, doc: ThreadInfo, context: AIContext);
    get assistantId(): string;
    get id(): string;
    get owner(): string;
    get participants(): string[];
    get latest(): Ask;
    get model(): string;
    get summary(): string;
    get archivedAt(): Date;
    get updatedAt(): Date;
    get createdAt(): Date;
    private get persist();
    getAssistant(): IAssistant;
    listAnswer(filter: ListFilter): Promise<DocumentList<Answer>>;
    getAnswer(id?: string): Promise<Answer>;
    removeAnswer(id: string): Promise<void>;
    getModelConfig(name: string): Promise<AnyObject>;
    setModelConfig(name: string, config: AnyObject): Promise<void>;
    run(ask: AskSync): Promise<Answer>;
    run(ask: AskStreaming): Promise<StreamResponse>;
    cancel(id: string): Promise<void>;
    reload(): Promise<void>;
    toJSON(): {
        assistantId: string;
        id: string;
        owner: string;
        model: string;
        latest: Ask;
        summary: string;
        archivedAt: Date;
        updatedAt: Date;
        createdAt: Date;
    };
    toString(): string;
}
