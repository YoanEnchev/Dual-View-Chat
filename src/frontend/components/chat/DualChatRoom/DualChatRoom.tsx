import React, { FC } from 'react';
import ChatRoom from '../ChatRoom/ChatRoom';

const DualChatRoom: FC = () => {

    return <div className="row">
        <ChatRoom />
        <ChatRoom />
    </div>
};

export default DualChatRoom;
