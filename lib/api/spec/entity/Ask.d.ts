export declare class Ask {
    streaming?: boolean;
    model?: string;
    options?: object;
    prompt: string;
    temporary?: boolean;
    files?: Array<{
        type?: string;
        filename?: string;
        src: string;
    }>;
    store?: string;
    responseFormat?: string;
    user?: string;
    channel?: string;
    info?: object;
    addons?: string[];
}
export declare class AskSync extends Ask {
    streaming: false;
}
export declare class AskStreaming extends Ask {
    streaming: true;
}
