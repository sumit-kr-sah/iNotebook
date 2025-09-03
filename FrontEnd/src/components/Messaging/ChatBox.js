import React, { useContext, useEffect, useState, useRef } from 'react';
import MessageContext from '../../context/messages/MessageContext';
import userContext from '../../context/user/userContext';

const ChatBox = () => {
  const messageContext = useContext(MessageContext);
  const { userData } = useContext(userContext);
  const { messages, currentChat, getMessages, sendMessage, deleteMessage } = messageContext;
  const [messageInput, setMessageInput] = useState('');
  const [chatUser, setChatUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const scrollRef = useRef();
  const messagesEndRef = useRef(null);
  
  // Get user details for the chat
  useEffect(() => {
    const getUserDetails = async () => {
      if (currentChat) {
        try {
          setLoading(true);
          const response = await fetch(`http://localhost:5000/api/auth/user/${currentChat}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'auth-token': localStorage.getItem('authtoken')
            }
          });
          const data = await response.json();
          setChatUser(data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching user details:', error);
          setLoading(false);
        }
      }
    };
    
    if (currentChat) {
      getMessages(currentChat);
      getUserDetails();
    }
    // eslint-disable-next-line
  }, [currentChat]);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (messageInput.trim() && currentChat) {
      setSending(true);
      try {
        await sendMessage(currentChat, messageInput);
        setMessageInput('');
      } catch (error) {
        console.error('Error sending message:', error);
        // Could add an alert here
      } finally {
        setSending(false);
      }
    }
  };
  
  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      setDeleting(true);
      try {
        const success = await deleteMessage(messageId);
        if (!success) {
          alert('Failed to delete message. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting message:', error);
        alert('An error occurred while deleting the message.');
      } finally {
        setDeleting(false);
      }
    }
  };
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (!currentChat) {
    return (
      <div className="chat-box-container empty-chat">
        <div className="select-chat-message">
          Select a user to start chatting
        </div>
      </div>
    );
  }
  
  return (
    <div className="chat-box-container">
      {/* Chat Header */}
      <div className="chat-header">
        {loading ? (
          <div className="chat-user-loading">Loading user info...</div>
        ) : chatUser ? (
          <>
            <div className="chat-user-avatar">
              {chatUser.profilePic ? (
                <img src={chatUser.profilePic} alt={chatUser.name} />
              ) : (
                <div className="default-avatar">
                  {chatUser.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="chat-user-info">
              <div className="chat-user-name">{chatUser.name}</div>
              <div className="chat-user-email">{chatUser.email}</div>
            </div>
          </>
        ) : (
          <div className="chat-user-not-found">User not found</div>
        )}
      </div>
      
      {/* Messages Area */}
      <div className="messages-container">
        {deleting && (
          <div className="deleting-overlay">
            <div className="deleting-message">Deleting message...</div>
          </div>
        )}
        {Array.isArray(messages) && messages.length > 0 ? (
          <>
            {messages.map((message, index) => (
              <div
                key={message._id || index}
                className={`message ${userData && message.sender === userData._id ? 'own' : 'other'}`}
                ref={index === messages.length - 1 ? scrollRef : null}
              >
                <div className="message-content">
                  <p>{message.content}</p>
                  <div className="message-time">
                    {formatTime(message.timestamp)}
                    {userData && message.sender === userData._id && (
                      <>
                        <span className={`read-status ${message.read ? 'read' : 'unread'}`}>
                          {message.read ? '✓✓' : '✓'}
                        </span>
                        <button 
                          className="delete-message-btn" 
                          onClick={() => handleDeleteMessage(message._id)}
                          title="Delete message"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="no-messages">
            <p>No messages yet</p>
            <p className="no-messages-hint">Be the first to say hello!</p>
          </div>
        )}
      </div>
      
      {/* Message Input */}
      <form className="message-input-container" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          className="message-input"
          disabled={sending}
        />
        <button 
          type="submit" 
          className={`send-button ${sending ? 'sending' : ''}`}
          disabled={sending || !messageInput.trim()}
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatBox; 