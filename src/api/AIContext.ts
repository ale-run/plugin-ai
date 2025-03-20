import { AnyObject, IAssistant, AssistantInfo, ProviderInfo, DocumentList, ListFilter, AssistantConfig, Model, MODEL_TYPE, uniqid, Provider } from './spec';
import { MongoAIPersistance } from './db';
import { Assistant } from './Assistant';
import { Logger } from './Logger';
import chalk from 'ansi-colors';

const logger = Logger.getLogger('ai');

export class AIContextOptions {
  public db: {
    url: string;
    db?: string;
  };
}

export class AIContext {
  public readonly options: AIContextOptions;
  public readonly persist: MongoAIPersistance;
  public readonly providers: { [name: string]: Provider } = {};
  public initialized = false;

  constructor(options: AIContextOptions) {
    logger.debug(`[assistant] init with`, chalk.cyan(JSON.stringify(options, null, 2)));

    if (!options) throw new Error('options is required');
    if (!options.db?.url) throw new Error('options.db.url is required');

    this.options = options;
    this.persist = new MongoAIPersistance(options.db);
  }

  public async listAssistant(filter?: ListFilter): Promise<DocumentList<AssistantInfo>> {
    logger.debug(`[assistant] listAssistant`, chalk.cyan(JSON.stringify(filter, null, 2)));

    return await this.persist.listAssistant(filter);
  }

  public async createAssistant(values: { name?: string; owner: string; displayName?: string; config?: AssistantConfig; info?: AnyObject }): Promise<IAssistant> {
    logger.debug(`[assistant] createAssistant`, chalk.cyan(JSON.stringify(values, null, 2)));

    const { name, owner, displayName, config, info } = values;

    if (!owner) throw new Error(`owner is required`);

    const id = uniqid();
    const vo: AssistantInfo = {
      id: id,
      name: name || id,
      owner,
      displayName,
      config: config,
      info: info,
      createdAt: new Date()
    };

    await this.persist.createAssistant(vo);
    return await this.getAssistant(vo.id);
  }

  public async getAssistant(id: string): Promise<IAssistant> {
    logger.debug(`[assistant] getAssistant`, chalk.cyan(id));
    if (!id) throw new Error('id is required');

    const doc = await this.persist.findAssistant({ id });
    if (!doc) return null;

    return new Assistant(doc, this);
  }

  public async getAssistantByName(name: string): Promise<IAssistant> {
    logger.debug(`[assistant] getAssistantByName`, chalk.cyan(name));
    if (!name) throw new Error('name is required');

    const doc = await this.persist.findAssistant({ name });
    if (!doc) return null;

    return new Assistant(doc, this);
  }

  public async getAssistantByUser(owner: string): Promise<IAssistant[]> {
    logger.debug(`[assistant] getAssistantByUser`, chalk.cyan(owner));
    if (!owner) throw new Error('uid is required');

    const list = await this.persist.listAssistant({ condition: { owner } });
    if (!list?.rows?.length) return null;

    return list?.rows?.map((row) => new Assistant(row, this));
  }

  public getProvider(name: string): Provider {
    const provider = this.providers[name];
    if (!provider) throw new Error(`unsupported provider: ${name}`);
    return provider;
  }

  public listProvider(): ProviderInfo[] {
    return Object.keys(this.providers).map((name) => {
      const provider = this.providers[name];
      return {
        name,
        displayName: provider.displayName,
        icon: provider.icon,
        schema: provider.schema,
        modelSchema: provider.modelSchema
      };
    });
  }

  public async listModel(): Promise<Model[]> {
    const models = [];

    Object.keys(this.providers).forEach((name) => {
      const provider = this.providers[name];
      const list = provider.listModel();

      list?.forEach((model) => {
        models.push({
          name: model.name,
          provider: name,
          displayName: model.displayName,
          schema: model.schema,
          enable: model.enable,
          icon: model.icon || provider.icon,
          type: model.type || MODEL_TYPE.text
        });
      });
    });

    return models;
  }

  public async removeAssistant(id: string): Promise<void> {
    logger.debug(`[assistant] removeAssistant`, chalk.cyan(id));
    const doc = await this.persist.findAssistant({ id });
    if (!doc) throw new Error(`assistant account not found: ${id}`);

    await this.persist.removeAssistant(id);
  }

  public async getAccessToken(id: string): Promise<string> {
    logger.debug(`[assistant] getAccessToken`, chalk.cyan(id));
    return (await this.persist.getAccessToken(id)) || (await this.persist.createAccessToken(id));
  }

  public async renewAccessToken(id: string): Promise<string> {
    logger.debug(`[assistant] renewAccessToken`, chalk.cyan(id));
    return (await this.persist.getAccessToken(id)) && (await this.persist.renewAccessToken(id));
  }

  public async removeAccessToken(id: string): Promise<void> {
    logger.debug(`[assistant] removeAccessToken`, chalk.cyan(id));
    await this.persist.removeAccessToken(id);
  }

  public async registProvider(name: string, provider: Provider): Promise<void> {
    this.providers[name] = provider;
  }

  public async unregistProvider(name: string): Promise<void> {
    delete this.providers[name];
  }
}
