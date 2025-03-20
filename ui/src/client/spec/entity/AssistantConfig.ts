export class AssistantConfig {
  model?: string;
  instructions?: string;
  temperature?: number;
  maxPromptTokens?: number;
  maxCompletionTokens?: number;
  topP?: number;
  responseFormat?: string;
  options?: object;
  metadata?: object;
}
