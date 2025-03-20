export class Errors extends Error {
  public type = 'Errors';
  public cause: Error;
  public code: number;
  public errors: Error[] = [];

  constructor(message: string, code?: Error | number, cause?: Error) {
    super(message);

    if (code instanceof Error) cause = code;
    if (typeof code === 'number') this.code = code;

    if (cause instanceof Error) {
      this.cause = cause;
      this.stack = `${this.stack}\n  Cause: ${cause.stack.split('\n').join('\n  ')}`;
    }

    Object.setPrototypeOf(this, Errors.prototype);
  }

  public get length(): number {
    return this.errors.length;
  }

  public push(error: Error): void {
    this.errors.push(error);
  }

  public toJSON() {
    return {
      type: this.type,
      message: this.message,
      cause: this.cause,
      code: this.code,
      stack: this.stack,
      errors: this.errors
    };
  }
}
