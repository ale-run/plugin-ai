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
Object.defineProperty(exports, "__esModule", { value: true });
const runtime_1 = require("@ale-run/runtime");
const logger = runtime_1.Logger.getLogger('app:ai-assistant');
class AIAssistantAppController extends runtime_1.AppController {
    deploy() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`deploy ${this.deployment.getAccessName()}`);
            const stream = yield this.getStream();
            stream.write(`- dummy deploy started\n`);
            const ai = this.plugin.get('api');
            if (!ai)
                throw new Error(`ai-assistant api is not ready`);
            const assistant = yield ai.createAssistant({
                owner: this.deployment.owner,
                name: this.deployment.id,
                info: {
                    deployment: this.deployment.getAccessName(),
                    scopeid: this.scope.id,
                    projectid: this.project.id,
                    stageid: this.stage.id,
                    deploymentid: this.deployment.id
                }
            });
            if (!assistant)
                throw new Error(`[${this.deployment.getAccessName()}] assistant creation fail: response was null`);
            logger.debug(`assistant account is created: ${assistant.id}`);
        });
    }
    undeploy() {
        return __awaiter(this, void 0, void 0, function* () {
            const ai = this.plugin.get('context');
            if (!ai)
                throw new Error(`ai api is not ready`);
            yield ai.removeAssistant(this.deployment.id);
        });
    }
    getStat() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                status: runtime_1.SERVICE_STATUS.running
            };
        });
    }
}
exports.default = AIAssistantAppController;
//# sourceMappingURL=ai-assistant.js.map