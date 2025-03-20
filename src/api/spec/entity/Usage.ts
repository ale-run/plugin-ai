export class TokenUsage {
  input: number;
  output: number;
  total: number;
}

export class ChannelUsage {
  public channel: string;
  public tokens: TokenUsage;
  public percentage: number;
}

export class ModelUsage {
  public model: string;
  public tokens: TokenUsage;
  public percentage: number;
}

export class UserUsage {
  public uid: string;
  public tokens: TokenUsage;
  public percentage: number;
}

export class Usage {
  public date: string;
  public users: UserUsage[];
  public channels: ChannelUsage[];
  public models: ModelUsage[];
  public total: TokenUsage;
}
