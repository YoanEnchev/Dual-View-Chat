import React, { FC, ChangeEvent, FormEvent, useState, useEffect, useRef } from 'react';
import getAppBaseURL from '../../../helpers/getAppBaseURL';
import IChatRoom from './IChatRoom';
import IMessageJSONFormat from 'src/shared/interfaces/IMessageJSONFormat';

const ChatRoom: FC<IChatRoom> = ({chatID}) => {

    const [topErrorMessage, setTopErrorMessage] = useState<string>('');
    const [messages, setMessages] = useState<IMessageJSONFormat>([]);
    const [isProcessingMessage, setIsProcessingMessage] = useState<boolean>(false);
    const [valueInTextbox, setValueInTextbox] = useState<string>('');

    const messagesScrollContainerRef = useRef<HTMLDivElement>(null);
    const messagesRef = useRef<number>([]) // So we can access most recent count of the messages state inside callbacks such as handleScroll.

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
                    console.log('------->', jsonData, messages, '<------')
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
        setIsProcessingMessage(true)

        try {
            const res: Response = await fetch(`${getAppBaseURL()}/chats/${chatID}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: valueInTextbox,
                    chatID,
                }),
            })

            const json = await res.json();

            if (res.ok) {
                setTopErrorMessage('');
                setValueInTextbox('');
                const newMessage: IMessageJSONFormat = json.messageObject
                
                setMessages([...messagesRef.current, newMessage])
                return;
            }

            setTopErrorMessage(json.message)
        }
        catch (error) {
            console.log(error)
            setTopErrorMessage('Service not available. Please try again later.')
        }
        finally {
            setIsProcessingMessage(false)
        }
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

    useEffect(() => {
        // Load initial (most recent) messages.
        fetchMessages(0)
            .then(() => {
                setTimeout(() => {
                    // Wait for initial messages to render, then set scrollbar to bottom.
                    messagesScrollContainerRef.current.scrollTop = messagesScrollContainerRef.current.scrollHeight;
                }, 300)
            })
        

        // Attach scroll event listener to the container
        if (messagesScrollContainerRef.current) {
            messagesScrollContainerRef.current.addEventListener('scroll', handleScroll);
        }
  
        // Clean up the event listener on component unmount
        return () => {
            if (messagesScrollContainerRef.current) {
                messagesScrollContainerRef.current.removeEventListener('scroll', handleScroll);
            }
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
        
        <div style={{ height: 300, overflowY: "auto" }} ref={messagesScrollContainerRef}> 
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
            <button className="btn btn-primary" disabled={isProcessingMessage} type='submit'>
                {isProcessingMessage ? 'Processing...' : 'Send'}
            </button>
            </div>
        </form>
      </div>
    </div>
  </div>  
};

export default ChatRoom;
