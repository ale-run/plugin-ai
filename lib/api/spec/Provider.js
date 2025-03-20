"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Provider = exports.PromptRequest = exports.PromptRequestMessage = exports.RunResult = void 0;
class RunResult {
}
exports.RunResult = RunResult;
class PromptRequestMessage {
}
exports.PromptRequestMessage = PromptRequestMessage;
class PromptRequest {
}
exports.PromptRequest = PromptRequest;
class Provider {
    constructor(options) {
        if (!options)
            throw new Error(`options is required`);
        if (typeof options !== 'object')
            throw new Error(`options must be an object`);
        this.options = options;
    }
}
exports.Provider = Provider;
//# sourceMappingURL=Provider.js.map