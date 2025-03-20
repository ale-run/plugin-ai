import { AssistantInfo, ListFilter, DocumentList, IThread, AssistantConfig, Answer, ThreadInfo, uniqid, IAssistant, IDataStore, DataStoreInfo, Database, Model, Usage, AnyObject } from './spec';
import { MongoAIPersistance } from './db';
import { Thread } from './Thread';
import { AIContext } from './AIContext';
import { DataStore } from './DataStore';
import { Logger } from './Logger';
import path from 'path';
import os from 'os';
import chalk from 'ansi-colors';

const logger = Logger.getLogger('ai:assistant');

export class Assistant implements IAssistant {
  private doc: AssistantInfo;
  private context: AIContext;
  private tmpdir: string;

  constructor(doc: AssistantInfo, context: AIContext) {
    this.doc = doc;
    this.context = context;
    this.tmpdir = path.join(os.homedir(), '.ale', 'ai', 'tmp');
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

  public get displayName(): string {
    return this.doc.displayName;
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

  private get persist(): MongoAIPersistance {
    return this.context.persist;
  }

  // config
  public async updateConfig(config: AssistantConfig): Promise<AssistantConfig> {
    logger.debug(`[${this.id}] updateConfig`, chalk.cyan(JSON.stringify(config, null, 2)));

    if (config.defaults?.text && typeof config.defaults?.text !== 'string') throw new Error(`defaults.text must be a string`);
    if (config.defaults?.image && typeof config.defaults?.image !== 'string') throw new Error(`defaults.image must be a string`);
    if (config.defaults?.ocr && typeof config.defaults?.ocr !== 'string') throw new Error(`defaults.ocr must be a string`);
    if (config.defaults?.tts && typeof config.defaults?.tts !== 'string') throw new Error(`defaults.tts must be a string`);
    if (config.defaults?.stt && typeof config.defaults?.stt !== 'string') throw new Error(`defaults.stt must be a string`);
    if (config.defaults?.webSearch && typeof config.defaults?.webSearch !== 'string') throw new Error(`defaults.webSearch must be a string`);

    await this.persist.updateAssistant(this.id, {
      config,
      updatedAt: new Date()
    });

    this.doc = await this.persist.findAssistant({ id: this.id });
    return this.config;
  }

  // provider
  public async getProviderConfig(name: string): Promise<AnyObject> {
    return await this.persist.findProviderConfig({ assistantId: this.id, name });
  }

  public async setProviderConfig(name: string, config: AnyObject): Promise<void> {
    await this.persist.upsertProviderConfig(this.id, name, config);
  }

  // model
  public async listModel(): Promise<Model[]> {
    const custommodels = (await this.persist.listModel({ condition: { assistantId: this.id } }))?.rows;
    const models = await this.context.listModel();

    const list = models?.map((model) => {
      const custommodel = custommodels?.find((m) => m.name === model.name);
      return {
        assistantId: this.id,
        name: custommodel?.name || model.name,
        provider: custommodel?.provider || model.provider,
        displayName: custommodel?.displayName || model.displayName,
        schema: custommodel?.schema || model.schema,
        enable: typeof custommodel?.enable === 'boolean' ? custommodel.enable : model.enable || false,
        icon: custommodel?.icon || model.icon,
        type: custommodel?.type || model.type,
        createdAt: custommodel?.createdAt || model.createdAt,
        updatedAt: custommodel?.updatedAt || model.updatedAt,
        custom: model ? false : true
      };
    });

    custommodels?.forEach((model) => {
      const custommodel = Object.assign({}, model, {
        custom: true
      });
      if (!models.find((m) => m.name === model.name)) {
        list.push(custommodel as any);
      }
    });

    return list;
  }

  public async getModel(name: string): Promise<Model> {
    const models = await this.listModel();
    const model = models?.find((model) => model.name === name);
    const custommodel = await this.persist.findModel({ assistantId: this.id, name });

    if (!model && !custommodel) throw new Error(`[${this.id}] model not found: ${name}`);

    return {
      assistantId: this.id,
      name: custommodel?.name || model.name,
      provider: custommodel?.provider || model.provider,
      displayName: custommodel?.displayName || model.displayName,
      schema: custommodel?.schema || model.schema,
      enable: typeof custommodel?.enable === 'boolean' ? custommodel.enable : model.enable || false,
      icon: custommodel?.icon || model.icon,
      type: custommodel?.type || model.type,
      createdAt: custommodel?.createdAt || model.createdAt,
      updatedAt: custommodel?.updatedAt || model.updatedAt,
      custom: model ? false : true
    };
  }

  public async upsertModel(name: string, values: Model): Promise<Model> {
    await this.persist.upsertModel(this.id, name, values);
    return await this.getModel(name);
  }

  public async removeModel(name: string): Promise<void> {
    await this.persist.removeModel(this.id, name);
  }

  public async setModelEnabled(name: string, enable: boolean): Promise<void> {
    const model = await this.getModel(name);
    if (!model) throw new Error(`[${this.id}] model not found: ${name}`);

    await this.persist.setModelEnabled(this.id, name, enable);
  }

  // model config
  public async getModelConfig(name: string): Promise<AnyObject> {
    const doc = await this.persist.findModelConfig({ assistantId: this.id, threadId: null, name });
    return doc?.config;
  }

  public async setModelConfig(name: string, config: AnyObject): Promise<void> {
    const model = await this.getModel(name);
    if (!model) throw new Error(`[${this.id}] model not found: ${name}`);

    if (!config) {
      await this.persist.removeModelConfig(this.id, null, name);
    } else {
      await this.persist.upsertModelConfig(this.id, null, name, config);
    }
  }

  public async removeModelConfig(name: string): Promise<void> {
    await this.persist.removeModelConfig(this.id, null, name);
  }

  // datastore
  public async listDataStore(): Promise<IDataStore[]> {
    logger.debug(`[${this.id}] listDataStore`);

    const filter = {
      condition: {
        assistantId: this.id
      },
      offset: 0,
      limit: 50
    };

    const list = await this.persist.listDataStore(filter);
    return list?.rows?.map((doc) => new DataStore(this, doc, this.context)) || null;
  }

  public async createDataStore(values: { name: string; owner: string }): Promise<IDataStore> {
    if (!values?.name) throw new Error(`argument values.name is required`);

    const now = new Date();

    const vo: DataStoreInfo = {
      assistantId: this.id,
      id: uniqid(),
      owner: values.owner,
      name: values.name,
      createdAt: now,
      updatedAt: now
    };

    const doc = await this.persist.createDataStore(vo);

    return null;
  }

  public async getDataStore(id: string): Promise<IDataStore> {
    const doc = await this.persist.findDataStore({ assistantId: this.id, id });
    return doc && new DataStore(this, doc, this.context);
  }

  public async removeDataStore(id: string): Promise<void> {
    logger.debug(`[${this.id}] removeDataStore`, chalk.cyan(JSON.stringify(id, null, 2)));
    await this.persist.removeDataStore(this.id, id);
  }

  // thread
  public async listThread(filter?: ListFilter): Promise<DocumentList<ThreadInfo>> {
    logger.debug(`[assistant] listThread`, chalk.cyan(JSON.stringify(filter, null, 2)));

    filter = filter || {
      condition: {},
      offset: 0,
      limit: 50,
      sort: '-updatedAt'
    };
    filter.condition = filter.condition || {};
    filter.condition.assistantId = this.id;

    return await this.persist.listThread(filter);
  }

  public async getThread(id: string): Promise<IThread> {
    logger.debug(`[${this.id}] getThread`, chalk.cyan(JSON.stringify(id, null, 2)));
    const doc = await this.persist.findThread({ assistantId: this.id, id });
    if (!doc) return null;

    return new Thread(this, doc, this.context);
  }

  public async createThread(owner: string): Promise<IThread> {
    logger.debug(`[${this.id}] createThread`, chalk.cyan(JSON.stringify(owner, null, 2)));

    const models = await this.listModel();
    const model = models.find((m) => m.name === this.config?.defaults?.text);

    const now = new Date();

    const vo: ThreadInfo = {
      assistantId: this.id,
      id: uniqid(),
      model: model?.name,
      owner,
      createdAt: now,
      updatedAt: now
    };

    await this.persist.createThread(vo);
    return await this.getThread(vo.id);
  }

  public async removeThread(id: string): Promise<void> {
    logger.debug(`[${this.id}] removeThread`, chalk.cyan(JSON.stringify(id, null, 2)));

    const thread = await this.persist.findThread({ id });
    if (!thread) throw new Error(`[${this.id}] thread not found: ${id}`);

    await this.persist.removeThread(this.id, thread.id);
  }

  // answer
  public async listAnswer(filter: ListFilter): Promise<DocumentList<Answer>> {
    logger.debug(`[${this.id}] listAnswer`, chalk.cyan(JSON.stringify(filter, null, 2)));

    filter = filter || {
      condition: {},
      offset: 0,
      limit: 50
    };
    filter.condition = filter.condition || {};
    filter.condition.assistantId = this.id;

    return await this.persist.listAnswer(filter);
  }

  public async getAnswer(id?: string): Promise<Answer> {
    logger.debug(`[${this.id}] getAnswer`, chalk.cyan(JSON.stringify(id, null, 2)));
    return await this.persist.findAnswer({ assistantId: this.id, id });
  }

  public async removeAnswer(id: string): Promise<void> {
    logger.debug(`[${this.id}] removeAnswer`, chalk.cyan(JSON.stringify(id, null, 2)));
    await this.persist.removeAnswer(this.id, id);
  }

  // database
  public async listDatabase(): Promise<Database[]> {
    return null;
  }

  public async addDatabase(database: Database): Promise<void> {
    return null;
  }

  public async removeDatabase(id: string): Promise<void> {
    return null;
  }

  // usage
  public async listUsageByUser(uid: string, start: Date, end: Date, interval?: 'm' | 'h' | 'd' | string): Promise<Usage[]> {
    return await this.persist.listUsageByUser(this.id, uid, { start, end, interval });
  }

  public async listUsage(start: Date, end: Date, interval?: 'm' | 'h' | 'd' | string): Promise<Usage[]> {
    return await this.persist.listUsage(this.id, { start, end, interval });
  }

  // misc
  public toJSON() {
    const doc = this.doc;
    if (!doc) return null;
    return {
      id: doc.id,
      owner: doc.owner,
      displayName: doc.displayName,
      name: doc.name,
      config: doc.config,
      info: doc.info,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  public toString() {
    return JSON.stringify(this.toJSON());
  }
}
