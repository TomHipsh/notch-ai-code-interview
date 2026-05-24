import './App.css';
import './reset.css';
import styled from "styled-components";
import {ChatMessage} from "./ChatMessage";
import {FormEvent, useEffect, useMemo, useState} from "react";
import {
    ChatMessage as ChatMessageModel,
    Conversation,
    createConversation,
    createConversationMessage,
    getConversation,
    listConversations,
} from "./api";

const AppShell = styled.main`
    display: grid;
    grid-template-columns: minmax(240px, 320px) minmax(0, 1fr);
    height: 100%;
    min-height: 100%;
    background: #f6f8fb;
    color: #172033;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

    @media (max-width: 760px) {
        grid-template-columns: 1fr;
        grid-template-rows: minmax(220px, 34vh) minmax(0, 1fr);
    }
`;

const Sidebar = styled.aside`
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    gap: 12px;
    min-width: 0;
    padding: 18px;
    border-right: 1px solid #dde4ee;
    background: #ffffff;

    @media (max-width: 760px) {
        border-right: 0;
        border-bottom: 1px solid #dde4ee;
    }
`;

const SidebarTitle = styled.h1`
    color: #0f172a;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0;
`;

const ConversationList = styled.nav`
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 0;
    overflow-y: auto;
`;

const ConversationButton = styled.button<{ $isSelected: boolean }>`
    display: grid;
    gap: 4px;
    width: 100%;
    min-height: 58px;
    padding: 10px 12px;
    border: 1px solid ${({$isSelected}) => $isSelected ? '#91b6d8' : '#e0e6ef'};
    border-radius: 8px;
    background: ${({$isSelected}) => $isSelected ? '#e9f3ff' : '#ffffff'};
    color: #172033;
    cursor: pointer;
    text-align: start;

    &:hover {
        border-color: #9fb4cb;
        background: #f5f9fd;
    }
`;

const ConversationTitle = styled.span`
    overflow: hidden;
    color: #172033;
    font-size: 14px;
    font-weight: 650;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const ConversationMeta = styled.span`
    color: #64748b;
    font-size: 12px;
`;

const CreateConversationButton = styled.button`
    width: 100%;
    min-height: 42px;
    border: 0;
    border-radius: 8px;
    background: #1f7a57;
    color: #ffffff;
    cursor: pointer;
    font-weight: 700;

    &:disabled {
        cursor: not-allowed;
        opacity: 0.68;
    }
`;

const ChatPanel = styled.section`
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    min-width: 0;
    min-height: 0;
`;

const ChatHeader = styled.header`
    display: grid;
    gap: 2px;
    padding: 18px 22px;
    border-bottom: 1px solid #dde4ee;
    background: #ffffff;
`;

const ChatTitle = styled.h2`
    color: #0f172a;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0;
`;

const ChatSubtitle = styled.p`
    color: #64748b;
    font-size: 13px;
`;

const ChatMessagesWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
    overflow-y: auto;
    padding: 22px;
`;

const EmptyState = styled.div`
    display: grid;
    place-items: center;
    height: 100%;
    padding: 32px;
    color: #64748b;
    text-align: center;
`;

const Form = styled.form`
    display: flex;
    gap: 10px;
    padding: 16px 22px;
    border-top: 1px solid #dde4ee;
    background: #ffffff;

    @media (max-width: 560px) {
        flex-direction: column;
    }
`;

const MessageInput = styled.input`
    flex: 1;
    min-width: 0;
    min-height: 44px;
    padding: 0 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background: #ffffff;
    color: #172033;
`;

const SendButton = styled.button`
    min-width: 96px;
    min-height: 44px;
    border: 0;
    border-radius: 8px;
    background: #246b8f;
    color: #ffffff;
    cursor: pointer;
    font-weight: 700;

    &:disabled {
        cursor: not-allowed;
        opacity: 0.68;
    }
`;

const ErrorText = styled.p`
    padding: 0 22px 14px;
    color: #b42318;
    font-size: 13px;
`;

function App() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string>();
    const [chatMessages, setChatMessages] = useState<ChatMessageModel[]>([]);
    const [draftMessage, setDraftMessage] = useState('');
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isCreatingConversation, setIsCreatingConversation] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>();

    const selectedConversation = conversations.find(
        (conversation) => conversation.id === selectedConversationId,
    );

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

    return (
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
                    <ChatTitle>{selectedConversation?.title ?? 'Select a conversation'}</ChatTitle>
                    <ChatSubtitle>
                        {selectedConversation
                            ? `${selectedConversation.messageIds.length} saved messages`
                            : 'Create or choose a conversation'}
                    </ChatSubtitle>
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
    );
}

export default App;
