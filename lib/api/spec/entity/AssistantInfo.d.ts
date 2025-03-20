import { AssistantConfig } from './AssistantConfig';
import { AnyObject } from '../common';
export declare class AssistantInfo {
    id: string;
    owner: string;
    name?: string;
    displayName?: string;
    config?: AssistantConfig;
    info?: AnyObject;
    createdAt?: Date;
    updatedAt?: Date;
}
