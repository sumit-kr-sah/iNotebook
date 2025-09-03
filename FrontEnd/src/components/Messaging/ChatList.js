import React, { useContext, useEffect, useState } from 'react';
import MessageContext from '../../context/messages/MessageContext';
import userContext from '../../context/user/userContext';

const ChatList = () => {
  const { getAllUsers, users = [], userData } = useContext(userContext);
  const { onlineUsers, currentChat, setCurrentChat } = useContext(MessageContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      await getAllUsers();
      setLoading(false);
    };
    
    fetchUsers();
    
    // Set up a refresh interval to load new users
    const intervalId = setInterval(fetchUsers, 30000); // refresh every 30 seconds
    
    return () => clearInterval(intervalId);
    // eslint-disable-next-line
  }, []);
  
  const filteredUsers = Array.isArray(users) 
    ? users.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];
  
  const handleUserSelect = (userId) => {
    setCurrentChat(userId);
  };
  
  return (
    <div className="chat-list-container">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control search-input"
        />
      </div>
      
      <div className="users-list">
        {loading ? (
          <div className="loading-message">Loading users...</div>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <div 
              key={user._id}
              className={`user-item ${currentChat === user._id ? 'active' : ''}`}
              onClick={() => handleUserSelect(user._id)}
            >
              <div className="user-avatar">
                {user.profilePic ? (
                  <img src={user.profilePic} alt={user.name} />
                ) : (
                  <div className="default-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className={`status-indicator ${onlineUsers.includes(user._id) ? 'online' : 'offline'}`}></span>
              </div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-email">{user.email}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-users-message">
            {searchTerm ? "No users match your search" : "No other users registered yet"}
          </div>
        )}
      </div>
      
      {/* Show status information */}
      <div className="user-status-info">
        <div className="status-indicator-label">
          <span className="status-indicator online"></span> Online
        </div>
        <div className="status-indicator-label">
          <span className="status-indicator offline"></span> Offline
        </div>
      </div>
    </div>
  );
};

export default ChatList; 