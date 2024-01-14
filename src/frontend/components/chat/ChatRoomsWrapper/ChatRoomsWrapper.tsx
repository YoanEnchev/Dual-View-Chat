import React, { FC } from 'react';
import ChatRoom from '../ChatRoom/ChatRoom';
import IChatRoomsWrapper from './IChatRoomsWrapper';

const ChatRoomsWrapper: FC<IChatRoomsWrapper> = ({chatIDs, userAccessToken}) => {

    return <div className="row">
        {chatIDs.map((chatID: number) => <ChatRoom chatID={chatID} userAccessToken={userAccessToken} key={chatID} />)}
    </div>
};

export default ChatRoomsWrapper;
