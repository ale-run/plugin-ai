import { Plugin, Logger, APIServer, AnyObject } from '@ale-run/runtime';
import { AIContext } from './api';
import { AIRouter, AIRouterWebSocket } from './server';
import { OpenAIProvider } from './provider';
import path from 'node:path';
import chalk from 'ansi-colors';

const logger = Logger.getLogger('plugin:ai');

export default class AIPlugin extends Plugin {
  public async activate(): Promise<void> {
    logger.info(chalk.blue.bold(`plugin ${this.name} is activate`), this.options);

    // install apps
    const catalog = await this.context.getCatalog();
    await catalog.regist(`${path.resolve(__dirname, 'app/ai-assistant')}`);
    await catalog.registPreset(`${path.resolve(__dirname, 'app/ai-assistant')}`);

    // init api routes
    const DB_URL = this.options.DB_URL || this.context.config.get('defaults').dburl;
    const DB_NAME = this.options.DB_NAME || this.options.DB_URL ? '' : 'ai';
    const OPENAI_API_KEY = this.options.OPENAI_API_KEY || process.env.OPENAI_API_KEY;

    logger.info('options', this.options);
    logger.info('DB_URL', DB_URL);
    logger.info('DB_NAME', DB_NAME);
    logger.info('OPENAI_API_KEY', OPENAI_API_KEY);

    const context = new AIContext({
      db: {
        url: DB_URL,
        db: DB_NAME
      }
    });

    context.registProvider(
      'openai',
      new OpenAIProvider({
        apikey: OPENAI_API_KEY
      })
    );

    const airouter = AIRouter(context);

    const server: APIServer = this.get('api-server');
    const router = server.routers.body.get(this.name);

    router.use('/ai', airouter);

    AIRouterWebSocket(server.httpd, context, async (message: { request: AnyObject; headers: AnyObject; params: AnyObject }): Promise<boolean> => {
      const headers = message.headers || message.request.headers;
      const tokenheader = headers['Authorization'] || headers['authorization'];
      const clienttoken = Array.isArray(tokenheader) ? tokenheader[0]?.split(' ')[1] : tokenheader?.split(' ')[1];
      if (!clienttoken) throw new Error(`Access has been restricted`);

      return true;
    });

    this.set('api', context);
  }

  public async deactivate(): Promise<void> {
    logger.info(chalk.red(`plugin ${this.name} will be deactivate`));

    const server: APIServer = this.get('api-server');
    server?.routers?.body?.remove(this.name);
  }
}

export * from './api/spec';
