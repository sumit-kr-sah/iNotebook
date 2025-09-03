import { useState } from "react";
import UserContext from "./userContext";

const UserState = (props) => {
  const host = "http://localhost:5000";
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  // Get User Data
  const getUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${host}/api/auth/getuser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("authtoken"),
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUserData(data);
        return data;
      } else {
        setError(data.error || "Failed to fetch user data");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Error connecting to server");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update User Profile (name)
  const updateUserProfile = async (name, profilePic) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updateData = {};
      if (name) updateData.name = name;
      if (profilePic !== undefined) updateData.profilePic = profilePic;
      
      const response = await fetch(`${host}/api/auth/updateprofile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("authtoken"),
        },
        body: JSON.stringify(updateData),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setUserData(data.user);
        return { success: true, user: data.user };
      } else {
        setError(data.error || "Failed to update profile");
        return { success: false, error: data.error || "Failed to update profile" };
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
      setError("Error connecting to server");
      return { success: false, error: "Error connecting to server" };
    } finally {
      setIsLoading(false);
    }
  };

  // Update Profile Picture
  const updateProfilePicture = async (profilePic) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${host}/api/auth/updateprofilepic`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("authtoken"),
        },
        body: JSON.stringify({ profilePic }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setUserData(data.user);
        return { success: true, user: data.user };
      } else {
        setError(data.error || "Failed to update profile picture");
        return { success: false, error: data.error || "Failed to update profile picture" };
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      setError("Error connecting to server");
      return { success: false, error: "Error connecting to server" };
    } finally {
      setIsLoading(false);
    }
  };

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Change User Password
  const changeUserPassword = async (currentPassword, newPassword) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${host}/api/auth/changepassword`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("authtoken"),
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        return { success: true, message: data.message };
      } else {
        setError(data.error || "Failed to change password");
        return { success: false, error: data.error || "Failed to change password" };
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setError("Error connecting to server");
      return { success: false, error: "Error connecting to server" };
    } finally {
      setIsLoading(false);
    }
  };

  // Clear user data on logout
  const clearUserData = () => {
    setUserData(null);
  };

  // Get all users for messaging
  const getAllUsers = async () => {
    try {
      const response = await fetch(`${host}/api/auth/allusers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("authtoken"),
        },
      });
      const json = await response.json();
      setUsers(Array.isArray(json) ? json : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  return (
    <UserContext.Provider
      value={{ 
        userData, 
        isLoading, 
        error, 
        getUserData, 
        updateUserProfile,
        updateProfilePicture,
        fileToBase64,
        changeUserPassword,
        clearUserData,
        users,
        getAllUsers
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
};

export default UserState; 