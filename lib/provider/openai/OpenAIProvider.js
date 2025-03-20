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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
const api_1 = require("../../api");
const openai_1 = __importDefault(require("openai"));
const stream_1 = require("stream");
const logger = api_1.Logger.getLogger('ai:openai');
class OpenAIProvider extends api_1.Provider {
    constructor(options) {
        super(options);
        this.displayName = 'OpenAI';
        this.icon = {
            src: 'data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjI1MDAiIHZpZXdCb3g9Ii0xIC0uMSA5NDkuMSA5NTkuOCIgd2lkdGg9IjI0NzQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+Cgk8cGF0aCBkPSJtOTI1LjggNDU2LjNjMTAuNCAyMy4yIDE3IDQ4IDE5LjcgNzMuMyAyLjYgMjUuMyAxLjMgNTAuOS00LjEgNzUuOC01LjMgMjQuOS0xNC41IDQ4LjgtMjcuMyA3MC44LTguNCAxNC43LTE4LjMgMjguNS0yOS43IDQxLjItMTEuMyAxMi42LTIzLjkgMjQtMzcuNiAzNC0xMy44IDEwLTI4LjUgMTguNC00NC4xIDI1LjMtMTUuNSA2LjgtMzEuNyAxMi00OC4zIDE1LjQtNy44IDI0LjItMTkuNCA0Ny4xLTM0LjQgNjcuNy0xNC45IDIwLjYtMzMgMzguNy01My42IDUzLjYtMjAuNiAxNS00My40IDI2LjYtNjcuNiAzNC40LTI0LjIgNy45LTQ5LjUgMTEuOC03NSAxMS44LTE2LjkuMS0zMy45LTEuNy01MC41LTUuMS0xNi41LTMuNS0zMi43LTguOC00OC4yLTE1LjdzLTMwLjItMTUuNS00My45LTI1LjVjLTEzLjYtMTAtMjYuMi0yMS41LTM3LjQtMzQuMi0yNSA1LjQtNTAuNiA2LjctNzUuOSA0LjEtMjUuMy0yLjctNTAuMS05LjMtNzMuNC0xOS43LTIzLjItMTAuMy00NC43LTI0LjMtNjMuNi00MS40cy0zNS0zNy4xLTQ3LjctNTkuMWMtOC41LTE0LjctMTUuNS0zMC4yLTIwLjgtNDYuM3MtOC44LTMyLjctMTAuNi00OS42Yy0xLjgtMTYuOC0xLjctMzMuOC4xLTUwLjcgMS44LTE2LjggNS41LTMzLjQgMTAuOC00OS41LTE3LTE4LjktMzEtNDAuNC00MS40LTYzLjYtMTAuMy0yMy4zLTE3LTQ4LTE5LjYtNzMuMy0yLjctMjUuMy0xLjMtNTAuOSA0LTc1LjhzMTQuNS00OC44IDI3LjMtNzAuOGM4LjQtMTQuNyAxOC4zLTI4LjYgMjkuNi00MS4yczI0LTI0IDM3LjctMzQgMjguNS0xOC41IDQ0LTI1LjNjMTUuNi02LjkgMzEuOC0xMiA0OC40LTE1LjQgNy44LTI0LjMgMTkuNC00Ny4xIDM0LjMtNjcuNyAxNS0yMC42IDMzLjEtMzguNyA1My43LTUzLjcgMjAuNi0xNC45IDQzLjQtMjYuNSA2Ny42LTM0LjQgMjQuMi03LjggNDkuNS0xMS44IDc1LTExLjcgMTYuOS0uMSAzMy45IDEuNiA1MC41IDUuMXMzMi44IDguNyA0OC4zIDE1LjZjMTUuNSA3IDMwLjIgMTUuNSA0My45IDI1LjUgMTMuNyAxMC4xIDI2LjMgMjEuNSAzNy41IDM0LjIgMjQuOS01LjMgNTAuNS02LjYgNzUuOC00czUwIDkuMyA3My4zIDE5LjZjMjMuMiAxMC40IDQ0LjcgMjQuMyA2My42IDQxLjQgMTguOSAxNyAzNSAzNi45IDQ3LjcgNTkgOC41IDE0LjYgMTUuNSAzMC4xIDIwLjggNDYuMyA1LjMgMTYuMSA4LjkgMzIuNyAxMC42IDQ5LjYgMS44IDE2LjkgMS44IDMzLjktLjEgNTAuOC0xLjggMTYuOS01LjUgMzMuNS0xMC44IDQ5LjYgMTcuMSAxOC45IDMxIDQwLjMgNDEuNCA2My42em0tMzMzLjIgNDI2LjljMjEuOC05IDQxLjYtMjIuMyA1OC4zLTM5czMwLTM2LjUgMzktNTguNGM5LTIxLjggMTMuNy00NS4yIDEzLjctNjguOHYtMjIzcS0uMS0uMy0uMi0uNy0uMS0uMy0uMy0uNi0uMi0uMy0uNS0uNS0uMy0uMy0uNi0uNGwtODAuNy00Ni42djI2OS40YzAgMi43LS40IDUuNS0xLjEgOC4xLS43IDIuNy0xLjcgNS4yLTMuMSA3LjZzLTMgNC42LTUgNi41YTMyLjEgMzIuMSAwIDAgMSAtNi41IDVsLTE5MS4xIDExMC4zYy0xLjYgMS00LjMgMi40LTUuNyAzLjIgNy45IDYuNyAxNi41IDEyLjYgMjUuNSAxNy44IDkuMSA1LjIgMTguNSA5LjYgMjguMyAxMy4yIDkuOCAzLjUgMTkuOSA2LjIgMzAuMSA4IDEwLjMgMS44IDIwLjcgMi43IDMxLjEgMi43IDIzLjYgMCA0Ny00LjcgNjguOC0xMy44em0tNDU1LjEtMTUxLjRjMTEuOSAyMC41IDI3LjYgMzguMyA0Ni4zIDUyLjcgMTguOCAxNC40IDQwLjEgMjQuOSA2Mi45IDMxczQ2LjYgNy43IDcwIDQuNiA0NS45LTEwLjcgNjYuNC0yMi41bDE5My4yLTExMS41LjUtLjVxLjItLjIuMy0uNi4yLS4zLjMtLjZ2LTk0bC0yMzMuMiAxMzQuOWMtMi40IDEuNC00LjkgMi40LTcuNSAzLjItMi43LjctNS40IDEtOC4yIDEtMi43IDAtNS40LS4zLTguMS0xLTIuNi0uOC01LjItMS44LTcuNi0zLjJsLTE5MS4xLTExMC40Yy0xLjctMS00LjItMi41LTUuNi0zLjQtMS44IDEwLjMtMi43IDIwLjctMi43IDMxLjFzMSAyMC44IDIuOCAzMS4xYzEuOCAxMC4yIDQuNiAyMC4zIDguMSAzMC4xIDMuNiA5LjggOCAxOS4yIDEzLjIgMjguMnptLTUwLjItNDE3Yy0xMS44IDIwLjUtMTkuNCA0My4xLTIyLjUgNjYuNXMtMS41IDQ3LjEgNC42IDcwYzYuMSAyMi44IDE2LjYgNDQuMSAzMSA2Mi45IDE0LjQgMTguNyAzMi4zIDM0LjQgNTIuNyA0Ni4ybDE5My4xIDExMS42cS4zLjEuNy4yaC43cS40IDAgLjctLjIuMy0uMS42LS4zbDgxLTQ2LjgtMjMzLjItMTM0LjZjLTIuMy0xLjQtNC41LTMuMS02LjUtNWEzMi4xIDMyLjEgMCAwIDEgLTUtNi41Yy0xLjMtMi40LTIuNC00LjktMy4xLTcuNi0uNy0yLjYtMS4xLTUuMy0xLTguMXYtMjI3LjFjLTkuOCAzLjYtMTkuMyA4LTI4LjMgMTMuMi05IDUuMy0xNy41IDExLjMtMjUuNSAxOC03LjkgNi43LTE1LjMgMTQuMS0yMiAyMi4xLTYuNyA3LjktMTIuNiAxNi41LTE3LjggMjUuNXptNjYzLjMgMTU0LjRjMi40IDEuNCA0LjYgMyA2LjYgNSAxLjkgMS45IDMuNiA0LjEgNSA2LjUgMS4zIDIuNCAyLjQgNSAzLjEgNy42LjYgMi43IDEgNS40LjkgOC4ydjIyNy4xYzMyLjEtMTEuOCA2MC4xLTMyLjUgODAuOC01OS43IDIwLjgtMjcuMiAzMy4zLTU5LjcgMzYuMi05My43cy0zLjktNjguMi0xOS43LTk4LjUtMzkuOS01NS41LTY5LjUtNzIuNWwtMTkzLjEtMTExLjZxLS4zLS4xLS43LS4yaC0uN3EtLjMuMS0uNy4yLS4zLjEtLjYuM2wtODAuNiA0Ni42IDIzMy4yIDEzNC43em04MC41LTEyMWgtLjF2LjF6bS0uMS0uMWM1LjgtMzMuNiAxLjktNjguMi0xMS4zLTk5LjctMTMuMS0zMS41LTM1LTU4LjYtNjMtNzguMi0yOC0xOS41LTYxLTMwLjctOTUuMS0zMi4yLTM0LjItMS40LTY4IDYuOS05Ny42IDIzLjlsLTE5My4xIDExMS41cS0uMy4yLS41LjVsLS40LjZxLS4xLjMtLjIuNy0uMS4zLS4xLjd2OTMuMmwyMzMuMi0xMzQuN2MyLjQtMS40IDUtMi40IDcuNi0zLjIgMi43LS43IDUuNC0xIDguMS0xIDIuOCAwIDUuNS4zIDguMiAxIDIuNi44IDUuMSAxLjggNy41IDMuMmwxOTEuMSAxMTAuNGMxLjcgMSA0LjIgMi40IDUuNiAzLjN6bS01MDUuMy0xMDMuMmMwLTIuNy40LTUuNCAxLjEtOC4xLjctMi42IDEuNy01LjIgMy4xLTcuNiAxLjQtMi4zIDMtNC41IDUtNi41IDEuOS0xLjkgNC4xLTMuNiA2LjUtNC45bDE5MS4xLTExMC4zYzEuOC0xLjEgNC4zLTIuNSA1LjctMy4yLTI2LjItMjEuOS01OC4yLTM1LjktOTIuMS00MC4yLTMzLjktNC40LTY4LjMgMS05OS4yIDE1LjUtMzEgMTQuNS01Ny4yIDM3LjYtNzUuNSA2Ni40LTE4LjMgMjguOS0yOCA2Mi4zLTI4IDk2LjV2MjIzcS4xLjQuMi43LjEuMy4zLjYuMi4zLjUuNi4yLjIuNi40bDgwLjcgNDYuNnptNDMuOCAyOTQuNyAxMDMuOSA2MCAxMDMuOS02MHYtMTE5LjlsLTEwMy44LTYwLTEwMy45IDYweiIgLz4KPC9zdmc+Cg==',
            background: '#ffffff',
            scale: 0.7,
            shape: 'circle'
        };
        this.schema = {
            type: 'object',
            properties: {
                apikey: {
                    title: 'OpenAI API Key',
                    type: 'string',
                    maxLength: 255,
                    attrs: {
                        placeholder: 'OpenAI API Key'
                    }
                }
            }
        };
        this.modelSchema = {
            type: 'object',
            properties: {
                instructions: {
                    title: 'Instructions',
                    type: 'string',
                    attrs: {
                        placeholder: 'Instructions',
                        type: 'textarea',
                        rows: 6
                    }
                },
                topP: {
                    title: 'Top P',
                    type: 'number',
                    minimum: 0,
                    maximum: 1,
                    multipleOf: 0.01,
                    default: 1,
                    attrs: {
                        placeholder: 'TOP_P',
                        type: 'slider'
                    }
                },
                temparature: {
                    title: 'Temparature',
                    type: 'number',
                    minimum: 0,
                    maximum: 2,
                    multipleOf: 0.01,
                    default: 1,
                    attrs: {
                        placeholder: 'Temparature',
                        type: 'slider'
                    }
                },
                tokenLimitInput: {
                    title: 'Input Token Limit',
                    type: 'number',
                    minimum: 100,
                    maximum: 64 * 1024,
                    default: 64 * 1024,
                    attrs: {
                        placeholder: 'Input Token Limit',
                        type: 'slider'
                    }
                },
                tokenLimitOutput: {
                    title: 'Output Token Limit',
                    type: 'number',
                    minimum: 100,
                    maximum: 64 * 1024,
                    default: 32 * 1024,
                    attrs: {
                        placeholder: 'Output Token Limit',
                        type: 'slider'
                    }
                }
            }
        };
    }
    listModel() {
        const schema = this.modelSchema;
        return [
            {
                name: 'gpt-4o',
                displayName: 'GPT 4o',
                enable: true,
                schema
            },
            {
                name: 'gpt-4o-mini',
                displayName: 'GPT 4o mini',
                schema
            },
            {
                name: 'o1',
                displayName: 'o1',
                enable: true,
                schema
            },
            {
                name: 'o1-mini',
                displayName: 'o1 mini',
                schema
            },
            {
                name: 'o3-mini',
                displayName: 'o3 mini',
                enable: true,
                schema
            },
            {
                name: 'gpt-4.5-preview',
                displayName: 'GPT 4.5 preview',
                schema
            },
            {
                name: 'gpt-4',
                displayName: 'GPT 4',
                schema
            },
            {
                name: 'gpt-4-turbo',
                displayName: 'GPT 4 turbo',
                schema
            },
            {
                name: 'gpt-3.5-turbo',
                displayName: 'GPT 3.5 turbo',
                schema
            },
            {
                name: 'dall-e-3',
                displayName: 'Dall-e-3',
                enable: true,
                type: api_1.MODEL_TYPE.image
            }
        ];
    }
    run(request) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const stream = new stream_1.PassThrough();
            const config = request.config;
            const model = request.model;
            const user = request.user;
            const prompt = request.prompt;
            const messages = (((_a = request.messages) === null || _a === void 0 ? void 0 : _a.map((message) => ({
                role: message.role,
                content: message.content
            }))) || []).map((message) => {
                if (model !== 'o1-mini')
                    return message;
                return { role: ['system', 'developer'].includes(message.role) ? 'user' : message.role, content: message.content };
            });
            try {
                const apiKey = (config === null || config === void 0 ? void 0 : config.apikey) || ((_b = this.options) === null || _b === void 0 ? void 0 : _b.apikey);
                if (!apiKey)
                    throw new Error('OpenAI API Key is missing or empty, please contact the administrator.');
                const openai = new openai_1.default({
                    apiKey
                });
                const generateImage = (prompt) => __awaiter(this, void 0, void 0, function* () {
                    const response = yield openai.images.generate({
                        model: 'dall-e-3',
                        prompt,
                        n: 1,
                        size: '1024x1024'
                    });
                    console.log(JSON.stringify(response.data, null, 2));
                    return response.data;
                });
                const abortController = new AbortController();
                const completion = yield openai.chat.completions.create({
                    model,
                    messages,
                    user,
                    store: false,
                    stream: true,
                    stream_options: { include_usage: true },
                    // temperature: 1,
                    // max_completion_tokens: 10 * 1024,
                    // top_p: 1,
                    // frequency_penalty: 0,
                    // presence_penalty: 0
                    tools: model === 'o1-mini'
                        ? undefined
                        : [
                            {
                                type: 'function',
                                function: {
                                    name: 'generateImage',
                                    description: 'Generate an image based on a text prompt.',
                                    parameters: {
                                        type: 'object',
                                        properties: {
                                            prompt: {
                                                type: 'string',
                                                description: 'The description of the image to generate.'
                                            }
                                        },
                                        required: ['prompt']
                                    }
                                }
                            }
                        ]
                }, { signal: abortController.signal });
                (() => __awaiter(this, void 0, void 0, function* () {
                    var _a, e_1, _b, _c, _d, e_2, _e, _f, _g, e_3, _h, _j;
                    var _k, _l;
                    let completionid = null;
                    let result = '';
                    const functions = {};
                    const usage = { input: 0, output: 0, total: 0, raw: null };
                    stream.on('abort', () => {
                        abortController.abort();
                    });
                    let currentfunction = '';
                    let currentargs = '';
                    const write = (text) => {
                        if (typeof text === 'object')
                            text = '\n' + JSON.stringify(text) + '\n';
                        result += text;
                        stream.write(text);
                    };
                    try {
                        for (var _m = true, completion_1 = __asyncValues(completion), completion_1_1; completion_1_1 = yield completion_1.next(), _a = completion_1_1.done, !_a; _m = true) {
                            _c = completion_1_1.value;
                            _m = false;
                            const chunk = _c;
                            if (!completionid)
                                completionid = chunk.id;
                            if ((_k = chunk === null || chunk === void 0 ? void 0 : chunk.choices) === null || _k === void 0 ? void 0 : _k.length) {
                                try {
                                    for (var _o = true, _p = (e_2 = void 0, __asyncValues(chunk.choices)), _q; _q = yield _p.next(), _d = _q.done, !_d; _o = true) {
                                        _f = _q.value;
                                        _o = false;
                                        const choice = _f;
                                        const delta = choice.delta;
                                        if (delta === null || delta === void 0 ? void 0 : delta.content) {
                                            write(delta.content);
                                        }
                                        if (choice.finish_reason === 'tool_calls' && currentfunction) {
                                            if (currentfunction === 'generateImage') {
                                                try {
                                                    const args = currentargs && JSON.parse(currentargs);
                                                    const tool = { name: 'generateImage', args };
                                                    write({ type: 'tool', tool });
                                                    const results = yield generateImage(args.prompt);
                                                    results.forEach((result) => {
                                                        write({ type: 'tool', tool, result: { prompt: result.revised_prompt, src: result.url || result.b64_json } });
                                                    });
                                                }
                                                catch (err) {
                                                    write({ type: 'tool', tool: { name: 'generateImage' }, error: err.message });
                                                }
                                            }
                                            currentfunction = '';
                                            currentargs = '';
                                        }
                                        if ((_l = delta.tool_calls) === null || _l === void 0 ? void 0 : _l.length) {
                                            try {
                                                for (var _r = true, _s = (e_3 = void 0, __asyncValues(delta.tool_calls)), _t; _t = yield _s.next(), _g = _t.done, !_g; _r = true) {
                                                    _j = _t.value;
                                                    _r = false;
                                                    const tool_call = _j;
                                                    if (tool_call.type === 'function' && tool_call.function.name) {
                                                        currentfunction = tool_call.function.name;
                                                    }
                                                    if (tool_call.function.arguments) {
                                                        currentargs += tool_call.function.arguments;
                                                    }
                                                }
                                            }
                                            catch (e_3_1) { e_3 = { error: e_3_1 }; }
                                            finally {
                                                try {
                                                    if (!_r && !_g && (_h = _s.return)) yield _h.call(_s);
                                                }
                                                finally { if (e_3) throw e_3.error; }
                                            }
                                        }
                                    }
                                }
                                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                                finally {
                                    try {
                                        if (!_o && !_d && (_e = _p.return)) yield _e.call(_p);
                                    }
                                    finally { if (e_2) throw e_2.error; }
                                }
                            }
                            // 이벤트에 토큰 사용량 정보가 포함되어 있는 경우 캡처
                            if (chunk.usage) {
                                usage.input = chunk.usage.prompt_tokens;
                                usage.output = chunk.usage.completion_tokens;
                                usage.total = chunk.usage.prompt_tokens + chunk.usage.completion_tokens;
                                usage.raw = chunk.usage;
                                stream.emit('usage', usage);
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (!_m && !_a && (_b = completion_1.return)) yield _b.call(completion_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    const summurize = yield openai.chat.completions.create({
                        model: 'gpt-4o-mini',
                        messages: [
                            {
                                role: 'system',
                                content: 'You are a helpful assistant that summarizes text within 30 characters. Answer within 30 characters at most, without breaking sentences in between.'
                            },
                            { role: 'user', content: `Summarize this conversation: ${result}` }
                        ],
                        max_tokens: 200
                    });
                    let summary = (summurize.choices[0].message.content || '').trim();
                    if (summary.endsWith('.'))
                        summary = summary.substring(0, summary.length - 1);
                    stream.emit('complete', {
                        id: completionid,
                        result,
                        annotations: null,
                        usage,
                        raw: {
                            usage: usage.raw
                        },
                        summary
                    });
                    stream.end();
                }))();
            }
            catch (err) {
                stream.emit('error', err);
            }
            return stream;
        });
    }
}
exports.OpenAIProvider = OpenAIProvider;
//# sourceMappingURL=OpenAIProvider.js.map