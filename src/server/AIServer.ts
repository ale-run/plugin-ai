import { Errors, Logger, AnyObject, LOG_LEVEL } from '../api';
import { AIContext } from '../api';
import express from 'express';
import http from 'http';
import bodyparser from 'body-parser';
import fs from 'fs';
import path from 'path';
import chalk from 'ansi-colors';
import httpRoute from './routes';
import wsRoute from './ws';

const logger = Logger.getLogger('httpd');

const version = (() => {
  try {
    const versionfile = path.join(process.cwd(), 'VERSION');
    return fs.existsSync(versionfile) && fs.readFileSync(versionfile).toString();
  } catch (err) {
    logger.error(err);
  }
})();

export class AIServer {
  public host: string;
  public port: number;
  public portssl: number;
  public httpd: http.Server;
  public app: express.Application;
  public routes: express.Application;

  private token: string;
  private options: {
    context: AIContext;
    host?: string;
    port?: number;
    token: string;
  };

  constructor(options: { context: AIContext; host?: string; port?: number; portssl?: number; token: string }) {
    if (!options) throw new Error('options required');
    if (!options.context) throw new Error('options.context required');
    this.options = options;
  }

  public async getToken(): Promise<string> {
    return this.token || this.options.token;
  }

  public async start(): Promise<void> {
    await this.stop();

    const options = this.options;
    const host = (this.host = options.host || '0.0.0.0');
    const port = (this.port = +options.port || 9700);
    const context = options.context;
    const servertoken = await this.getToken();

    const app = express();

    app
      .set('trust proxy', true)
      .disable('x-powered-by')
      /*
      .use(async (req, res, next) => {
        try {
          if (!req.headers?.authorization || !req.headers?.authorization?.toLowerCase()?.startsWith('bearer ')) {
            res.status(403).end();
            throw new Error(`invalid access token`);
          }

          const clienttoken = req.headers?.authorization?.split(' ')[1];
          if (!clienttoken || !clienttoken.startsWith('cat-')) {
            res.status(403).end();
            throw new Error(`invalid access token`);
          }

          if (clienttoken !== servertoken) {
            res.status(401).send();
            throw new Error(`invalid access token`);
          }

          next();
        } catch (err) {
          logger.error(`${chalk.blueBright(req.ip)} ${chalk.magentaBright(req.method)} ${chalk.white(req.originalUrl)}`, err);
        }
      })
      */
      .get('/', async (req, res) => {
        res.send({
          version,
          client: ~req.ip?.indexOf(',') ? req.ip?.split(',')[0].trim() : req.ip
        });
      })
      .use(bodyparser.urlencoded({ extended: false }))
      .use(bodyparser.json())
      .use(async (req, res, next) => {
        req['startedAt'] = new Date();

        res.on('finish', (a) => {
          const ms = new Date().getTime() - req['startedAt'].getTime();

          if (!~['OPTIONS'].indexOf(req.method.toUpperCase())) {
            logger.log(
              req.method.toUpperCase() === 'GET' ? LOG_LEVEL.debug : LOG_LEVEL.info,
              `${chalk.blueBright(req.ip)} ${
                ~['GET'].indexOf(req.method) ? chalk.magentaBright(req.method) : chalk.yellowBright(req.method)
              } ${chalk.white(req.originalUrl)} +${
                ms > 1000 ? chalk.red(ms.toString()) : ms > 100 ? chalk.yellow(ms.toString()) : chalk.green(ms.toString())
              }ms`
            );
          }
        });

        next();
      })
      .use(httpRoute(context))
      .use((req, res) => {
        res.status(404).send('Not Found');
      })
      .use((err: any, req, res, next) => {
        const code = err.code || err.cause?.code || err.cause?.cause?.code || err.cause?.cause?.cause?.code || err.cause?.cause?.cause?.cause?.code;

        if (code)
          logger.error(
            `${chalk.blueBright(req.ip)} ${chalk.magentaBright(req.method)} ${chalk.white(req.originalUrl)} [${code}] ${err.message}`,
            JSON.stringify(err)
          );
        else
          logger.error(
            `${chalk.blueBright(req.ip)} ${chalk.magentaBright(req.method)} ${chalk.white(req.originalUrl)} ${err.message}`,
            JSON.stringify(err)
          );

        if (err instanceof Errors) {
          for (const e of err.errors) {
            const lines = e.stack.split('\n');
            logger.error(chalk.red(lines[0]));
            logger.error(chalk.gray(lines.slice(1).join('\n')));
          }
        } else {
          const lines = err.stack.split('\n');
          logger.error(chalk.red(lines[0]));
          logger.error(chalk.gray(lines.slice(1).join('\n')));
        }

        res
          .status(500)
          .type('application/json')
          .send(
            JSON.stringify({
              error: true,
              code,
              type: err.type,
              message: err.message,
              cause: err.cause,
              stack: err.stack,
              errors: err.errors
            })
          );
      });

    this.app = app;
    this.httpd = await http.createServer(app).listen({ host, port });
    wsRoute(
      this.httpd,
      context,
      servertoken &&
        (async (message: { request: AnyObject; headers: AnyObject; params: AnyObject }): Promise<boolean> => {
          const headers = message.headers || message.request.headers;
          const tokenheader = headers['Authorization'] || headers['authorization'];
          const clienttoken = Array.isArray(tokenheader) ? tokenheader[0]?.split(' ')[1] : tokenheader?.split(' ')[1];
          if (!clienttoken) throw new Error(`Access has been restricted`);

          return clienttoken && servertoken === clienttoken;
        })
    );
  }

  public async stop(): Promise<void> {
    if (!this.httpd) return;
    await this.httpd.close();
  }

  public async getCurrentNamespace(): Promise<string> {
    const namespacefile = '/var/run/secrets/kubernetes.io/serviceaccount/namespace';
    return process.env.AGENT_NAMESPACE || (fs.existsSync(namespacefile) && fs.readFileSync(namespacefile)?.toString('utf-8')?.trim());
  }
}
