import { connector, ListFilter, DocumentList } from '@ale-run/connector';
import { AssistantInfo, Ask, IThread, Model, AssistantConfig, ThreadInfo, IAssistant, Usage, DataStore, ModelConfig, Answer } from './spec';
import { Thread } from './Thread';

export class Assistant implements IAssistant {
  private doc: AssistantInfo;

  constructor(doc: AssistantInfo) {
    this.doc = doc;
  }

  public get id(): string {
    return this.doc.id;
  }

  public get name(): string {
    return this.doc.name;
  }

  public get owner(): string {
    return this.doc.owner;
  }

  public get config(): AssistantConfig {
    return this.doc.config;
  }

  public get createdAt(): Date {
    return this.doc.createdAt;
  }

  public get updatedAt(): Date {
    return this.doc.updatedAt;
  }

  // config
  public async updateConfig(config: AssistantConfig): Promise<AssistantConfig> {
    return await connector.put(`/ai/${this.id}`, config);
  }

  // model
  public async listModel(): Promise<Model[]> {
    return await connector.get(`/ai/${this.id}/model`);
  }
  public async getModel(name: string): Promise<Model> {
    return await connector.get(`/ai/${this.id}/model/${name}`);
  }
  public async setModelConfig(name: string, config: ModelConfig): Promise<void> {
    return await connector.put(`/ai/${this.id}/model/${name}`, config);
  }

  public async removeModel(name: string): Promise<void> {
    return await connector.delete(`/ai/${this.id}/model/${name}`);
  }

  // datastore
  public async listDataStore(): Promise<DataStore[]> {
    return await connector.get(`/ai/${this.id}/datastore`);
  }

  public async getDataStore(id: string): Promise<DataStore> {
    return await connector.get(`/ai/${this.id}/datastore/${id}`);
  }

  public async createDataStore(datastore: DataStore): Promise<void> {
    return await connector.post(`/ai/${this.id}/datastore`, datastore);
  }

  public async updateDataStore(datastore: DataStore): Promise<void> {
    return await connector.put(`/ai/${this.id}/datastore/${datastore.id}`, datastore);
  }

  public async removeDataStore(id: string): Promise<void> {
    return await connector.delete(`/ai/${this.id}/datastore/${id}`);
  }

  // thread
  public async listThread(filter?: ListFilter): Promise<DocumentList<ThreadInfo>> {
    return await connector.get(`/ai/${this.id}/thread`, filter);
  }

  public async getThread(id: string): Promise<IThread> {
    const doc = await connector.get(`/ai/${this.id}/thread/${id}`);
    return doc && new Thread(this, doc);
  }

  public async createThread(ask: Ask): Promise<IThread> {
    const doc = await connector.post(`/ai/${this.id}/thread`, ask);
    return doc && new Thread(this, doc);
  }

  public async removeThread(name: string): Promise<void> {
    return await connector.delete(`/ai/${this.id}/thread/${name}`);
  }

  // answer
  public async listAnswer(filter: ListFilter): Promise<DocumentList<Answer>> {
    return await connector.get(`/ai/${this.id}/thread/${this.id}/answer`, filter);
  }

  public async getAnswer(id?: string): Promise<Answer> {
    return await connector.get(`/ai/${this.id}/thread/${this.id}/answer/${id}`);
  }

  public async removeAnswer(id: string): Promise<void> {
    return await connector.delete(`/ai/${this.id}/thread/${this.id}/answer/${id}`);
  }

  public async listUsageByUser(uid: string, start: Date, end: Date, interval?: 'm' | 'h' | '1d' | string): Promise<Usage[]> {
    return await connector.get(`/ai/${this.id}/usage`, { start, end });
  }

  public async listUsage(start: Date, end: Date, interval?: 'm' | 'h' | 'd' | string): Promise<Usage[]> {
    return await connector.get(`/ai/${this.id}/usage`, { start, end });
  }
}
