"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LOG_LEVEL = void 0;
var LOG_LEVEL;
(function (LOG_LEVEL) {
    LOG_LEVEL["debug"] = "debug";
    LOG_LEVEL["info"] = "info";
    LOG_LEVEL["warn"] = "warn";
    LOG_LEVEL["error"] = "error";
    LOG_LEVEL["fatal"] = "fatal";
})(LOG_LEVEL || (exports.LOG_LEVEL = LOG_LEVEL = {}));
const LOG_LEVEL_PRIORITY = {
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
    fatal: 5
};
let printLevel;
const adapters = [];
const loggers = {};
class Logger {
    static setLevel(level) {
        printLevel = level;
    }
    static setLogAdapter(adapter) {
        adapters.push(adapter);
    }
    static getLogger(category) {
        const key = category || '$default';
        let logger = loggers[key];
        if (logger)
            return logger;
        logger = new Logger(category);
        loggers[key] = logger;
        return logger;
    }
    constructor(category) {
        this.category = category || '';
    }
    log(level, ...arg) {
        try {
            adapters.forEach((a) => a.write(this.category, level, ...arg));
        }
        catch (err) {
            console.error(err);
        }
    }
    debug(...arg) {
        if (printLevel && LOG_LEVEL_PRIORITY[printLevel] > 1)
            return;
        try {
            adapters.forEach((a) => a.write(this.category, LOG_LEVEL.debug, ...arg));
        }
        catch (err) {
            console.error(err);
        }
    }
    info(...arg) {
        if (printLevel && LOG_LEVEL_PRIORITY[printLevel] > 2)
            return;
        try {
            adapters.forEach((a) => a.write(this.category, LOG_LEVEL.info, ...arg));
        }
        catch (err) {
            console.error(err);
        }
    }
    warn(...arg) {
        if (printLevel && LOG_LEVEL_PRIORITY[printLevel] > 3)
            return;
        try {
            adapters.forEach((a) => a.write(this.category, LOG_LEVEL.warn, ...arg));
        }
        catch (err) {
            console.error(err);
        }
    }
    error(...arg) {
        if (printLevel && LOG_LEVEL_PRIORITY[printLevel] > 4)
            return;
        try {
            adapters.forEach((a) => a.write(this.category, LOG_LEVEL.error, ...arg));
        }
        catch (err) {
            console.error(err);
        }
    }
    fatal(...arg) {
        try {
            adapters.forEach((a) => a.write(this.category, LOG_LEVEL.fatal, ...arg));
        }
        catch (err) {
            console.error(err);
        }
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map