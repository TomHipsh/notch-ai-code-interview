import {createGlobalStyle} from "styled-components";
import styled from "styled-components";

export const GlobalStyle = createGlobalStyle`
    *,
    *::before,
    *::after {
        box-sizing: border-box;
    }

    * {
        margin: 0;
    }

    html,
    body,
    #root {
        height: 100%;
    }

    body {
        overscroll-behavior: none;
    }

    button,
    input,
    textarea,
    select {
        font: inherit;
    }

    button {
        font-synthesis: none;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
`;

export const AppShell = styled.main`
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

export const Sidebar = styled.aside`
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

export const SidebarTitle = styled.h1`
    color: #0f172a;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0;
`;

export const ConversationList = styled.nav`
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 0;
    overflow-y: auto;
`;

export const ConversationButton = styled.button<{ $isSelected: boolean }>`
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

export const ConversationTitle = styled.span`
    overflow: hidden;
    color: #172033;
    font-size: 14px;
    font-weight: 650;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const ConversationMeta = styled.span`
    color: #64748b;
    font-size: 12px;
`;

export const CreateConversationButton = styled.button`
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

export const ChatPanel = styled.section`
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    min-width: 0;
    min-height: 0;
`;

export const ChatHeader = styled.header`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 22px;
    border-bottom: 1px solid #dde4ee;
    background: #ffffff;
`;

export const ChatHeaderText = styled.div`
    display: grid;
    gap: 2px;
    min-width: 0;
`;

export const ChatTitle = styled.h2`
    color: #0f172a;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const ChatSubtitle = styled.p`
    color: #64748b;
    font-size: 13px;
`;

export const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
`;

export const HeaderButton = styled.button`
    min-height: 34px;
    padding: 0 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background: #ffffff;
    color: #172033;
    cursor: pointer;
    font-weight: 700;

    &:disabled {
        cursor: not-allowed;
        opacity: 0.6;
    }
`;

export const IconButton = styled(HeaderButton)`
    width: 34px;
    min-width: 34px;
    padding: 0;
    font-size: 16px;
`;

export const TitleInput = styled.input`
    width: min(520px, 100%);
    min-height: 36px;
    padding: 0 10px;
    border: 1px solid #9fb4cb;
    border-radius: 8px;
    color: #0f172a;
    font-size: 18px;
    font-weight: 700;
`;

export const ChatMessagesWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
    overflow-y: auto;
    padding: 22px;
`;

export const EmptyState = styled.div`
    display: grid;
    place-items: center;
    height: 100%;
    padding: 32px;
    color: #64748b;
    text-align: center;
`;

export const Form = styled.form`
    display: flex;
    gap: 10px;
    padding: 16px 22px;
    border-top: 1px solid #dde4ee;
    background: #ffffff;

    @media (max-width: 560px) {
        flex-direction: column;
    }
`;

export const MessageInput = styled.input`
    flex: 1;
    min-width: 0;
    min-height: 44px;
    padding: 0 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background: #ffffff;
    color: #172033;
`;

export const SendButton = styled.button`
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

export const ErrorText = styled.p`
    padding: 0 22px 14px;
    color: #b42318;
    font-size: 13px;
`;
