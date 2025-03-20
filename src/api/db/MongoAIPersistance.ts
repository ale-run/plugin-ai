import { ListFilter, DocumentList, AssistantInfo, ThreadInfo, Answer, AnyObject, Model, DataStoreInfo, Usage, uniqid } from '../spec';
import { Connector } from './Connector';
import { Store } from './Store';
import string2date from './string2date';

export class AccessToken {
  public assistantId: string;
  public token: string;
  public createdAt: Date;
  public renewedAt?: Date;
}

export class ModelConfigDocument {
  public assistantId: string;
  public threadId: string;
  public name: string;
  public config: AnyObject;
  public updatedAt: Date;
}

export class MongoAIPersistance {
  private tokens: Store;
  private providers: Store;
  private modelconfigs: Store;
  private models: Store;
  private assistants: Store;
  private threads: Store;
  private answers: Store;
  private datastore: Store;

  constructor(options: any) {
    if (!options || typeof options !== 'object') throw new Error('options must be an object');
    if (!options.url || typeof options.url !== 'string') throw new Error('options.url required');

    const connector = new Connector(options.url, options.db);

    this.tokens = new Store(connector, 'ai-token');
    this.tokens.createIndex({ id: 1 }, { unique: true });
    this.tokens.createIndex({ createdAt: -1 });

    this.providers = new Store(connector, 'ai-provider-config');
    this.providers.createIndex({ assistantId: 1, name: 1 }, { unique: true });
    this.providers.createIndex({ updatedAt: -1 });

    this.modelconfigs = new Store(connector, 'ai-model-config');
    this.modelconfigs.createIndex({ assistantId: 1, threadId: 1, name: 1 }, { unique: true });
    this.modelconfigs.createIndex({ updatedAt: -1 });

    this.models = new Store(connector, 'ai-model');
    this.models.createIndex({ assistantId: 1, name: 1 }, { unique: true });
    this.models.createIndex({ provider: 1 });
    this.models.createIndex({ createdAt: -1 });
    this.models.createIndex({ updatedAt: -1 });

    this.assistants = new Store(connector, 'ai');
    this.assistants.createIndex({ id: 1 }, { unique: true });
    this.assistants.createIndex({ name: 1 }, { unique: true });
    this.assistants.createIndex({ createdAt: -1 });

    this.threads = new Store(connector, 'ai-thread');
    this.threads.createIndex({ id: 1 }, { unique: true });
    this.threads.createIndex({ assistantId: 1 });
    this.threads.createIndex({ createdAt: -1 });

    this.answers = new Store(connector, 'ai-answer');
    this.answers.createIndex({ id: 1 }, { unique: true });
    this.answers.createIndex({ threadId: 1 });
    this.answers.createIndex({ createdAt: -1 });
    this.answers.createIndex({ completedAt: -1 });

    this.datastore = new Store(connector, 'ai-datastore');
    this.datastore.createIndex({ id: 1 }, { unique: true });
    this.datastore.createIndex({ assistantId: 1 });
    this.datastore.createIndex({ createdAt: -1 });
  }

  // access token
  public async createAccessToken(assistantId: string): Promise<string> {
    const doc = await this.tokens.findOne<AnyObject>({
      condition: { assistantId },
      sort: '-createdAt'
    });

    if (doc) throw new Error(`already exist access token: ${assistantId}`);

    const token = `AIP-${uniqid()}`;
    await this.tokens.insert({
      assistantId,
      token,
      createdAt: new Date()
    });

    return token;
  }

  public async getAccessToken(assistantId: string): Promise<string> {
    const doc = await this.tokens.findOne<AnyObject>({
      condition: { assistantId },
      sort: '-createdAt'
    });
    return doc?.token || null;
  }

  public async renewAccessToken(assistantId: string): Promise<string> {
    const token = await this.getAccessToken(assistantId);
    if (!token) throw new Error(`access token not found: ${assistantId}`);

    const newToken = `AIP-${uniqid()}`;
    await this.tokens.updateOne(
      { assistantId },
      {
        token: newToken,
        renewedAt: new Date()
      }
    );

    return newToken;
  }

  public async removeAccessToken(assistantId: string): Promise<void> {
    if (!assistantId) throw new Error(`argument assistantId is required`);

    const token = await this.getAccessToken(assistantId);
    if (!token) throw new Error(`access token not found: ${assistantId}`);

    await this.tokens.remove({ assistantId });
  }

  // provider config
  public async findProviderConfig(condition: AnyObject): Promise<AnyObject> {
    const doc = await this.providers.findOne<AnyObject>({
      condition,
      sort: 'createdAt'
    });

    return doc?.config;
  }

  public async upsertProviderConfig(assistantId: string, name: string, config: AnyObject): Promise<AnyObject> {
    await this.providers.upsert(
      { assistantId, name },
      {
        $set: {
          assistantId,
          name,
          config,
          updatedAt: new Date()
        }
      }
    );

    return await this.findModelConfig({ assistantId, name });
  }

  // model config
  public async listModelConfig(condition: AnyObject): Promise<Array<ModelConfigDocument>> {
    const doc = await this.modelconfigs.list<ModelConfigDocument>({
      condition,
      sort: 'createdAt'
    });

    return doc?.rows;
  }

  public async findModelConfig(condition: AnyObject): Promise<ModelConfigDocument> {
    const doc = await this.modelconfigs.findOne<ModelConfigDocument>({
      condition,
      sort: 'createdAt'
    });

    return doc;
  }

  public async upsertModelConfig(assistantId: string, threadId: string, name: string, config: AnyObject): Promise<ModelConfigDocument> {
    if (!assistantId) throw new Error(`argument assistantId is required`);
    if (!name) throw new Error(`argument name is required`);

    await this.modelconfigs.upsert(
      { assistantId, threadId, name },
      {
        $set: {
          assistantId,
          threadId: threadId || null,
          name,
          config,
          updatedAt: new Date()
        }
      }
    );

    return await this.findModelConfig({ assistantId, threadId, name });
  }

  public async removeModelConfig(assistantId: string, threadId: string, name: string): Promise<void> {
    if (!assistantId) throw new Error(`argument assistantId is required`);
    if (!name) throw new Error(`argument name is required`);

    const doc = await this.findModelConfig({ assistantId, threadId, name });
    if (!doc) throw new Error(`model ${name} not found`);

    await this.modelconfigs.remove({ assistantId, threadId, name });
  }

  // models
  public async listModel(filter?: ListFilter): Promise<DocumentList<Model>> {
    filter = filter || { condition: {} };
    if (filter.condition?.createdAt) filter.condition.createdAt = string2date(filter.condition.createdAt);
    if (filter.condition?.updatedAt) filter.condition.updatedAt = string2date(filter.condition.updatedAt);

    filter.sort = filter.sort || '-createdAt';
    return await this.models.list<Model>(filter);
  }

  public async findModel(condition: AnyObject): Promise<Model> {
    const doc = await this.models.findOne<Model>({
      condition,
      sort: 'createdAt'
    });

    return doc;
  }

  public async upsertModel(assistantId: string, name: string, values: Model): Promise<Model> {
    if (!assistantId) throw new Error(`argument assistantId is required`);
    if (!name) throw new Error(`argument name is required`);
    if (!values) throw new Error(`argument values is required`);
    if (!name) throw new Error(`argument name is required`);

    await this.models.upsert(
      { assistantId, name },
      {
        $set: Object.assign({}, values, {
          assistantId,
          name,
          updatedAt: new Date()
        })
      }
    );

    return await this.findModel({ assistantId, name });
  }

  public async setModelEnabled(assistantId: string, name: string, enable: boolean): Promise<void> {
    if (!assistantId) throw new Error(`argument assistantId is required`);
    if (!name) throw new Error(`argument name is required`);

    await this.models.upsert(
      { assistantId, name },
      {
        $set: {
          assistantId,
          name,
          enable,
          updatedAt: new Date()
        }
      }
    );
  }

  public async removeModel(assistantId: string, name: string): Promise<void> {
    if (!assistantId) throw new Error(`argument assistantId is required`);
    if (!name) throw new Error(`argument name is required`);

    const doc = await this.findModel({ assistantId, name });
    if (!doc) throw new Error(`model ${name} not found`);

    await this.models.remove({ assistantId, name });
  }

  // assistants
  public async listAssistant(filter?: ListFilter): Promise<DocumentList<AssistantInfo>> {
    filter = filter || { condition: {} };
    if (filter.condition?.createdAt) filter.condition.createdAt = string2date(filter.condition.createdAt);
    if (filter.condition?.updatedAt) filter.condition.updatedAt = string2date(filter.condition.updatedAt);

    filter.sort = filter.sort || '-updatedAt';
    return await this.assistants.list<AssistantInfo>(filter);
  }

  public async findAssistant(condition: AnyObject): Promise<AssistantInfo> {
    const doc = await this.assistants.findOne<AssistantInfo>({
      condition,
      sort: '-updatedAt'
    });

    return doc;
  }

  public async createAssistant(values: AssistantInfo): Promise<AssistantInfo> {
    if (!values) throw new Error(`argument values is required`);
    if (!values.id) throw new Error(`values.id is required`);

    const doc = Object.assign({}, values, {
      createdAt: new Date()
    });

    await this.assistants.insert(doc);
    return doc;
  }

  public async updateAssistant(id: string, values: AnyObject): Promise<AssistantInfo> {
    if (!id) throw new Error(`argument id is required`);
    if (!values) throw new Error(`argument values is required`);

    const exists = await this.findAssistant({ id });
    if (!exists) throw new Error(`assistant ${id} not found`);

    delete values.id;

    await this.assistants.updateOne(
      { id },
      {
        $set: Object.assign({}, values, { updatedAt: new Date() })
      }
    );

    return await this.findAssistant({ id });
  }

  public async removeAssistant(id: string): Promise<void> {
    if (!id) throw new Error(`argument id is required`);

    const exists = await this.findAssistant({ id });
    if (!exists) throw new Error(`assistant ${id} not found`);

    await this.assistants.remove({ id });
  }

  // threads
  public async listThread(filter?: ListFilter): Promise<DocumentList<ThreadInfo>> {
    filter = filter || { condition: {} };
    if (filter.condition?.createdAt) filter.condition.createdAt = string2date(filter.condition.createdAt);
    if (filter.condition?.updatedAt) filter.condition.updatedAt = string2date(filter.condition.updatedAt);

    filter.sort = filter.sort || '-updatedAt';
    return await this.threads.list<ThreadInfo>(filter);
  }

  public async findThread(condition: AnyObject): Promise<ThreadInfo> {
    const doc = await this.threads.findOne<ThreadInfo>({
      condition,
      sort: '-updatedAt'
    });

    return doc;
  }

  public async createThread(values: ThreadInfo): Promise<ThreadInfo> {
    if (!values) throw new Error(`argument values is required`);
    if (!values.id) throw new Error(`values.id is required`);

    const doc = Object.assign({}, values, {
      createdAt: new Date()
    });

    await this.threads.insert(doc);
    return doc;
  }

  public async updateThread(assistantId: string, id: string, values: AnyObject): Promise<ThreadInfo> {
    if (!assistantId) throw new Error(`argument assistantId is required`);
    if (!id) throw new Error(`argument id is required`);
    if (!values) throw new Error(`argument values is required`);

    const exists = await this.findThread({ id });
    if (!exists) throw new Error(`thread ${id} not found`);

    delete values.id;

    await this.threads.updateOne(
      { assistantId, id },
      {
        $set: Object.assign({}, values, { updatedAt: new Date() })
      }
    );

    return await this.findThread({ id });
  }

  public async removeThread(assistantId: string, id: string): Promise<void> {
    if (!assistantId) throw new Error(`argument assistantId is required`);
    if (!id) throw new Error(`argument id is required`);

    const exists = await this.findThread({ assistantId, id });
    if (!exists) throw new Error(`thread ${assistantId}/${id} not found`);

    await this.threads.remove({ assistantId, id });
  }

  // messages
  public async listAnswer(filter?: ListFilter): Promise<DocumentList<Answer>> {
    filter = filter || { condition: {} };
    if (filter.condition?.createdAt) filter.condition.createdAt = string2date(filter.condition.createdAt);
    if (filter.condition?.updatedAt) filter.condition.updatedAt = string2date(filter.condition.updatedAt);

    filter.sort = filter.sort || '-createdAt';
    // filter.limit = filter.limit || 50;
    const list = await this.answers.list<Answer>(filter);
    list.rows = list.rows?.reverse() || [];
    return list;
  }

  public async findAnswer(condition: AnyObject): Promise<Answer> {
    const doc = await this.answers.findOne<Answer>({
      condition,
      sort: '-createdAt'
    });

    return doc;
  }

  public async createAnswer(values: Answer): Promise<Answer> {
    if (!values) throw new Error(`argument values is required`);
    if (!values.id) throw new Error(`values.id is required`);

    const doc = Object.assign({}, values, {
      createdAt: new Date()
    });

    await this.answers.insert(doc);
    return doc;
  }

  public async updateAnswer(assistantId: string, id: string, values: AnyObject): Promise<Answer> {
    if (!assistantId) throw new Error(`argument assistantId is required`);
    if (!id) throw new Error(`argument id is required`);
    if (!values) throw new Error(`argument values is required`);

    const exists = await this.findAnswer({ id });
    if (!exists) throw new Error(`answer ${id} not found`);

    delete values.id;

    await this.answers.updateOne(
      { assistantId, id },
      {
        $set: Object.assign({}, values, { updatedAt: new Date() })
      }
    );

    return await this.findAnswer({ assistantId, id });
  }

  public async removeAnswer(assistantId: string, id: string): Promise<void> {
    if (!assistantId) throw new Error(`argument assistantId is required`);
    if (!id) throw new Error(`argument id is required`);

    const exists = await this.findAnswer({ assistantId, id });
    if (!exists) throw new Error(`answer ${assistantId}/${id} not found`);

    await this.answers.remove({ assistantId, id });
  }

  // DataStore
  public async listDataStore(filter?: ListFilter): Promise<DocumentList<DataStoreInfo>> {
    filter = filter || { condition: {} };
    if (filter.condition?.createdAt) filter.condition.createdAt = string2date(filter.condition.createdAt);
    if (filter.condition?.updatedAt) filter.condition.updatedAt = string2date(filter.condition.updatedAt);

    filter.sort = filter.sort || '-createdAt';
    return await this.datastore.list<DataStoreInfo>(filter);
  }

  public async findDataStore(condition: AnyObject): Promise<DataStoreInfo> {
    const doc = await this.datastore.findOne<DataStoreInfo>({
      condition,
      sort: '-createdAt'
    });

    return doc;
  }

  public async createDataStore(values: DataStoreInfo): Promise<DataStoreInfo> {
    if (!values) throw new Error(`argument values is required`);
    if (!values.name) throw new Error(`values.id is required`);

    const doc = Object.assign({}, values, {
      createdAt: new Date()
    });

    await this.datastore.insert(doc);
    return doc;
  }

  public async updateDataStore(assistantId: string, id: string, values: AnyObject): Promise<DataStoreInfo> {
    if (!assistantId) throw new Error(`argument assistantId is required`);
    if (!id) throw new Error(`argument id is required`);
    if (!values) throw new Error(`argument values is required`);

    const exists = await this.findDataStore({ assistantId, id });
    if (!exists) throw new Error(`datastore ${assistantId}/${id} not found`);

    delete values.id;

    await this.datastore.updateOne(
      { id },
      {
        $set: Object.assign({}, values, { updatedAt: new Date() })
      }
    );

    return await this.findDataStore({ assistantId, id });
  }

  public async removeDataStore(assistantId: string, id: string): Promise<void> {
    if (!assistantId) throw new Error(`argument assistantId is required`);
    if (!id) throw new Error(`argument name is required`);

    const exists = await this.findDataStore({ assistantId, id });
    if (!exists) throw new Error(`datastore ${assistantId}/${id} not found`);

    await this.datastore.remove({ assistantId, id });
  }

  public async listUsageByUser(assistantId: string, uid: string, options?: { start: Date; end: Date; interval?: 'm' | 'h' | 'd' | string }): Promise<Usage[]> {
    if (!assistantId) throw new Error(`argument assistantId is required`);
    if (options?.start && !(options?.start instanceof Date)) throw new Error(`argument options.start must be a date`);
    if (options?.end && !(options?.end instanceof Date)) throw new Error(`argument options.start must be a date`);

    const now = new Date();
    const end = options?.end ? options.end : now;
    const start = options?.start ? options.start : new Date(end.setMonth(end.getMonth() - 1));

    const pipeline = [
      {
        $match: {
          assistantId,
          'ask.uid': uid,
          'completedAt': {
            $gte: start,
            $lt: end
          }
        }
      },
      {
        $facet: {
          channelStats: [
            {
              $group: {
                _id: {
                  date: {
                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Seoul' }
                  },
                  channel: '$ask.channel'
                },
                input: { $sum: '$usage.input' },
                output: { $sum: '$usage.output' },
                total: { $sum: '$usage.total' }
              }
            },
            {
              $group: {
                _id: '$_id.date',
                channels: {
                  $push: {
                    channel: '$_id.channel',
                    tokens: {
                      input: '$input',
                      output: '$output',
                      total: '$total'
                    }
                  }
                },
                dailyTotalInput: { $sum: '$input' },
                dailyTotalOutput: { $sum: '$output' },
                dailyTotalTokens: { $sum: '$total' }
              }
            },
            {
              $project: {
                _id: 0,
                date: '$_id',
                channels: 1,
                dailyTotal: {
                  input: '$dailyTotalInput',
                  output: '$dailyTotalOutput',
                  total: '$dailyTotalTokens'
                }
              }
            },
            { $sort: { date: 1 } }
          ],
          modelStats: [
            {
              $group: {
                _id: {
                  date: {
                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Seoul' }
                  },
                  model: '$model'
                },
                input: { $sum: '$usage.input' },
                output: { $sum: '$usage.output' },
                total: { $sum: '$usage.total' }
              }
            },
            {
              $group: {
                _id: '$_id.date',
                models: {
                  $push: {
                    model: '$_id.model',
                    tokens: {
                      input: '$input',
                      output: '$output',
                      total: '$total'
                    }
                  }
                }
              }
            },
            { $sort: { _id: 1 } },
            {
              $project: {
                _id: 0,
                date: '$_id',
                models: 1
              }
            }
          ]
        }
      },
      {
        $project: {
          combined: {
            $map: {
              input: { $range: [0, { $size: '$channelStats' }] },
              as: 'idx',
              in: {
                date: { $arrayElemAt: ['$channelStats.date', '$$idx'] },
                channels: { $arrayElemAt: ['$channelStats.channels', '$$idx'] },
                models: { $arrayElemAt: ['$modelStats.models', '$$idx'] },
                dailyTotal: { $arrayElemAt: ['$channelStats.dailyTotal', '$$idx'] }
              }
            }
          }
        }
      },
      { $unwind: '$combined' },
      { $sort: { 'combined.date': 1 } }
    ];

    const result = await this.answers.aggregate<AnyObject>(pipeline);
    return result.map((day) => ({
      date: day.combined.date,
      users: null,
      channels: day.combined.channels.map((c) => ({
        channel: c.channel,
        tokens: c.tokens,
        percentage: (c.tokens / day.combined.dailyTotal) * 100
      })),
      models: day.combined.models.map((m) => ({
        model: m.model,
        tokens: m.tokens,
        percentage: (m.tokens / day.combined.dailyTotal) * 100
      })),
      total: day.combined.dailyTotal
    }));
  }

  public async listUsage(assistantId: string, options?: { start: Date; end: Date; interval?: 'm' | 'h' | 'd' | string }): Promise<Usage[]> {
    if (!assistantId) throw new Error(`argument assistantId is required`);
    if (options?.start && !(options?.start instanceof Date)) throw new Error(`argument options.start must be a date`);
    if (options?.end && !(options?.end instanceof Date)) throw new Error(`argument options.start must be a date`);

    const now = new Date();
    const end = options?.end ? options.end : now;
    const start = options?.start ? options.start : new Date(end.setMonth(end.getMonth() - 1));

    const pipeline = [
      {
        $match: {
          assistantId,
          completedAt: {
            $gte: start,
            $lt: end
          }
        }
      },
      {
        $facet: {
          channelStats: [
            {
              $group: {
                _id: {
                  date: {
                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Seoul' }
                  },
                  channel: '$ask.channel'
                },
                input: { $sum: '$usage.input' },
                output: { $sum: '$usage.output' },
                total: { $sum: '$usage.total' }
              }
            },
            {
              $group: {
                _id: '$_id.date',
                channels: {
                  $push: {
                    channel: '$_id.channel',
                    tokens: {
                      input: '$input',
                      output: '$output',
                      total: '$total'
                    }
                  }
                },
                dailyTotalInput: { $sum: '$input' },
                dailyTotalOutput: { $sum: '$output' },
                dailyTotalTokens: { $sum: '$total' }
              }
            },
            {
              $project: {
                _id: 0,
                date: '$_id',
                channels: 1,
                dailyTotal: {
                  input: '$dailyTotalInput',
                  output: '$dailyTotalOutput',
                  total: '$dailyTotalTokens'
                }
              }
            },
            { $sort: { date: 1 } }
          ],
          modelStats: [
            {
              $group: {
                _id: {
                  date: {
                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Seoul' }
                  },
                  model: '$model'
                },
                input: { $sum: '$usage.input' },
                output: { $sum: '$usage.output' },
                total: { $sum: '$usage.total' }
              }
            },
            {
              $group: {
                _id: '$_id.date',
                models: {
                  $push: {
                    model: '$_id.model',
                    tokens: {
                      input: '$input',
                      output: '$output',
                      total: '$total'
                    }
                  }
                }
              }
            },
            { $sort: { _id: 1 } },
            {
              $project: {
                _id: 0,
                date: '$_id',
                models: 1
              }
            }
          ]
        }
      },
      {
        $project: {
          combined: {
            $map: {
              input: { $range: [0, { $size: '$channelStats' }] },
              as: 'idx',
              in: {
                date: { $arrayElemAt: ['$channelStats.date', '$$idx'] },
                channels: { $arrayElemAt: ['$channelStats.channels', '$$idx'] },
                models: { $arrayElemAt: ['$modelStats.models', '$$idx'] },
                dailyTotal: { $arrayElemAt: ['$channelStats.dailyTotal', '$$idx'] }
              }
            }
          }
        }
      },
      { $unwind: '$combined' },
      { $sort: { 'combined.date': 1 } }
    ];

    const result = await this.answers.aggregate<AnyObject>(pipeline);
    return result.map((day) => ({
      date: day.combined.date,
      users: null,
      channels: day.combined.channels.map((c) => ({
        channel: c.channel,
        tokens: c.tokens,
        percentage: (c.tokens / day.combined.dailyTotal) * 100
      })),
      models: day.combined.models.map((m) => ({
        model: m.model,
        tokens: m.tokens,
        percentage: (m.tokens / day.combined.dailyTotal) * 100
      })),
      total: day.combined.dailyTotal
    }));
  }

  public async getStore(collection: string): Promise<Store> {
    const store = this[collection];
    if (!store || !(store instanceof Store)) throw new Error(`store "${collection}" not found`);
    return store;
  }
}
