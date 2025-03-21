import { Readable } from 'stream';
export declare const downloadAsStream: (url: string) => Promise<Readable>;
export declare const downloadAsFile: (url: string, file: string) => Promise<string>;
export declare const downloadAsDataURL: (url: string) => Promise<string>;
