import React from 'react';
import * as ReactDOM from 'react-dom/client'
import DualChatRoom from '../components/chat/DualChatRoom/DualChatRoom';

const chatContainer = document.querySelector('#dual-chat-container')

if (chatContainer) {
    
    ReactDOM.createRoot(chatContainer)
        .render(<DualChatRoom />);
}