export class Ask {
  streaming?: boolean;
  model?: string;
  options?: object;
  prompt: string;
  temporary?: boolean;
  files?: Array<{ type?: string; filename?: string; src: string }>;
  store?: string;
  responseFormat?: string;
  user?: string;
  channel?: string;
  info?: object;
  addons?: string[];
}

/*
instructions?: string;
temperature?: number;
maxPromptTokens?: number;
maxCompletionTokens?: number;
topP?: number;
*/

export class AskSync extends Ask {
  declare streaming: false;
}

export class AskStreaming extends Ask {
  declare streaming: true;
}
