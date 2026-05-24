export type MessageRole = 'user' | 'assistant';

export interface MessageEntity {
    id: string;
    conversationId: string;
    role: MessageRole;
    content: string;
    timestamp: string;
    signatureEmoji?: string;
    sentimentScore?: number;
}

export interface UpsertMessageInput {
    id?: string;
    conversationId: string;
    role: MessageRole;
    content: string;
    signatureEmoji?: string;
    sentimentScore?: number;
}
