import React, { FC, ChangeEvent, FormEvent, useState } from 'react';

const ChatRoom: FC = () => {
    
    return <div className="col-12 col-md-6">
    <div className="card">
      <div className="card-header bg-primary text-white">Chat Room</div>
      <div className="card-body">
        <div style={{ height: 300, overflowY: "auto" }}>
          <div className="alert alert-secondary mt-2">
            <strong>GPT Model:</strong> Hello! I'm a friendly robot.
          </div>
          <div className="alert alert-primary mt-2">
            <strong>You: </strong>
            Hello! How are you?
            
          </div>
        </div>
      </div>
      <div className="card-footer">
        <div className="input-group">
          <input
            type="text"
            id="message-input"
            className="form-control"
            placeholder="Type your message"
          />
          <button id="send-btn" className="btn btn-primary">
            Send
          </button>
        </div>
      </div>
    </div>
  </div>  
};

export default ChatRoom;
