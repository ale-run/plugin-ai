import { connector, Session, AuthRequest, Auth } from '@ale-run/connector';
import { IAssistant, ProviderInfo, AssistantConfig } from './spec';
import { Assistant } from './Assistant';

export class AIClient {
  public session: Session;
  public lastaccess: Date;

  public async createAssistant(values: { name?: string; owner: string; displayName?: string; config?: AssistantConfig }): Promise<IAssistant> {
    const doc = await connector.post(`/ai`, values);
    return doc ? new Assistant(doc) : null;
  }

  public async getAssistant(id: string): Promise<IAssistant> {
    const doc = await connector.get(`/ai/${id}`);
    return doc ? new Assistant(doc) : null;
  }

  public async getAssistantByName(name: string): Promise<IAssistant> {
    const doc = await connector.get(`/ai/byname/${name}`);
    return doc ? new Assistant(doc) : null;
  }

  public async listProvider(): Promise<ProviderInfo[]> {
    return await connector.get(`/ai/provider`);
  }

  /*
  public async getSession(force?: boolean): Promise<Session> {
    if (force !== true && this.session && this.lastaccess) {
      const diff = Math.abs(this.lastaccess.getTime() - new Date().getTime());
      if (diff < 2000) {
        this.lastaccess = new Date();
        return this.session;
      }
    }

    const session = await connector.get('/auth');
    this.session = session;
    this.lastaccess = new Date();
    return session;
  }

  public async authenticate(authrequest: AuthRequest): Promise<Auth> {
    const auth = await await connector.post('/auth', authrequest);
    connector.setAccessToken(auth.token);
    return auth;
  }

  public async invalidate(): Promise<void> {
    const token = connector.getAccessToken();
    token && (await connector.delete('/auth'));
    this.session = null;
    connector.setAccessToken(null);
  }
    */
}
