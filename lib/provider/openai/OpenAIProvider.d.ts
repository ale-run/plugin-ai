import { Provider, AnyObject, Model, PromptRequest, Icon } from '../../api';
import { Readable } from 'stream';
export declare class OpenAIProvider extends Provider {
    readonly displayName = "OpenAI";
    readonly icon: Icon;
    readonly schema: {
        type: string;
        properties: {
            apikey: {
                title: string;
                type: string;
                maxLength: number;
                attrs: {
                    placeholder: string;
                };
            };
        };
    };
    readonly modelSchema: {
        type: string;
        properties: {
            instructions: {
                title: string;
                type: string;
                attrs: {
                    placeholder: string;
                    type: string;
                    rows: number;
                };
            };
            topP: {
                title: string;
                type: string;
                minimum: number;
                maximum: number;
                multipleOf: number;
                default: number;
                attrs: {
                    placeholder: string;
                    type: string;
                };
            };
            temparature: {
                title: string;
                type: string;
                minimum: number;
                maximum: number;
                multipleOf: number;
                default: number;
                attrs: {
                    placeholder: string;
                    type: string;
                };
            };
            tokenLimitInput: {
                title: string;
                type: string;
                minimum: number;
                maximum: number;
                default: number;
                attrs: {
                    placeholder: string;
                    type: string;
                };
            };
            tokenLimitOutput: {
                title: string;
                type: string;
                minimum: number;
                maximum: number;
                default: number;
                attrs: {
                    placeholder: string;
                    type: string;
                };
            };
        };
    };
    constructor(options: AnyObject);
    listModel(): Model[];
    run(request: PromptRequest): Promise<Readable>;
}
