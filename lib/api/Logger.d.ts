export declare enum LOG_LEVEL {
    debug = "debug",
    info = "info",
    warn = "warn",
    error = "error",
    fatal = "fatal"
}
export interface ILogAdapter {
    write(category: string, level: LOG_LEVEL, ...arg: any): void;
}
export declare class Logger {
    static setLevel(level: LOG_LEVEL): void;
    static setLogAdapter(adapter: ILogAdapter): void;
    static getLogger(category?: string): Logger;
    private category;
    constructor(category?: string);
    log(level: LOG_LEVEL, ...arg: any): void;
    debug(...arg: any): void;
    info(...arg: any): void;
    warn(...arg: any): void;
    error(...arg: any): void;
    fatal(...arg: any): void;
}
