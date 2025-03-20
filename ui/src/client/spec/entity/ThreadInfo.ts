import { Ask } from './Ask';

export class ThreadInfo {
  assistantId: string;

  id: string;
  owner: string;
  participants?: string[];
  latest?: Ask;
  summary?: string;

  createdAt: Date;
  updatedAt?: Date;
  archivedAt?: Date;
}
