export enum LOG_LEVEL {
  debug = 'debug',
  info = 'info',
  warn = 'warn',
  error = 'error',
  fatal = 'fatal'
}

export interface ILogAdapter {
  write(category: string, level: LOG_LEVEL, ...arg: any): void;
}

const LOG_LEVEL_PRIORITY = {
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  fatal: 5
};

let printLevel: LOG_LEVEL;
const adapters: ILogAdapter[] = [];
const loggers: {
  [category: string]: Logger;
} = {};

export class Logger {
  public static setLevel(level: LOG_LEVEL) {
    printLevel = level;
  }

  public static setLogAdapter(adapter: ILogAdapter) {
    adapters.push(adapter);
  }

  public static getLogger(category?: string): Logger {
    const key = category || '$default';
    let logger = loggers[key];
    if (logger) return logger;
    logger = new Logger(category);
    loggers[key] = logger;
    return logger;
  }

  private category: string;

  constructor(category?: string) {
    this.category = category || '';
  }

  public log(level: LOG_LEVEL, ...arg: any): void {
    try {
      adapters.forEach((a) => a.write(this.category, level, ...arg));
    } catch (err) {
      console.error(err);
    }
  }

  public debug(...arg: any): void {
    if (printLevel && LOG_LEVEL_PRIORITY[printLevel] > 1) return;

    try {
      adapters.forEach((a) => a.write(this.category, LOG_LEVEL.debug, ...arg));
    } catch (err) {
      console.error(err);
    }
  }

  public info(...arg: any): void {
    if (printLevel && LOG_LEVEL_PRIORITY[printLevel] > 2) return;

    try {
      adapters.forEach((a) => a.write(this.category, LOG_LEVEL.info, ...arg));
    } catch (err) {
      console.error(err);
    }
  }

  public warn(...arg: any): void {
    if (printLevel && LOG_LEVEL_PRIORITY[printLevel] > 3) return;
    try {
      adapters.forEach((a) => a.write(this.category, LOG_LEVEL.warn, ...arg));
    } catch (err) {
      console.error(err);
    }
  }

  public error(...arg: any): void {
    if (printLevel && LOG_LEVEL_PRIORITY[printLevel] > 4) return;
    try {
      adapters.forEach((a) => a.write(this.category, LOG_LEVEL.error, ...arg));
    } catch (err) {
      console.error(err);
    }
  }

  public fatal(...arg: any): void {
    try {
      adapters.forEach((a) => a.write(this.category, LOG_LEVEL.fatal, ...arg));
    } catch (err) {
      console.error(err);
    }
  }
}
