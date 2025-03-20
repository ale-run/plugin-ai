import { Ask } from './Ask';
import { AnyObject } from '../common';
export declare enum ANSWER_STATUS {
    inprogress = "inprogress",
    complete = "complete",
    cancel = "cancel",
    error = "error"
}
export declare class AnswerAnnotation {
    text: string;
    link?: string;
    type?: string;
    startIndex?: number;
    endIndex?: number;
    attach?: {
        id: string;
        filename: string;
        raw: {
            id: string;
            filename: string;
        };
    };
}
export declare class AnswerUsage {
    input: number;
    output: number;
    total: number;
    raw?: AnyObject;
}
export declare class Answer {
    id: string;
    assistantId: string;
    threadId: string;
    ask: Ask;
    status: ANSWER_STATUS;
    error?: string;
    result?: string | object;
    annotations?: AnswerAnnotation[];
    temporary?: boolean;
    summary?: string;
    usage?: AnswerUsage;
    model?: string;
    raw?: object;
    metadata?: object;
    createdAt: Date;
    completedAt?: Date;
}
