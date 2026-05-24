export type MessageRole = 'user' | 'assistant';

export interface Conversation {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    messageIds: string[];
}

export interface ChatMessage {
    id: string;
    conversationId: string;
    role: MessageRole;
    content: string;
    timestamp: string;
    signatureEmoji?: string;
    sentimentScore?: number;
}

interface ConversationsResponse {
    conversations: Conversation[];
}

interface ConversationResponse {
    conversation: Conversation;
    messages: ChatMessage[];
}

interface CreateMessageResponse {
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
}

interface UpdateConversationResponse {
    conversation: Conversation;
}

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(url, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
        },
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => undefined);
        const message = errorBody?.message ?? `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    return response.json() as Promise<T>;
};

export const listConversations = async (): Promise<Conversation[]> => {
    const response = await requestJson<ConversationsResponse>('/api/conversations');
    return response.conversations;
};

export const createConversation = async (): Promise<ConversationResponse> => {
    return requestJson<ConversationResponse>('/api/conversations', {
        method: 'POST',
        body: JSON.stringify({}),
    });
};

export const getConversation = async (conversationId: string): Promise<ConversationResponse> => {
    return requestJson<ConversationResponse>(`/api/conversations/${conversationId}`);
};

export const updateConversationTitle = async (
    conversationId: string,
    title: string,
): Promise<Conversation> => {
    const response = await requestJson<UpdateConversationResponse>(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        body: JSON.stringify({title}),
    });

    return response.conversation;
};

export const createConversationMessage = async (
    conversationId: string,
    content: string,
): Promise<CreateMessageResponse> => {
    return requestJson<CreateMessageResponse>(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({content}),
    });
};
