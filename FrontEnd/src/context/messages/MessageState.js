import { useState, useEffect } from "react";
import MessageContext from "./MessageContext";
import { io } from "socket.io-client";

const MessageState = (props) => {
  const host = "http://localhost:5000";
  const messagesInitial = [];
  const [messages, setMessages] = useState(messagesInitial);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  
  // Initialize Socket connection
  useEffect(() => {
    const newSocket = io(host);
    setSocket(newSocket);
    
    return () => {
      newSocket.disconnect();
    };
  }, [host]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;
    
    // Listen for incoming messages
    socket.on("getMessage", (data) => {
      setArrivalMessage({
        _id: data._id || Date.now().toString(), // Temporary ID if none provided
        sender: data.sender,
        receiver: data.receiver,
        content: data.content,
        timestamp: data.timestamp,
        read: false
      });
    });
    
    // Get online users
    socket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });
    
    // Listen for message deletion notifications
    socket.on("messageDeleted", ({ messageId }) => {
      setMessages(prev => 
        Array.isArray(prev) 
          ? prev.filter(message => message._id !== messageId) 
          : []
      );
    });
    
    return () => {
      socket.off("getMessage");
      socket.off("getOnlineUsers");
      socket.off("messageDeleted");
    };
  }, [socket]);

  // Add arrival message to chat
  useEffect(() => {
    if (arrivalMessage && currentChat) {
      // Only add the message if we're in the chat with this sender
      if (arrivalMessage.sender === currentChat || arrivalMessage.receiver === currentChat) {
        setMessages((prev) => {
          // Make sure we don't add duplicate messages
          if (Array.isArray(prev) && !prev.some(m => m._id === arrivalMessage._id)) {
            return [...prev, arrivalMessage];
          }
          return prev;
        });
        
        // Mark as read if this is the current chat
        if (arrivalMessage.sender === currentChat) {
          markMessagesAsRead(currentChat);
        }
      }
    }
  }, [arrivalMessage, currentChat]);

  // Add user to socket
  const addUser = (userId) => {
    if (socket && userId) {
      socket.emit("addUser", userId);
    }
  };

  // Get all messages with a specific user
  const getMessages = async (userId) => {
    try {
      const response = await fetch(`${host}/api/messages/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("authtoken"),
        },
      });
      const json = await response.json();
      setMessages(Array.isArray(json) ? json : []);
      markMessagesAsRead(userId);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
  };

  // Send a message
  const sendMessage = async (receiverId, content) => {
    try {
      // Send to backend
      const response = await fetch(`${host}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("authtoken"),
        },
        body: JSON.stringify({ receiver: receiverId, content }),
      });
      const message = await response.json();
      
      // Update state
      setMessages((prev) => Array.isArray(prev) ? [...prev, message] : [message]);
      
      // Send via socket if online
      if (socket) {
        socket.emit("sendMessage", {
          _id: message._id, // Include the message ID
          sender: message.sender,
          receiver: receiverId,
          content,
        });
      }
      
      return message;
    } catch (error) {
      console.error("Error sending message:", error);
      return null;
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (userId) => {
    try {
      await fetch(`${host}/api/messages/read/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("authtoken"),
        },
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // Delete a message
  const deleteMessage = async (messageId) => {
    try {
      const response = await fetch(`${host}/api/messages/${messageId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("authtoken"),
        },
      });
      
      const json = await response.json();
      
      if (json.success) {
        // Update local messages state by filtering out the deleted message
        setMessages(prev => 
          Array.isArray(prev) 
            ? prev.filter(message => message._id !== messageId) 
            : []
        );
        
        // If socket exists, notify the other user about the deletion
        if (socket && currentChat) {
          socket.emit("deleteMessage", {
            messageId,
            receiverId: currentChat
          });
        }
        
        return true;
      } else {
        console.error("Error deleting message:", json.error);
        return false;
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      return false;
    }
  };

  return (
    <MessageContext.Provider
      value={{
        messages,
        onlineUsers,
        currentChat,
        setCurrentChat,
        getMessages,
        sendMessage,
        addUser,
        markMessagesAsRead,
        deleteMessage,
      }}
    >
      {props.children}
    </MessageContext.Provider>
  );
};

export default MessageState; 