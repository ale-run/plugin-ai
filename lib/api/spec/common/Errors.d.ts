export declare class Errors extends Error {
    type: string;
    cause: Error;
    code: number;
    errors: Error[];
    constructor(message: string, code?: Error | number, cause?: Error);
    get length(): number;
    push(error: Error): void;
    toJSON(): {
        type: string;
        message: string;
        cause: Error;
        code: number;
        stack: string;
        errors: Error[];
    };
}
