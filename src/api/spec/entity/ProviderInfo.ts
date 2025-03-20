import { Icon } from './Icon';
import { AnyObject } from '../common';

export class ProviderInfo {
  name: string;
  displayName?: string;
  icon?: Icon;
  schema?: AnyObject;
  modelSchema?: AnyObject;
}
