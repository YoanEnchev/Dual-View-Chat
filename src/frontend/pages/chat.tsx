import React from 'react';
import * as ReactDOM from 'react-dom/client'
import ChatRoomsWrapper from '../components/chat/ChatRoomsWrapper/ChatRoomsWrapper';
import getAppBaseURL from '../helpers/getAppBaseURL';

const chatContainer = document.querySelector('#chats-container')

if (chatContainer) {
    // @ts-ignore
    const chatIDs: number[] = fromServer.chatsIDs

    try {
        fetch(`${getAppBaseURL()}/user/access-token`, {
            method: 'GET',
        })
        .then(async (res: Response) => {
            if (!res.ok) {
                alert('Failed loading. Please try again later.')
            }
            
            ReactDOM.createRoot(chatContainer)
            .render(<ChatRoomsWrapper chatIDs={chatIDs} 
                userAccessToken={await res.text()} />);
        })
    }
    catch (error) {
        console.log(error)
        alert('Failed loading. Try authenticating')
    }
}