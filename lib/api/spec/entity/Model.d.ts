import { AnyObject } from '../common';
import { Icon } from './Icon';
export declare enum MODEL_TYPE {
    text = "text",
    image = "image",
    video = "video",
    audio = "audio",
    stt = "stt",
    tts = "tts",
    ocr = "ocr"
}
export declare class Model {
    assistantId?: string;
    provider?: string;
    name: string;
    displayName?: string;
    config?: AnyObject;
    schema?: AnyObject;
    enable?: boolean;
    icon?: Icon;
    type?: MODEL_TYPE;
    custom?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
