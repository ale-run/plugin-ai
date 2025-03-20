import express from 'express';
import asyncify from 'express-asyncify';
import { AIContext, IAssistant, IDataStore, IThread } from '../../api';

export default (api: AIContext) => {
  return (
    asyncify(express.Router({ mergeParams: true }))
      .use(async (req, res, next) => {
        const id = req.params.id;
        if (!id) return res.send();

        const assistant = await api.getAssistant(id);
        if (!assistant) return res.send();
        req['assistant'] = assistant;
        next();
      })
      .get('/', async (req, res) => {
        res.send(req['assistant']);
      })
      .put('/', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        res.send(await assistant.updateConfig(req.body));
      })
      // provider
      .get('/provider/:name', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        res.send(await assistant.getProviderConfig(req.params.name));
      })
      .put('/provider/:name', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        res.send(await assistant.setProviderConfig(req.params.name, req.body));
      })
      // modelconfig
      .get('/modelconfig/:name', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        res.send(await assistant.getModelConfig(req.params.name));
      })
      .put('/modelconfig/:name', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        res.send(await assistant.setModelConfig(req.params.name, req.body));
      })
      .delete('/modelconfig/:name', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        res.send(await assistant.removeModelConfig(req.params.name));
      })
      // model
      .get('/model', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        res.send(await assistant.listModel());
      })
      .get('/model/:name', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        res.send(await assistant.getModel(req.params.name));
      })
      .put('/model/:name', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        res.send(await assistant.upsertModel(req.params.name, req.body));
      })
      .put('/model/:name/enable', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        res.send(await assistant.setModelEnabled(req.params.name, req.body.enable === true ? true : false));
      })
      .delete('/model/:name', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        res.send(await assistant.removeModel(req.params.name));
      })
      // datastore
      .post('/datastore', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        res.send(await assistant.createDataStore(req.body));
      })
      .get('/datastore', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        res.send(await assistant.listDataStore());
      })
      .get('/datastore/:id', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        res.send(await assistant.getDataStore(req.params.id));
      })
      .delete('/datastore/:id', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        res.send(await assistant.removeDataStore(req.params.id));
      })
      // datastore permission
      .post('/datastore/:id/permission', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        const datastore: IDataStore = await assistant.getDataStore(req.params.id);
        res.send(await datastore.addPermission(req.body));
      })
      .delete('/datastore/:id/permission/:uid', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        const datastore: IDataStore = await assistant.getDataStore(req.params.id);
        res.send(await datastore.removePermission(req.params.uid));
      })
      // datastore file
      .get('/datastore/:id/file', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        const datastore: IDataStore = await assistant.getDataStore(req.params.id);
        res.send(await datastore.listFile());
      })
      .post('/datastore/:id/file', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        const datastore: IDataStore = await assistant.getDataStore(req.params.id);
        res.send(await datastore.addFile(req.body));
      })
      .delete('/datastore/:id/file/:oid', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        const datastore: IDataStore = await assistant.getDataStore(req.params.id);
        res.send(await datastore.removeFile(req.params.oid));
      })
      // datastore webpage
      .get('/datastore/:id/webpage', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        const datastore: IDataStore = await assistant.getDataStore(req.params.id);
        res.send(await datastore.listWebPage());
      })
      .post('/datastore/:id/webpage', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        const datastore: IDataStore = await assistant.getDataStore(req.params.id);
        res.send(await datastore.addWebPage(req.body));
      })
      .delete('/datastore/:id/webpage/:oid', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        const datastore: IDataStore = await assistant.getDataStore(req.params.id);
        res.send(await datastore.removeWebPage(req.params.oid));
      })
      // datastore query
      .get('/datastore/:id/query', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        const datastore: IDataStore = await assistant.getDataStore(req.params.id);
        res.send(await datastore.listDatabaseQuery());
      })
      .post('/datastore/:id/query', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        const datastore: IDataStore = await assistant.getDataStore(req.params.id);
        res.send(await datastore.addDatabaseQuery(req.body));
      })
      .delete('/datastore/:id/query/:oid', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        const datastore: IDataStore = await assistant.getDataStore(req.params.id);
        res.send(await datastore.removeDatabaseQuery(req.params.oid));
      })
      // datastore reindex
      .put('/datastore/:id/reindex', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        const datastore: IDataStore = await assistant.getDataStore(req.params.id);
        res.send(await datastore.reindex());
      })
      // answer
      .get('/answer', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        res.send(await assistant.listAnswer(req.body));
      })
      .get('/answer/:answerid', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        res.send(await assistant.getAnswer(req.params.answerid));
      })
      .delete('/answer/:answerid', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        res.send(await assistant.removeAnswer(req.params.answerid));
      })
      // thread
      .post('/thread', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        res.send(await assistant.createThread(req.body.owner));
      })
      .get('/thread', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        res.send(await assistant.listThread());
      })
      .use('/thread/:id', async (req, res, next) => {
        const id = req.params.id;
        if (!id) return res.send();

        const assistant: IAssistant = req['assistant'];
        const thread = await assistant.getThread(id);
        if (!thread) return res.send();
        req['thread'] = thread;
        next();
      })
      .get('/thread/:id', async (req, res) => {
        const thread: IThread = req['thread'];
        res.send(thread);
      })
      .delete('/thread/:id', async (req, res) => {
        const assistant: IAssistant = req['assistant'];
        const thread: IThread = req['thread'];

        res.send(await assistant.removeThread(thread.id));
      })
      // answer
      .get('/thread/:id/answer', async (req, res) => {
        const thread: IThread = req['thread'];
        res.send(await thread.listAnswer(req.body));
      })
      .get('/thread/:id/answer/:answerid', async (req, res) => {
        const thread: IThread = req['thread'];
        res.send(await thread.getAnswer(req.params.answerid));
      })
      .put('/thread/:id/answer/:answerid/cancel', async (req, res) => {
        const thread: IThread = req['thread'];
        res.send(await thread.cancel(req.params.answerid));
      })
      .delete('/thread/:id/answer/:answerid', async (req, res) => {
        const thread: IThread = req['thread'];
        res.send(await thread.removeAnswer(req.params.answerid));
      })
      .post('/thread/:id/run', async (req, res) => {
        const thread: IThread = req['thread'];
        res.send(await thread.run(req.body));
      })
      // usage
      .get('/usage', async (req, res) => {
        const assistant: IAssistant = req['assistant'];

        const start = req.query.start ? new Date(req.query.start as string) : null;
        const end = req.query.end ? new Date(req.query.end as string) : null;

        res.send(await assistant.listUsage(start, end));
      })
  );
};
