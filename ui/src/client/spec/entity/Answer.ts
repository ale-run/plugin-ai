import { Ask } from './Ask';
import { AnyObject } from '../common';

export enum ANSWER_STATUS {
  inprogress = 'inprogress',
  complete = 'complete',
  cancel = 'cancel',
  error = 'error'
}

export class AnswerAnnotation {
  public text: string;
  public link?: string;
  public type?: string;
  public startIndex?: number;
  public endIndex?: number;
  public attach?: {
    id: string;
    filename: string;
    raw: {
      id: string;
      filename: string;
    };
  };
}

export class AnswerUsage {
  input: number;
  output: number;
  total: number;
  raw?: AnyObject;
}

export class Answer {
  public id: string;
  public assistantId: string;
  public threadId: string;

  public ask: Ask;
  public status: ANSWER_STATUS;

  public error?: string;
  public result?: string | object;
  public annotations?: AnswerAnnotation[];
  public temporary?: boolean;
  public summary?: string;

  public usage?: AnswerUsage;
  public model?: string;
  public raw?: object;
  public metadata?: object;
  public createdAt: Date;
  public completedAt?: Date;
}
