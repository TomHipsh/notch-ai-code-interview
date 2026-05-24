import {FormEvent, useEffect, useMemo, useState} from "react";
import {
    AppShell,
    ChatHeader,
    ChatHeaderText,
    ChatMessagesWrapper,
    ChatPanel,
    ChatSubtitle,
    ChatTitle,
    ConversationButton,
    ConversationList,
    ConversationMeta,
    ConversationTitle,
    CreateConversationButton,
    EmptyState,
    ErrorText,
    Form,
    GlobalStyle,
    HeaderActions,
    HeaderButton,
    IconButton,
    MessageInput,
    SendButton,
    Sidebar,
    SidebarTitle,
    TitleInput,
} from "./App.styles";
import {ChatMessage} from "./ChatMessage";
import {
    ChatMessage as ChatMessageModel,
    Conversation,
    createConversation,
    createConversationMessage,
    getConversation,
    listConversations,
    updateConversationTitle,
} from "./api";

function App() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string>();
    const [chatMessages, setChatMessages] = useState<ChatMessageModel[]>([]);
    const [draftMessage, setDraftMessage] = useState('');
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isCreatingConversation, setIsCreatingConversation] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isSavingTitle, setIsSavingTitle] = useState(false);
    const [draftTitle, setDraftTitle] = useState('');
    const [errorMessage, setErrorMessage] = useState<string>();

    const selectedConversation = conversations.find(
        (conversation) => conversation.id === selectedConversationId,
    );
    const selectedConversationTitle = selectedConversation?.title;

    const orderedMessages = useMemo(() => {
        return [...chatMessages].sort((left, right) => left.timestamp.localeCompare(right.timestamp));
    }, [chatMessages]);

    useEffect(() => {
        let isMounted = true;

        const loadConversations = async () => {
            try {
                const loadedConversations = await listConversations();

                if (!isMounted) {
                    return;
                }

                setConversations(loadedConversations);

                if (loadedConversations[0]) {
                    setSelectedConversationId(loadedConversations[0].id);
                }
            } catch (error) {
                setErrorMessage(error instanceof Error ? error.message : 'Failed to load conversations');
            } finally {
                if (isMounted) {
                    setIsLoadingConversations(false);
                }
            }
        };

        void loadConversations();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!selectedConversationId) {
            setChatMessages([]);
            setIsEditingTitle(false);
            setDraftTitle('');
            return;
        }

        let isMounted = true;

        const loadConversation = async () => {
            try {
                const response = await getConversation(selectedConversationId);

                if (!isMounted) {
                    return;
                }

                setChatMessages(response.messages);
                setErrorMessage(undefined);
            } catch (error) {
                setErrorMessage(error instanceof Error ? error.message : 'Failed to load conversation');
            }
        };

        void loadConversation();

        return () => {
            isMounted = false;
        };
    }, [selectedConversationId]);

    useEffect(() => {
        if (!selectedConversationId || !selectedConversationTitle) {
            return;
        }

        setDraftTitle(selectedConversationTitle);
        setIsEditingTitle(false);
    }, [selectedConversationId, selectedConversationTitle]);

    const handleCreateConversation = async () => {
        setIsCreatingConversation(true);
        setErrorMessage(undefined);

        try {
            const response = await createConversation();
            setConversations((currentConversations) => [
                response.conversation,
                ...currentConversations,
            ]);
            setSelectedConversationId(response.conversation.id);
            setChatMessages(response.messages);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to create conversation');
        } finally {
            setIsCreatingConversation(false);
        }
    };

    const formOnSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const content = draftMessage.trim();

        if (!selectedConversationId || !content || isSendingMessage) {
            return;
        }

        setIsSendingMessage(true);
        setErrorMessage(undefined);

        try {
            const response = await createConversationMessage(selectedConversationId, content);

            setChatMessages((currentMessages) => [
                ...currentMessages,
                response.userMessage,
                response.assistantMessage,
            ]);
            setDraftMessage('');
            setConversations((currentConversations) =>
                currentConversations
                    .map((conversation) =>
                        conversation.id === selectedConversationId
                            ? {
                                ...conversation,
                                updatedAt: response.assistantMessage.timestamp,
                                messageIds: [
                                    ...conversation.messageIds,
                                    response.userMessage.id,
                                    response.assistantMessage.id,
                                ],
                            }
                            : conversation,
                    )
                    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
            );
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to send message');
        } finally {
            setIsSendingMessage(false);
        }
    };

    const handleSaveTitle = async () => {
        const title = draftTitle.trim();

        if (!selectedConversation || !title || isSavingTitle) {
            return;
        }

        setIsSavingTitle(true);
        setErrorMessage(undefined);

        try {
            const updatedConversation = await updateConversationTitle(selectedConversation.id, title);
            setConversations((currentConversations) =>
                currentConversations
                    .map((conversation) =>
                        conversation.id === updatedConversation.id ? updatedConversation : conversation,
                    )
                    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
            );
            setIsEditingTitle(false);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to save conversation name');
        } finally {
            setIsSavingTitle(false);
        }
    };

    return (
        <>
            <GlobalStyle/>
            <AppShell>
                <Sidebar>
                    <SidebarTitle>Ongoing conversations</SidebarTitle>
                    <ConversationList aria-label="Ongoing conversations">
                        {isLoadingConversations && <ConversationMeta>Loading...</ConversationMeta>}
                        {!isLoadingConversations && conversations.length === 0 && (
                            <ConversationMeta>No conversations yet</ConversationMeta>
                        )}
                        {conversations.map((conversation) => (
                            <ConversationButton
                                key={conversation.id}
                                $isSelected={conversation.id === selectedConversationId}
                                type="button"
                                onClick={() => setSelectedConversationId(conversation.id)}
                            >
                                <ConversationTitle>{conversation.title}</ConversationTitle>
                                <ConversationMeta>
                                    {conversation.messageIds.length} messages
                                </ConversationMeta>
                            </ConversationButton>
                        ))}
                    </ConversationList>
                    <CreateConversationButton
                        type="button"
                        disabled={isCreatingConversation}
                        onClick={handleCreateConversation}
                    >
                        + New conversation
                    </CreateConversationButton>
                </Sidebar>

                <ChatPanel>
                    <ChatHeader>
                        <ChatHeaderText>
                            {isEditingTitle && selectedConversation ? (
                                <TitleInput
                                    value={draftTitle}
                                    disabled={isSavingTitle}
                                    autoFocus
                                    onChange={(event) => setDraftTitle(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                            void handleSaveTitle();
                                        }

                                        if (event.key === 'Escape') {
                                            setDraftTitle(selectedConversation.title);
                                            setIsEditingTitle(false);
                                        }
                                    }}
                                />
                            ) : (
                                <ChatTitle>{selectedConversation?.title ?? 'Select a conversation'}</ChatTitle>
                            )}
                            <ChatSubtitle>
                                {selectedConversation
                                    ? `${selectedConversation.messageIds.length} saved messages`
                                    : 'Create or choose a conversation'}
                            </ChatSubtitle>
                        </ChatHeaderText>
                        {selectedConversation && (
                            <HeaderActions>
                                {isEditingTitle ? (
                                    <HeaderButton
                                        type="button"
                                        disabled={!draftTitle.trim() || isSavingTitle}
                                        onClick={handleSaveTitle}
                                    >
                                        {isSavingTitle ? 'Saving' : 'Save'}
                                    </HeaderButton>
                                ) : (
                                    <IconButton
                                        type="button"
                                        aria-label="Edit conversation name"
                                        title="Edit conversation name"
                                        onClick={() => setIsEditingTitle(true)}
                                    >
                                        &#9998;
                                    </IconButton>
                                )}
                            </HeaderActions>
                        )}
                    </ChatHeader>

                    <ChatMessagesWrapper>
                        {orderedMessages.length === 0 ? (
                            <EmptyState>
                                {selectedConversation
                                    ? 'Start the conversation with a message.'
                                    : 'No conversation selected.'}
                            </EmptyState>
                        ) : (
                            orderedMessages.map((chatMessage) => (
                                <ChatMessage message={chatMessage} key={chatMessage.id}/>
                            ))
                        )}
                    </ChatMessagesWrapper>

                    {errorMessage && <ErrorText>{errorMessage}</ErrorText>}

                    <Form onSubmit={formOnSubmit}>
                        <MessageInput
                            type="text"
                            value={draftMessage}
                            disabled={!selectedConversationId || isSendingMessage}
                            placeholder="Message the assistant"
                            onChange={(event) => setDraftMessage(event.target.value)}
                        />
                        <SendButton
                            type="submit"
                            disabled={!selectedConversationId || !draftMessage.trim() || isSendingMessage}
                        >
                            {isSendingMessage ? 'Sending' : 'Send'}
                        </SendButton>
                    </Form>
                </ChatPanel>
            </AppShell>
        </>
    );
}

export default App;
