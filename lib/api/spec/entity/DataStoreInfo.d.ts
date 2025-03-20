import { FileAttach } from './FileAttach';
import { WebPage } from './WebPage';
import { DatabaseQuery } from './DatabaseQuery';
import { UserPermission } from './UserPermission';
export declare class DataStoreInfo {
    assistantId: string;
    owner: string;
    permissions?: UserPermission[];
    id: string;
    name: string;
    displayName?: string;
    files?: FileAttach[];
    webpages?: WebPage[];
    queries?: DatabaseQuery[];
    enable?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
