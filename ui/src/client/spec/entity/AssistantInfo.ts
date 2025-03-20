import { AssistantConfig } from './AssistantConfig';
import { AnyObject } from '../common';

export class AssistantInfo {
  public id: string;
  public owner: string;
  public name?: string;
  public displayName?: string;

  public config?: AssistantConfig;
  public info?: AnyObject;

  public createdAt?: Date;
  public updatedAt?: Date;
}
