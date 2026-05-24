import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {ConversationEntity, CreateConversationInput, UpdateConversationInput} from '../entities/conversation';
import {MessageEntity, UpsertMessageInput} from '../entities/message';
import {JsonCollectionFileStore, JsonFileStore} from './jsonFileStore';

const backendRootPath = path.resolve(__dirname, '..', '..');
const dataStorePath = path.join(backendRootPath, 'data_store');

class MemoryDataManager {
    private readonly conversationStore = new JsonFileStore<ConversationEntity>(
        path.join(dataStorePath, 'conversations'),
    );
    private readonly messageStore = new JsonCollectionFileStore<MessageEntity>(
        path.join(dataStorePath, 'messages'),
    );

    private readonly conversationsById = new Map<string, ConversationEntity>();
    private readonly messagesByConversationId = new Map<string, MessageEntity[]>();

    async load(): Promise<void> {
        await this.conversationStore.ensureDirectory();
        await this.messageStore.ensureDirectory();

        const conversations = await this.conversationStore.loadAll();

        this.conversationsById.clear();
        this.messagesByConversationId.clear();

        for (const conversation of conversations) {
            this.conversationsById.set(conversation.id, conversation);
            this.messagesByConversationId.set(
                conversation.id,
                this.sortMessages(await this.messageStore.load(conversation.id)),
            );
        }
    }

    getConversations(): ConversationEntity[] {
        return [...this.conversationsById.values()].sort((left, right) =>
            right.updatedAt.localeCompare(left.updatedAt),
        );
    }

    getConversation(conversationId: string): ConversationEntity | undefined {
        return this.conversationsById.get(conversationId);
    }

    getConversationMessages(conversationId: string): MessageEntity[] {
        return this.sortMessages(this.messagesByConversationId.get(conversationId) ?? []);
    }

    async createConversation(input: CreateConversationInput = {}): Promise<ConversationEntity> {
        const timestamp = new Date().toISOString();
        const conversation: ConversationEntity = {
            id: randomUUID(),
            title: input.title?.trim() || 'New conversation',
            createdAt: timestamp,
            updatedAt: timestamp,
            messageIds: [],
        };

        this.conversationsById.set(conversation.id, conversation);
        this.messagesByConversationId.set(conversation.id, []);

        await this.conversationStore.save(conversation);
        await this.messageStore.save(conversation.id, []);

        return conversation;
    }

    async updateConversation(
        conversationId: string,
        input: UpdateConversationInput,
    ): Promise<ConversationEntity> {
        const conversation = this.getRequiredConversation(conversationId);
        const updatedConversation: ConversationEntity = {
            ...conversation,
            title: input.title.trim(),
            updatedAt: new Date().toISOString(),
        };

        this.conversationsById.set(updatedConversation.id, updatedConversation);
        await this.conversationStore.save(updatedConversation);

        return updatedConversation;
    }

    async upsertMessage(input: UpsertMessageInput): Promise<MessageEntity> {
        const conversation = this.getRequiredConversation(input.conversationId);
        const now = new Date().toISOString();
        const messages = this.messagesByConversationId.get(conversation.id) ?? [];
        const existingMessageIndex = input.id
            ? messages.findIndex((message) => message.id === input.id)
            : -1;
        const existingMessage = existingMessageIndex >= 0 ? messages[existingMessageIndex] : undefined;
        const signatureEmoji = input.signatureEmoji ?? existingMessage?.signatureEmoji;
        const sentimentScore = input.sentimentScore ?? existingMessage?.sentimentScore;

        const message: MessageEntity = {
            id: input.id ?? randomUUID(),
            conversationId: conversation.id,
            role: input.role,
            content: input.content,
            timestamp: existingMessage?.timestamp ?? now,
            ...(signatureEmoji !== undefined ? {signatureEmoji} : {}),
            ...(sentimentScore !== undefined ? {sentimentScore} : {}),
        };

        if (existingMessageIndex >= 0) {
            messages[existingMessageIndex] = message;
        } else {
            messages.push(message);
            conversation.messageIds.push(message.id);
        }

        if (!existingMessage) {
            conversation.updatedAt = now;
        }

        const sortedMessages = this.sortMessages(messages);
        this.messagesByConversationId.set(conversation.id, sortedMessages);
        this.conversationsById.set(conversation.id, conversation);

        await this.messageStore.save(conversation.id, sortedMessages);
        await this.conversationStore.save(conversation);

        return message;
    }

    private getRequiredConversation(conversationId: string): ConversationEntity {
        const conversation = this.getConversation(conversationId);

        if (!conversation) {
            throw new Error(`Conversation ${conversationId} was not found`);
        }

        return conversation;
    }

    private sortMessages(messages: MessageEntity[]): MessageEntity[] {
        return [...messages].sort((left, right) => left.timestamp.localeCompare(right.timestamp));
    }
}

export const dataManager = new MemoryDataManager();
