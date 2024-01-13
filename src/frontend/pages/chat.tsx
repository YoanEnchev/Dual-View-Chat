import React from 'react';
import * as ReactDOM from 'react-dom/client'
import ChatRoomsWrapper from '../components/chat/ChatRoomsWrapper/ChatRoomsWrapper';

const chatContainer = document.querySelector('#chats-container')

if (chatContainer) {
    // @ts-ignore
    const chatIDs: number[] = fromServer.chatsIDs

    ReactDOM.createRoot(chatContainer)
        .render(<ChatRoomsWrapper chatIDs={chatIDs} />);
}