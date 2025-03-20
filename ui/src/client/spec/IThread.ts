import { DocumentList, ListFilter } from './common';
import { Answer, Ask, AskSync, AskStreaming, ThreadInfo } from './entity';
import { IAssistant } from './IAssistant';
import { Readable } from 'stream';

export class StreamResponse extends Readable {}

export interface IThread extends ThreadInfo {
  getAssistant(): IAssistant;
  reload(): Promise<void>;
  listAnswer(filter?: ListFilter): Promise<DocumentList<Answer>>;
  getAnswer(id?: string): Promise<Answer>;
  removeAnswer(id: string): Promise<void>;

  run(ask: AskSync): Promise<Answer>;
  run(ask: AskStreaming): Promise<StreamResponse>;
  run(ask: Ask): Promise<Answer | StreamResponse>;
  cancel(id: string): Promise<void>;
}
