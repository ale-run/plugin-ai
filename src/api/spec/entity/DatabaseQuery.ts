export class DatabaseQuery {
  public id: string;

  public database: string;
  public query: string;
  public instructions?: string;

  public createdAt: Date;
}
