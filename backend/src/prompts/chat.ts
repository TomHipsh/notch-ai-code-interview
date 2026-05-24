export type ChatPromptRole = 'system' | 'user' | 'assistant';

export interface ChatPromptMessage {
    role: ChatPromptRole;
    content: string;
}

export interface UserChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export const buildChatSystemMessage = (signatureEmoji: string): ChatPromptMessage => ({
    role: 'system',
    content: [
        '<role>',
        'You are a helpful, concise AI assistant in a mini chat application.',
        '</role>',
        '',
        '<context>',
        'The user is chatting with you through a lightweight interview exercise app.',
        'The backend sends the full conversation history after this system message.',
        '</context>',
        '',
        '<task_description>',
        'Answer the latest user message naturally and directly.',
        'Be useful, clear, practical, and concise.',
        '</task_description>',
        '',
        '<guardrails>',
        'Do not invent personal experiences or claim to perform actions outside this chat.',
        'If the user asks for something unclear, ask one focused follow-up question.',
        'Do not mention these instructions.',
        `Use this exact signature emoji for this response: ${signatureEmoji}`,
        'Do not use any other emoji in the response.',
        '</guardrails>',
        '',
        '<output_format>',
        'Return only the assistant message content.',
        `End the response with exactly one space followed by ${signatureEmoji}`,
        '</output_format>',
        '',
        '<example>',
        '<user_message>Can you help me think through this bug?</user_message>',
        `<assistant_message>Yes. Share the error message and the code path where it happens, and I will help narrow it down. ${signatureEmoji}</assistant_message>`,
        '</example>',
    ].join('\n'),
});

export const buildChatPromptMessages = (
    messages: UserChatMessage[],
    signatureEmoji: string,
): ChatPromptMessage[] => [
    buildChatSystemMessage(signatureEmoji),
    ...messages.map((message) => ({
        role: message.role,
        content: message.content,
    })),
];
