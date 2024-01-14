import React, { FC, ChangeEvent, FormEvent, useState, useEffect, useRef } from 'react';
import getAppBaseURL from '../../../helpers/getAppBaseURL';
import IChatRoom from './IChatRoom';
import IMessageJSONFormat from 'src/shared/interfaces/IMessageJSONFormat';
import io, { Socket } from 'socket.io-client';
import UserPublishesMessagePayload from 'src/shared/interfaces/UserPublishesMessagePayload';
import IMessageProcessingError from 'src/shared/interfaces/IMessageProcessingError';

const ChatRoom: FC<IChatRoom> = ({chatID, userAccessToken}) => {

    const [topErrorMessage, setTopErrorMessage] = useState<string>('');
    const [messages, setMessages] = useState<IMessageJSONFormat>([]);
    const [valueInTextbox, setValueInTextbox] = useState<string>('');
    const [isAwaitingGPTResponse, setIsAwaitingGPTResponse] = useState<boolean>(false);

    const messagesScrollContainerRef = useRef<HTMLDivElement>(null);
    const messagesRef = useRef<number>([]) // So we can access most recent count of the messages state inside callbacks such as handleScroll.
    const socketRef = useRef<Socket|null>(null);
    const msgIDAwaitingGPTResponseRef = useRef<number|null>(null);

    const fetchMessages = async (skip: number) => {
        try {
            const res: Response = await fetch(`${getAppBaseURL()}/chats/${chatID}/messages?skip=${skip}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            res.json().then(jsonData => {
                if (res.ok) {
                    // Load older messages and add them on top.
                    setMessages([...jsonData, ...messagesRef.current])
                    setTopErrorMessage('')
                }
                else {
                    setTopErrorMessage(jsonData.errorMessage)
                }
            })
        }
        catch (error) {
            console.log(error)
            setTopErrorMessage('Service not available. Please try again later.')
        }
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setValueInTextbox('');

        msgIDAwaitingGPTResponseRef.current = `${chatID}-${Math.floor(Math.random() * 100_000_000_000_000)}`

        const payload: UserPublishesMessagePayload = {
            msgText: valueInTextbox,
            chatID, userAccessToken,
            msgClientID: msgIDAwaitingGPTResponseRef.current
        }

        setIsAwaitingGPTResponse(true);
        socketRef.current.emit('user-publishes-message', payload);
    };

    const onMessageTyping = (event: ChangeEvent<HTMLInputElement>): void => {
        setValueInTextbox(event.target.value)
    }


    const handleScroll = () => {
        // Check if scrollbar is at the very top
        if (messagesScrollContainerRef.current && messagesScrollContainerRef.current.scrollTop === 0) {
            
            fetchMessages(messagesRef.current.length)
        }
    };

    const scrollToBottomMsgContainer = () => {
        setTimeout(() => {
            // Wait for new messages to render, then set scrollbar to bottom.
            messagesScrollContainerRef.current.scrollTop = messagesScrollContainerRef.current.scrollHeight;
        }, 300)
    }

    useEffect(() => {
        // Load initial (most recent) messages.
        fetchMessages(0)
            .then(() => {
                scrollToBottomMsgContainer();
            })
        

        // Attach scroll event listener to the container
        if (messagesScrollContainerRef.current) {
            messagesScrollContainerRef.current.addEventListener('scroll', handleScroll);
        }

        const { hostname } = window.location
        socketRef.current = io(`http://${hostname}:4001`);
    
        // Listen for the "messageCreated" event
        socketRef.current.on(`message-inserted-for-chat-${chatID}`, (messageObject: IMessageJSONFormat) => {
            // Handle the new message
            setMessages((prevMessages) => [...prevMessages, messageObject]);
            setTopErrorMessage('');

            scrollToBottomMsgContainer();

            if (messageObject.gptResponseToClientIDMsg == msgIDAwaitingGPTResponseRef.current) {
                setIsAwaitingGPTResponse(false)
            }
        });

        socketRef.current.on(`error-for-chat-${chatID}`, (errorData: IMessageProcessingError) => {
            setTopErrorMessage(errorData.errorMessage);

            if (errorData.msgClientID == msgIDAwaitingGPTResponseRef.current) {
                setIsAwaitingGPTResponse(false)
            }
        });

        socketRef.current.on('error', (err) => console.log('error', err));
  
        // Clean up the event listener on component unmount
        return () => {
            if (messagesScrollContainerRef.current) {
                messagesScrollContainerRef.current.removeEventListener('scroll', handleScroll);
            }

            if (socketRef.current) socketRef.current.disconnect();
        }
    }, [])

    useEffect(() => {
        messagesRef.current = messages
    }, [messages])
    
    return <div className="col-12 col-md-6">
    <div className="card">
      <div className="card-header bg-primary text-white">Chat Room</div>
      <div className="card-body">
        {topErrorMessage ? <p className="text-danger">{topErrorMessage}</p> : <></>}
        
        <div style={{ height: 450, overflowY: "auto" }} ref={messagesScrollContainerRef}> 
            {messages.map((msg: IMessageJSONFormat, index: number) => <div className={`mt-2 alert alert-${msg.isFromUser ? 'primary' : 'secondary'}`} key={index}>
            <strong>{msg.isFromUser ? 'You' : 'GPT Model'}:</strong> {msg.text}
          </div>)}
        </div>
      </div>

      <div className="card-footer">
        <form method="post" onSubmit={handleSubmit}>
            <div className="input-group">
            <input
                type="text"
                className="form-control"
                placeholder="Type your message"
                value={valueInTextbox}
                onChange={onMessageTyping}
                required
            />
            <button className="btn btn-primary" type='submit' disabled={isAwaitingGPTResponse}>
                {isAwaitingGPTResponse ? 'Processing...' : 'Send'}
            </button>
            </div>
        </form>
      </div>
    </div>
  </div>  
};

export default ChatRoom;
