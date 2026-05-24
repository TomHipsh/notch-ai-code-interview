import {ChatCompletionMessageParam} from 'openai/resources/chat/completions';
import {config} from '../config';
import {dataManager} from '../data_store/memoryDataManager';
import {MessageEntity} from '../entities/message';
import {buildChatPromptMessages, UserChatMessage} from '../prompts/chat';
import {openaiClient} from './openaiClient';
import {selectUnusedSignatureEmoji} from './signatureEmojiPool';
import {rateLatestUserSentiment} from './sentimentService';

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
    const sentimentScorePromise = rateLatestUserSentiment(conversationMessages).catch(() => undefined);
    const [assistantContent, sentimentScore] = await Promise.all([
        getAssistantResponse(conversationMessages, signatureEmoji),
        sentimentScorePromise,
    ]);
    const signedAssistantContent = ensureSignedContent(assistantContent, signatureEmoji);
    const scoredUserMessage = typeof sentimentScore === 'number'
        ? await dataManager.upsertMessage({
            id: userMessage.id,
            conversationId,
            role: 'user',
            content: userMessage.content,
            sentimentScore,
        })
        : userMessage;

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

    return completion.choices[0]?.message.content?.trim() || `I am here to help. ${signatureEmoji}`;
};

const toPromptMessage = (message: MessageEntity): UserChatMessage => ({
    role: message.role,
    content: message.content,
});

const ensureSignedContent = (content: string, signatureEmoji: string): string => {
    const trimmedContent = content.trim();

    if (trimmedContent.endsWith(signatureEmoji)) {
        return trimmedContent;
    }

    return `${trimmedContent} ${signatureEmoji}`;
};
