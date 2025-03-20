import { AssistantConfig, Ask, ThreadInfo, AssistantInfo, Usage, Model, ModelConfig, Answer, DataStore } from './entity';
import { ListFilter, DocumentList } from './common';
import { IThread } from './IThread';

export interface IAssistant extends AssistantInfo {
  updateConfig(config: AssistantConfig): Promise<AssistantConfig>;

  listModel(): Promise<Model[]>;
  getModel(name: string): Promise<Model>;
  setModelConfig(name: string, config: ModelConfig): Promise<void>;

  listDataStore(): Promise<DataStore[]>;
  createDataStore(datastore: DataStore): Promise<void>;
  updateDataStore(datastore: DataStore): Promise<void>;
  getDataStore(id: string): Promise<DataStore>;
  removeDataStore(id: string): Promise<void>;

  listThread(filter?: ListFilter): Promise<DocumentList<ThreadInfo>>;
  createThread(ask?: Ask): Promise<IThread>;
  getThread(id: string): Promise<IThread>;
  removeThread(id: string): Promise<void>;

  listAnswer(filter?: ListFilter): Promise<DocumentList<Answer>>;
  getAnswer(id?: string): Promise<Answer>;
  removeAnswer(id: string): Promise<void>;

  listUsageByUser(uid: string, start: Date, end: Date, interval?: 'm' | 'h' | 'd' | string): Promise<Usage[]>;
  listUsage(start: Date, end: Date, interval?: 'm' | 'h' | 'd' | string): Promise<Usage[]>;
}
