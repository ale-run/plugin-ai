import { Attach } from './Attach';

export class DataStore {
  public assistantId: string;

  public id: string;
  public name: string;
  public attaches?: Attach[];
  public urls?: string[];
  public databases?: Array<{ database: string; query: string; instructions: string }>;

  public createdAt?: Date;
  public updatedAt?: Date;
}
