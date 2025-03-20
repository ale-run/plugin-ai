import { connector, ListFilter, DocumentList } from '@ale-run/connector';
import { ThreadInfo, IAssistant, IThread, Answer, Ask, AskSync, AskStreaming, StreamResponse } from './spec';

export class Thread implements IThread {
  private doc: ThreadInfo;
  private assistant: IAssistant;

  constructor(assistant: IAssistant, doc: ThreadInfo) {
    this.doc = doc;
    this.assistant = assistant;
  }

  public get assistantId(): string {
    return this.doc.assistantId;
  }

  public get id(): string {
    return this.doc.id;
  }

  public get owner(): string {
    return this.doc.owner;
  }

  public get participants(): string[] {
    return this.doc.participants;
  }

  public get latest(): Ask {
    return this.doc.latest;
  }

  public get summary(): string {
    return this.doc.summary;
  }

  public get updatedAt(): Date {
    return this.doc.updatedAt;
  }

  public get createdAt(): Date {
    return this.doc.createdAt;
  }

  public get archivedAt(): Date {
    return this.doc.archivedAt;
  }

  public getAssistant(): IAssistant {
    return this.assistant;
  }

  public async reload(): Promise<void> {
    this.doc = await connector.get(`/ai/${this.assistantId}/thread/${this.id}`);
  }

  public async listAnswer(filter: ListFilter): Promise<DocumentList<Answer>> {
    return await connector.get(`/ai/${this.assistantId}/thread/${this.id}/answer`, filter);
  }

  public async getAnswer(id?: string): Promise<Answer> {
    return await connector.get(`/ai/${this.assistantId}/thread/${this.id}/answer/${id}`);
  }

  public async removeAnswer(id: string): Promise<void> {
    return await connector.delete(`/ai/${this.assistantId}/thread/${this.id}/answer/${id}`);
  }

  run(ask: AskSync): Promise<Answer>;
  run(ask: AskStreaming): Promise<StreamResponse>;
  public async run(ask: AskSync | AskStreaming): Promise<Answer | StreamResponse> {
    if (!ask) throw new Error(`argument ask is required`);

    if (ask.streaming === true) {
      return await connector.ws(`/ai/run`, { assistantId: this.assistantId, threadId: this.id, ask });
    } else {
      return await connector.post(`/ai/${this.assistantId}/thread/${this.id}/run`, ask);
    }
  }

  public async cancel(): Promise<void> {
    return await connector.put(`/ai/${this.assistantId}/thread/${this.id}/cancel`);
  }
}
