import { AppController, Logger, DeploymentStat, SERVICE_STATUS } from '@ale-run/runtime';
import { AIContext } from '../../api';

const logger = Logger.getLogger('app:ai-assistant');

export default class AIAssistantAppController extends AppController {
  public async deploy(): Promise<void> {
    logger.debug(`deploy ${this.deployment.getAccessName()}`);

    const stream = await this.getStream();

    stream.write(`- dummy deploy started\n`);

    const ai = this.plugin.get('api') as AIContext;
    if (!ai) throw new Error(`ai-assistant api is not ready`);

    const assistant = await ai.createAssistant({
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

    if (!assistant) throw new Error(`[${this.deployment.getAccessName()}] assistant creation fail: response was null`);

    logger.debug(`assistant account is created: ${assistant.id}`);
  }

  public async undeploy(): Promise<void> {
    const ai = this.plugin.get('context') as AIContext;
    if (!ai) throw new Error(`ai api is not ready`);

    await ai.removeAssistant(this.deployment.id);
  }

  public async getStat(): Promise<DeploymentStat> {
    return {
      status: SERVICE_STATUS.running
    };
  }
}
