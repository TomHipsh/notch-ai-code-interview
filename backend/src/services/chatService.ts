import {ChatCompletionMessageParam} from 'openai/resources/chat/completions';
import {strip} from 'node-emoji';
import {z} from 'zod';
import {config} from '../config';
import {dataManager} from '../data_store/memoryDataManager';
import {MessageEntity} from '../entities/message';
import {buildChatPromptMessages, UserChatMessage} from '../prompts/chat';
import {openaiClient} from './openaiClient';
import {selectUnusedSignatureEmoji} from './signatureEmojiPool';
import {rateLatestUserSentiment} from './sentimentService';
import {OpenAIResponseValidationError} from './openAIResponseValidationError';

const assistantCompletionSchema = z.object({
    choices: z.array(
        z.object({
            finish_reason: z.literal('stop'),
            message: z.object({
                role: z.literal('assistant'),
                content: z.string().trim().min(1),
            }).passthrough(),
        }).passthrough(),
    ).min(1),
}).passthrough();

export const createConversation = async (title?: string) => {
    return dataManager.createConversation({title});
};

export const updateConversationTitle = async (conversationId: string, title: string) => {
    return dataManager.updateConversation(conversationId, {title});
};

export const getConversationWithMessages = (conversationId: string) => {
    const conversation = dataManager.getConversation(conversationId);

    if (!conversation) {
        return undefined;
    }

    return {
        conversation,
        messages: dataManager.getConversationMessages(conversationId),
    };
};

export const createUserMessageAndAssistantReply = async (
    conversationId: string,
    content: string,
): Promise<{
    userMessage: MessageEntity;
    assistantMessage: MessageEntity;
}> => {
    const userMessage = await dataManager.upsertMessage({
        conversationId,
        role: 'user',
        content,
    });

    const conversationMessages = dataManager.getConversationMessages(conversationId);
    const signatureEmoji = selectUnusedSignatureEmoji(conversationMessages);
    const [assistantContent, sentimentScore] = await Promise.all([
        getAssistantResponse(conversationMessages, signatureEmoji),
        rateLatestUserSentiment(conversationMessages),
    ]);
    const signedAssistantContent = ensureSignedContent(assistantContent, signatureEmoji);
    const scoredUserMessage = await dataManager.upsertMessage({
        id: userMessage.id,
        conversationId,
        role: 'user',
        content: userMessage.content,
        sentimentScore,
    });

    const assistantMessage = await dataManager.upsertMessage({
        conversationId,
        role: 'assistant',
        content: signedAssistantContent,
        signatureEmoji,
    });

    return {
        userMessage: scoredUserMessage,
        assistantMessage,
    };
};

const getAssistantResponse = async (
    messages: MessageEntity[],
    signatureEmoji: string,
): Promise<string> => {
    const promptMessages = buildChatPromptMessages(
        messages.map(toPromptMessage),
        signatureEmoji,
    ) as ChatCompletionMessageParam[];

    const completion = await openaiClient.chat.completions.create({
        model: config.OPENAI_MODEL,
        messages: promptMessages,
        temperature: 0.7,
    });

    const parsedCompletion = assistantCompletionSchema.safeParse(completion);

    if (!parsedCompletion.success) {
        throw new OpenAIResponseValidationError('Assistant response was not in the expected format');
    }

    const firstChoice = parsedCompletion.data.choices[0];

    if (!firstChoice) {
        throw new OpenAIResponseValidationError('Assistant response did not include a completion choice');
    }

    return firstChoice.message.content.trim();
};

const toPromptMessage = (message: MessageEntity): UserChatMessage => ({
    role: message.role,
    content: message.content,
});

const ensureSignedContent = (content: string, signatureEmoji: string): string => {
    const strippedContent = strip(content, {preserveSpaces: false})
        .replace(/[ \t]{2,}/g, ' ')
        .trim();
    const normalizedContent = strippedContent || 'I am here to help.';

    return `${normalizedContent} ${signatureEmoji}`;
};
