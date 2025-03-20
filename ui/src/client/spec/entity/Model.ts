import { AnyObject } from '../common';
import { Icon } from './Icon';

export enum MODEL_TYPE {
  text = 'text',
  image = 'image',
  video = 'video',
  audio = 'audio',
  stt = 'stt',
  tts = 'tts'
}

export class Model {
  name: string;
  provider?: string;
  displayName?: string;
  description?: string;
  config?: AnyObject;
  icon?: Icon;
  type?: MODEL_TYPE;
}
