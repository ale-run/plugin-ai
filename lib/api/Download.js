"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadAsDataURL = exports.downloadAsFile = exports.downloadAsStream = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const stream_1 = require("stream");
const fs_1 = require("fs");
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
const downloadAsStream = (url) => __awaiter(void 0, void 0, void 0, function* () {
    if (!url)
        throw new Error(`url is required`);
    const { body } = yield (0, node_fetch_1.default)(url);
    const stream = new stream_1.PassThrough();
    body.pipe(stream);
    return stream;
});
exports.downloadAsStream = downloadAsStream;
const downloadAsFile = (url, file) => __awaiter(void 0, void 0, void 0, function* () {
    if (!url)
        throw new Error(`url is required`);
    if (!file)
        throw new Error(`file path is required`);
    const streamPipeline = (0, util_1.promisify)(stream_1.pipeline);
    const response = yield (0, node_fetch_1.default)(url);
    yield streamPipeline(response.body, (0, fs_1.createWriteStream)(file));
    return path_1.default.resolve(file);
});
exports.downloadAsFile = downloadAsFile;
const downloadAsDataURL = (url) => __awaiter(void 0, void 0, void 0, function* () {
    if (!url)
        throw new Error('url is required');
    const response = yield (0, node_fetch_1.default)(url);
    const contentType = response.headers.get('content-type') || '';
    const arrayBuffer = yield response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString('base64');
    return `data:${contentType};base64,${base64String}`;
});
exports.downloadAsDataURL = downloadAsDataURL;
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
//# sourceMappingURL=Download.js.map