import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatList from './ChatList';
import ChatBox from './ChatBox';
import MessageContext from '../../context/messages/MessageContext';
import userContext from '../../context/user/userContext';
import './Messenger.css';

const Messenger = () => {
  const { userData, getUserData } = useContext(userContext);
  const { addUser } = useContext(MessageContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    if (!localStorage.getItem('authtoken')) {
      navigate('/login');
      return;
    }
    
    // Ensure user data is loaded
    const fetchData = async () => {
      setLoading(true);
      
      if (!userData) {
        const user = await getUserData();
        if (user && user._id) {
          addUser(user._id);
        }
      } else if (userData._id) {
        addUser(userData._id);
      }
      
      setLoading(false);
    };
    
    fetchData();
    // eslint-disable-next-line
  }, [userData]);
  
  if (loading) {
    return (
      <div className="messenger-container loading">
        <div className="loading-spinner">
          <p>Loading messenger...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="messenger-container">
      <div className="messenger-wrapper">
        <div className="messenger-sidebar">
          <ChatList />
        </div>
        <div className="messenger-content">
          <ChatBox />
        </div>
      </div>
    </div>
  );
};

export default Messenger; 