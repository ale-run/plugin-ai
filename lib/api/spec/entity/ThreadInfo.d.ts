import { Ask } from './Ask';
export declare class ThreadInfo {
    assistantId: string;
    id: string;
    owner: string;
    participants?: string[];
    latest?: Ask;
    model?: string;
    summary?: string;
    createdAt: Date;
    updatedAt?: Date;
    archivedAt?: Date;
}
