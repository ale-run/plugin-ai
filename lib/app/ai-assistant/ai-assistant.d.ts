import { AppController, DeploymentStat } from '@ale-run/runtime';
export default class AIAssistantAppController extends AppController {
    deploy(): Promise<void>;
    undeploy(): Promise<void>;
    getStat(): Promise<DeploymentStat>;
}
