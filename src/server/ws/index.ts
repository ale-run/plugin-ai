import { AIContext, AnyObject } from '../../api';
import url from 'url';
import run from './run';

let listner;

export default (
  server,
  context: AIContext,
  authenticator?: (message: { request: AnyObject; headers: AnyObject; params: AnyObject }) => Promise<boolean>
) => {
  const wsrun = run(context, authenticator);

  if (listner) server.off('upgrade', listner);

  listner = (request, socket, head) => {
    const pathname = url.parse(request.url).pathname;
    const pathes = pathname.split('/');
    const program = pathes.slice(2).join('/');

    if (program === 'run') {
      wsrun.handleUpgrade(request, socket, head, (ws) => {
        wsrun.emit('connection', ws, request);
      });
    }
  };

  server.on('upgrade', listner);
};
