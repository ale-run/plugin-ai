export declare class TokenUsage {
    input: number;
    output: number;
    total: number;
}
export declare class ChannelUsage {
    channel: string;
    tokens: TokenUsage;
    percentage: number;
}
export declare class ModelUsage {
    model: string;
    tokens: TokenUsage;
    percentage: number;
}
export declare class UserUsage {
    uid: string;
    tokens: TokenUsage;
    percentage: number;
}
export declare class Usage {
    date: string;
    users: UserUsage[];
    channels: ChannelUsage[];
    models: ModelUsage[];
    total: TokenUsage;
}
