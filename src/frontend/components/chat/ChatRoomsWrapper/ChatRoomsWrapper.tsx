import React, { FC } from 'react';
import ChatRoom from '../ChatRoom/ChatRoom';
import IChatRoomsWrapper from './IChatRoomsWrapper';

const ChatRoomsWrapper: FC<IChatRoomsWrapper> = ({chatIDs}) => {

    return <div className="row">
        {chatIDs.map((chatID: number) => <ChatRoom chatID={chatID} key={chatID} />)}
    </div>
};

export default ChatRoomsWrapper;
