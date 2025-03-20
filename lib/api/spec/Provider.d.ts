import { Ask, Icon, Model, AnswerAnnotation, AnswerUsage } from './entity';
import { AnyObject } from './common';
import { IThread } from './IThread';
import { Readable } from 'stream';
export declare class RunResult {
    id?: string;
    result?: string | AnyObject;
    raw: AnyObject;
    annotations?: AnswerAnnotation[];
    usage?: AnswerUsage;
    summary?: string;
}
export declare class PromptRequestMessage {
    role: 'developer' | 'assistant' | 'user';
    content: string | {
        type: 'text';
        text: string;
    } | {
        type: 'image_url';
        image_url: {
            url: string;
        };
    };
}
export declare class PromptRequest {
    thread: IThread;
    ask: Ask;
    config: AnyObject;
    user: string;
    model: string;
    prompt: string;
    messages: PromptRequestMessage[];
}
export declare abstract class Provider {
    readonly displayName?: string;
    readonly options: AnyObject;
    readonly icon?: Icon;
    readonly schema?: AnyObject;
    readonly modelSchema?: AnyObject;
    constructor(options: AnyObject);
    abstract listModel(config?: AnyObject): Model[];
    abstract run(request: PromptRequest): Promise<Readable>;
}
