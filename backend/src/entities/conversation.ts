export interface ConversationEntity {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    messageIds: string[];
}

export interface CreateConversationInput {
    title?: string;
}

export interface UpdateConversationInput {
    title: string;
}
