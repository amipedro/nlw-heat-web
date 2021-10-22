import { api } from '../../services/api';
import { io } from 'socket.io-client';
import styles from './styles.module.scss';
import logoImg from '../../assets/logo.svg';
import { useEffect, useState } from 'react';

// Define type definitions
type Message = {
  id: string;
  text: string;
  user: {
    name: string;
    avatar_url: string;
  }
}

// Create a message Queue
const messagesQueue: Message[] = [];

const socket = io('http://localhost:4000');

socket.on('new_message', (newMessage: Message) => {
  messagesQueue.push(newMessage);
})

export function MessageList() {
  // state. Save data on components
  // Initiate with same type of variable
  // setMessages change content of messages
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    const timer = setInterval(() => {
      if (messagesQueue.length > 0) {
        setMessages(prevState => [
          messagesQueue[0],
          prevState[0],
          prevState[1],
        ].filter(Boolean));

        messagesQueue.shift();
      }
    }, 3000)
  }, [])

  // Load data when component is exhibited on screen
  // Array is filled-in when function is dependent on variable change
  useEffect(() => {
    // API call
    api.get<Message[]>('messages/last3').then(response => {
      setMessages(response.data)
    })
  }, [])

  return (
    <div className={styles.messageListWrapper}>
      <img src={logoImg} alt="DoWhile 2021" />

      <ul className={styles.messageList}>
        {messages.map(message => {
          return (
            <li key={message.id} className={styles.message}>
              <p className={styles.messageContent}>{message.text}</p>
              <div className={styles.messageUser}>
                <div className={styles.userImage}>
                  <img src={message.user.avatar_url} alt={message.user.name}></img>
                </div>
                <span>{message.user.name}</span>
              </div>
            </li>
          );
        })}

      </ul>
    </div>
  )
}