import express from 'express';
import assistant from './assistant';
import { AIContext } from '../../api';

export default (api: AIContext) => {
  return express
    .Router()
    .get('/provider', async (req, res) => {
      res.send(await api.listProvider());
    })
    .post('/', async (req, res) => {
      res.send(await api.createAssistant(req.body));
    })
    .get('/byname/:name', async (req, res) => {
      const name = req.params.name;
      if (!name) return res.send();

      const assistant = await api.getAssistantByName(name);
      res.send(assistant);
    })
    .use('/:id', assistant(api));
};
