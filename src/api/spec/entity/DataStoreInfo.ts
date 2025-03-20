import { FileAttach } from './FileAttach';
import { WebPage } from './WebPage';
import { DatabaseQuery } from './DatabaseQuery';
import { UserPermission } from './UserPermission';

export class DataStoreInfo {
  public assistantId: string;

  public owner: string;
  public permissions?: UserPermission[];
  public id: string;
  public name: string;
  public displayName?: string;

  public files?: FileAttach[];
  public webpages?: WebPage[];
  public queries?: DatabaseQuery[];

  public enable?: boolean;
  public createdAt?: Date;
  public updatedAt?: Date;
}
