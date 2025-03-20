import { AIContext } from '../api';
import express from 'express';
import http from 'http';
export declare class AIServer {
    host: string;
    port: number;
    portssl: number;
    httpd: http.Server;
    app: express.Application;
    routes: express.Application;
    private token;
    private options;
    constructor(options: {
        context: AIContext;
        host?: string;
        port?: number;
        portssl?: number;
        token: string;
    });
    getToken(): Promise<string>;
    start(): Promise<void>;
    stop(): Promise<void>;
    getCurrentNamespace(): Promise<string>;
}
