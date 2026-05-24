import React from "react";
import styled from "styled-components";
import {ChatMessage as ChatMessageModel} from "../api";

const ChatMessageWrapper = styled.article<{ $role: ChatMessageModel['role'] }>`
    display: grid;
    gap: 6px;
    width: min(680px, 82%);
    padding: 12px 14px;
    border: 1px solid ${({$role}) => $role === 'user' ? '#b8d8c2' : '#b9c9db'};
    border-radius: 8px;
    background: ${({$role}) => $role === 'user' ? '#eef8f0' : '#f3f7fb'};
    color: #172033;
    margin-inline-start: ${({$role}) => $role === 'user' ? 'auto' : '0'};
    margin-inline-end: ${({$role}) => $role === 'user' ? '0' : 'auto'};
`;

const MessageRole = styled.strong`
    color: #475569;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0;
    text-transform: uppercase;
`;

const MessageContent = styled.p`
    color: #172033;
    font-size: 15px;
    line-height: 1.5;
    white-space: pre-wrap;
`;

const SentimentScore = styled.span<{ $score: number }>`
    color: ${({$score}) => getSentimentColor($score)};
    font-size: 12px;
    font-weight: 700;
`;

interface ChatMessageProps {
    message: ChatMessageModel;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({message}) => {
    return (
        <ChatMessageWrapper $role={message.role}>
            <MessageRole>{message.role}</MessageRole>
            <MessageContent>{message.content}</MessageContent>
            {message.role === 'user' && typeof message.sentimentScore === 'number' && (
                <SentimentScore $score={message.sentimentScore}>
                    Sentiment: {message.sentimentScore}
                </SentimentScore>
            )}
        </ChatMessageWrapper>
    );
};

const getSentimentColor = (score: number): string => {
    const clampedScore = Math.min(100, Math.max(0, score));
    const hue = Math.round((clampedScore / 100) * 120);

    return `hsl(${hue}, 70%, 35%)`;
};
