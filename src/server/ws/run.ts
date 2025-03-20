import { AIContext, AskStreaming, Logger, AnyObject } from '../../api';
import WebSocket, { createWebSocketStream } from 'ws';
import { Readable } from 'stream';
import chalk from 'ansi-colors';

const logger = Logger.getLogger('ws:logs');

export default (api: AIContext, authenticator?: (message: { request: AnyObject; headers: AnyObject; params: AnyObject }) => Promise<boolean>) => {
  const wss = new WebSocket.Server({ noServer: true });

  wss
    .on('error', (err) => {
      logger.error(err);
    })
    .on('connection', (ws, req) => {
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());

          if (message.type === 'prepare') {
            const assistantId = message.params.assistantId;
            const threadId = message.params.threadId;
            const ask = message.params.ask;

            if (!assistantId) throw new Error(`params.assistantId is required`);
            if (!threadId) throw new Error(`params.threadId is required`);

            authenticator =
              authenticator ||
              (async (message: { request: AnyObject; headers: AnyObject; params: AnyObject }): Promise<boolean> => {
                const headers = message.headers || message.request.headers;
                const tokenheader = headers['Authorization'] || headers['authorization'];
                const clienttoken = Array.isArray(tokenheader) ? tokenheader[0]?.split(' ')[1] : tokenheader?.split(' ')[1];
                if (!clienttoken) throw new Error(`Access has been restricted`);

                const token = await api.getAccessToken(assistantId);
                return clienttoken && token === clienttoken;
              });

            if (!(await authenticator({ request: req, headers: message.headers, params: message.params }))) {
              throw new Error(`permission denied`);
            }

            const assistant = await api.getAssistant(assistantId);
            if (!assistant) throw new Error(`assistant id ${assistantId} not found`);
            const thread = await assistant.getThread(threadId);
            if (!assistant) throw new Error(`thread id ${threadId} not found`);

            const readable: Readable = await thread.run(Object.assign({}, ask, { streaming: true }) as AskStreaming);
            const wsstream = createWebSocketStream(ws, { encoding: 'utf8' });

            readable?.on('error', (err) => {
              logger.warn(err);
            });
            wsstream.on('error', (err) => {
              logger.warn(err);
            });

            ws.send('accept');
            readable?.pipe(wsstream);
          } else if (!message.type) {
            throw new Error(`message type is required`);
          } else {
            throw new Error(`unknown message type: ${message.type}`);
          }
        } catch (err) {
          logger.error(err);
          const lines = err.stack.split('\n');
          logger.error(chalk.red(lines[0]));
          logger.error(chalk.gray(lines.slice(1).join('\n')));

          try {
            ws.send(
              JSON.stringify({
                type: 'error',
                message: err.message,
                cause: err.cause,
                errors: err.errors
              })
            );
          } catch (err) {}

          try {
            ws.close();
          } catch (err) {}
        }
      }).on('error', (err) => {
        logger.error(err);
      });
    });

  return wss;
};
