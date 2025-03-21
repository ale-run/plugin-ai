import fetch from 'node-fetch';
import { Readable, PassThrough, pipeline } from 'stream';
import { createWriteStream } from 'fs';
import { promisify } from 'util';
import path from 'path';

export const downloadAsStream = async (url: string): Promise<Readable> => {
  if (!url) throw new Error(`url is required`);
  const { body } = await fetch(url);
  const stream = new PassThrough();
  body.pipe(stream);
  return stream;
};

export const downloadAsFile = async (url: string, file: string): Promise<string> => {
  if (!url) throw new Error(`url is required`);
  if (!file) throw new Error(`file path is required`);

  const streamPipeline = promisify(pipeline);
  const response = await fetch(url);
  await streamPipeline(response.body, createWriteStream(file));
  return path.resolve(file);
};

export const downloadAsDataURL = async (url: string): Promise<string> => {
  if (!url) throw new Error('url is required');

  const response = await fetch(url);
  const contentType = response.headers.get('content-type') || '';
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64String = buffer.toString('base64');
  return `data:${contentType};base64,${base64String}`;
};

/*
import pdf from 'pdf-parse';
export const extractPdfContent = async (url: string): Promise<string> => {
  if (!url) throw new Error('url is required');

  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const pdfData = await pdf(buffer);
  return pdfData.text;
};
*/