import { Plugin } from '@ale-run/runtime';
export default class AIPlugin extends Plugin {
    activate(): Promise<void>;
    deactivate(): Promise<void>;
}
export * from './api/spec';
