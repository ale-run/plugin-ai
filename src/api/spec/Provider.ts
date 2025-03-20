import { Ask, Icon, Model, AnswerAnnotation, AnswerUsage } from './entity';
import { AnyObject } from './common';
import { IThread } from './IThread';
import { Readable } from 'stream';

export class RunResult {
  id?: string;
  result?: string | AnyObject;
  raw: AnyObject;
  annotations?: AnswerAnnotation[];
  usage?: AnswerUsage;
  summary?: string;
}

export class PromptRequestMessage {
  role: 'developer' | 'assistant' | 'user';
  content:
    | string
    | {
        type: 'text';
        text: string;
      }
    | {
        type: 'image_url';
        image_url: {
          url: string;
        };
      };
}

export class PromptRequest {
  thread: IThread;
  ask: Ask;
  config: AnyObject;
  user: string;
  model: string;
  prompt: string;
  messages: PromptRequestMessage[];
}

export abstract class Provider {
  public readonly displayName?: string;
  public readonly options: AnyObject;
  public readonly icon?: Icon;
  public readonly schema?: AnyObject;
  public readonly modelSchema?: AnyObject;

  constructor(options: AnyObject) {
    if (!options) throw new Error(`options is required`);
    if (typeof options !== 'object') throw new Error(`options must be an object`);
    this.options = options;
  }

  public abstract listModel(config?: AnyObject): Model[];
  public abstract run(request: PromptRequest): Promise<Readable>;
}
