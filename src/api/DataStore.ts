import { IAssistant, IDataStore, DataStoreInfo, WebPage, FileAttach, UserPermission, DatabaseQuery, Ask, uniqid } from './spec';
import { Assistant } from './Assistant';
import { AIContext } from './AIContext';
import { MongoAIPersistance } from './db';

export class DataStore implements IDataStore {
  private assistant: Assistant;
  private doc: DataStoreInfo;
  private context: AIContext;

  constructor(assistant: Assistant, doc: DataStoreInfo, context: AIContext) {
    this.assistant = assistant;
    this.doc = doc;
    this.context = context;
  }

  public get assistantId(): string {
    return this.doc.assistantId;
  }

  public get id(): string {
    return this.doc.id;
  }

  public get name(): string {
    return this.doc.name;
  }

  public get displayName(): string {
    return this.doc.displayName;
  }

  public get owner(): string {
    return this.doc.owner;
  }

  public get permissions(): any[] {
    return this.doc.permissions;
  }

  public get files(): FileAttach[] {
    return this.doc.files;
  }

  public get webpages(): WebPage[] {
    return this.doc.webpages;
  }

  public get queries(): DatabaseQuery[] {
    return this.doc.queries;
  }

  public get enable(): boolean {
    return this.doc.enable;
  }

  public get createdAt(): Date {
    return this.doc.createdAt;
  }

  public get updatedAt(): Date {
    return this.doc.updatedAt;
  }

  private get persist(): MongoAIPersistance {
    return this.context.persist;
  }

  public getAssistant(): IAssistant {
    return this.assistant;
  }

  public async changeName(name: string): Promise<void> {
    return null;
  }

  public async changeOwner(owner: string): Promise<void> {
    return null;
  }

  public async addPermission(permission: UserPermission): Promise<void> {
    return null;
  }

  public async removePermission(uid: string): Promise<void> {
    return null;
  }

  public async addFile(file: FileAttach): Promise<void> {
    return null;
  }

  public async removeFile(id: string): Promise<void> {
    return null;
  }

  public async listFile(): Promise<FileAttach[]> {
    return null;
  }

  public async addWebPage(url: string): Promise<void> {
    return null;
  }

  public async removeWebPage(id: string): Promise<void> {
    return null;
  }

  public async listWebPage(): Promise<WebPage[]> {
    return null;
  }

  public async listDatabaseQuery(): Promise<DatabaseQuery[]> {
    return null;
  }

  public async addDatabaseQuery(query: { database: string; query: string; instructions?: string }): Promise<DatabaseQuery> {
    return null;
  }

  public async removeDatabaseQuery(id: string): Promise<void> {
    return null;
  }

  public async reindex(): Promise<void> {
    return null;
  }

  // misc
  public toJSON() {
    const doc = this.doc;
    if (!doc) return null;
    return {
      assistantId: doc.assistantId,
      id: doc.id,
      name: doc.name,
      owner: doc.owner,
      permissions: doc.permissions,
      files: doc.files,
      webpages: doc.webpages,
      queries: doc.queries,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  public toString() {
    return JSON.stringify(this.toJSON());
  }
}
