import { IAssistant, ThreadInfo, IThread, Answer, AnswerUsage, DocumentList, AnyObject, ListFilter, Ask, uniqid, AskSync, AskStreaming, ANSWER_STATUS, StreamResponse, RunResult } from './spec';
import { Assistant } from './Assistant';
import { AIContext } from './AIContext';
import { Logger } from './Logger';
import { MongoAIPersistance } from './db';
import chalk from 'ansi-colors';
import { PassThrough } from 'stream';
import { downloadAsDataURL } from './Download';

const logger = Logger.getLogger('ai:thread');

export class Thread implements IThread {
  private assistant: Assistant;
  private doc: ThreadInfo;
  private context: AIContext;

  constructor(assistant: Assistant, doc: ThreadInfo, context: AIContext) {
    this.assistant = assistant;
    this.doc = doc;
    this.context = context;
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

  public get model(): string {
    return this.doc.model;
  }

  public get summary(): string {
    return this.doc.summary;
  }

  public get archivedAt(): Date {
    return this.doc.archivedAt;
  }

  public get updatedAt(): Date {
    return this.doc.updatedAt;
  }

  public get createdAt(): Date {
    return this.doc.createdAt;
  }

  private get persist(): MongoAIPersistance {
    return this.context.persist;
  }

  public getAssistant(): IAssistant {
    return this.assistant;
  }

  public async listAnswer(filter: ListFilter): Promise<DocumentList<Answer>> {
    logger.debug(`[thread/${this.assistantId}/${this.id}] listAnswer`, chalk.cyan(JSON.stringify(filter, null, 2)));

    filter = filter || {
      condition: {},
      offset: 0,
      limit: 50
    };
    filter.condition = filter.condition || {};
    filter.condition.assistantId = this.assistant.id;
    filter.condition.threadId = this.id;

    return await this.persist.listAnswer(filter);
  }

  public async getAnswer(id?: string): Promise<Answer> {
    logger.debug(`[thread/${this.assistantId}/${this.id}] getAnswer`, chalk.cyan(JSON.stringify(id, null, 2)));
    const doc = await this.persist.findAnswer({ id });
    if (!doc || doc.assistantId !== this.id) return null;
    return doc;
  }

  public async removeAnswer(id: string): Promise<void> {
    logger.debug(`[thread/${this.assistantId}/${this.id}] removeAnswer`, chalk.cyan(JSON.stringify(id, null, 2)));

    const answer = await this.getAnswer(id);
    if (answer) {
      await this.persist.removeAnswer(this.assistantId, answer.id);
    }
  }

  public async getModelConfig(name: string): Promise<AnyObject> {
    const model = await this.assistant.getModel(name);
    if (!model) return null;

    return await this.persist.findModelConfig({ assistantId: this.id, threadId: this.id, name });
  }

  public async setModelConfig(name: string, config: AnyObject): Promise<void> {
    if (!config) {
      await this.persist.removeModelConfig(this.assistantId, this.id, name);
    } else {
      await this.persist.upsertModelConfig(this.assistantId, this.id, name, config);
    }
  }

  run(ask: AskSync): Promise<Answer>;
  run(ask: AskStreaming): Promise<StreamResponse>;
  public async run(ask: AskSync | AskStreaming): Promise<Answer | StreamResponse> {
    console.log('ask', JSON.stringify(ask, null, 2));

    const response = new PassThrough();

    const answer: Answer = await this.persist.createAnswer({
      id: uniqid(),
      assistantId: this.assistant.id,
      threadId: this.id,
      status: ANSWER_STATUS.inprogress,
      ask,
      temporary: ask.temporary === true ? true : false,
      createdAt: new Date()
    });

    (async () => {
      try {
        const model = await this.assistant.getModel(ask.model);
        if (!model) throw new Error(`[thread/${this.assistantId}/${this.id}] model "${ask.model}" not found`);

        const provider = await this.context.getProvider(model.provider);
        const providerconfig = await this.assistant.getProviderConfig(model.provider);
        const config = Object.assign({}, providerconfig, await this.getModelConfig(ask.model), model.config);

        console.log('config', JSON.stringify(config, null, 2));

        await this.persist.updateAnswer(this.assistantId, answer.id, {
          model: model.name
        });

        const messages = [];
        if (ask.temporary !== true) {
          const answers = await this.listAnswer({
            condition: {
              temporary: { $ne: true },
              $or: [{ error: null }, { error: { $exists: false } }],
              result: { $exists: true },
              completedAt: { $ne: true }
            },
            offset: 0,
            limit: 50,
            sort: 'createdAt',
            fields: 'id result ask.prompt createdAt completedAt'
          });

          answers?.rows?.forEach((o) => {
            if (!o.result || !o.ask?.prompt) return;
            messages.unshift({
              role: 'assistant',
              content: typeof o.result === 'string' ? o.result : JSON.stringify(o.result)
            });
            messages.unshift({
              role: 'user',
              content: o.ask.prompt
            });
          });
        }

        // add system prompt
        messages.unshift({
          role: 'system',
          content: "You are a helpful assistant. Respond to the user's questions in the language in which they were asked, and write responses to text in Markdown format."
        });

        const userMessages = [];

        // add files to message
        if (ask.files?.length) {
          for (const file of ask.files) {
            const type = file.type;

            const dataurl = await downloadAsDataURL(file.src);
            userMessages.push({
              type: 'image_url',
              image_url: {
                url: dataurl
              }
            });
          }
        }

        userMessages.push({
          type: 'text',
          text: ask.prompt
        });

        // add prompt
        messages.push({
          role: 'user',
          content: userMessages
        });

        const store = await this.persist.findDataStore({ name: ask.store });
        const stream = await provider.run({
          thread: this,
          ask,
          config,
          user: ask.user,
          model: ask.model,
          prompt: ask.prompt,
          messages
        });

        await this.persist.updateThread(this.assistantId, this.id, {
          owner: this.owner || ask.user,
          latest: ask,
          updatedAt: new Date()
        });

        if (ask.streaming === false) {
          //
        }

        stream
          .on('data', (chunk) => {
            response.write(chunk);
          })
          .on('error', async (error) => {
            try {
              await this.persist.updateAnswer(this.assistantId, answer.id, {
                status: ANSWER_STATUS.error,
                error: error.message
              });
              response.emit('error', error);
            } catch (err) {
              logger.error(err);
            } finally {
              response.end();
            }
          })
          .on('usage', async (usage: AnswerUsage) => {
            await this.persist.updateAnswer(this.assistantId, answer.id, {
              usage
            });
            response.emit('usage', usage);
          })
          .on('complete', async (values: RunResult) => {
            try {
              logger.debug('complete', values);
              answer.status = ANSWER_STATUS.complete;
              answer.raw = values.raw;
              answer.result = values.result;
              answer.usage = values.usage;
              answer.annotations = values.annotations;
              answer.completedAt = new Date();

              await this.persist.updateThread(this.assistantId, this.id, {
                summary: values.summary,
                channel: ask.channel,
                updatedAt: answer.completedAt
              });

              await this.persist.updateAnswer(this.assistantId, answer.id, {
                status: ANSWER_STATUS.complete,
                raw: answer.raw,
                result: answer.result,
                usage: answer.usage,
                annotations: answer.annotations,
                completedAt: answer.completedAt
              });

              response.emit('complete', await this.persist.findAnswer({ id: answer.id }));
            } catch (err) {
              logger.error(err);

              try {
                await this.persist.updateAnswer(this.assistantId, answer.id, {
                  status: ANSWER_STATUS.error,
                  error: err.message
                });
              } catch (err) {
                logger.error(err);
              }

              response.emit('complete', await this.persist.findAnswer({ id: answer.id }));
            } finally {
              response.end();
            }
          });
      } catch (err) {
        logger.error(err);

        try {
          await this.persist.updateAnswer(this.assistantId, answer.id, {
            status: ANSWER_STATUS.error,
            error: err.message
          });
        } catch (err) {
          logger.error(err);
        }

        response.emit('complete', await this.persist.findAnswer({ id: answer.id }));
        response.end();
      }
    })();

    return response;
  }

  public async cancel(id: string): Promise<void> {
    //
  }

  public async reload(): Promise<void> {
    this.doc = await this.persist.findThread({ id: this.id });
  }

  // misc
  public toJSON() {
    const doc = this.doc;
    if (!doc) return null;
    return {
      assistantId: doc.assistantId,
      id: doc.id,
      owner: doc.owner,
      model: doc.model,
      latest: doc.latest,
      summary: doc.summary,
      archivedAt: doc.archivedAt,
      updatedAt: doc.updatedAt,
      createdAt: doc.createdAt
    };
  }

  public toString() {
    return JSON.stringify(this.toJSON());
  }
}
