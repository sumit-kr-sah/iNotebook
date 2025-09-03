import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userContext from '../context/user/userContext';
import noteContext from '../context/notes/noteContext';
import imageContext from '../context/images/imageContext';
import ThemeContext from '../context/theme/themeContext';
import './Profile.css';

const Profile = (props) => {
  const navigate = useNavigate();
  const { userData, isLoading, error, getUserData, updateUserProfile, changeUserPassword, updateProfilePicture, fileToBase64 } = useContext(userContext);
  const { notes, getNotes } = useContext(noteContext);
  const { images, getImages } = useContext(imageContext);
  const { theme } = useContext(ThemeContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingProfilePic, setIsChangingProfilePic] = useState(false);
  const [stats, setStats] = useState({
    notesCount: 0,
    imagesCount: 0
  });

  // Form states
  const [editedName, setEditedName] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicBase64, setProfilePicBase64] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    general: ''
  });

  // Fetch user data when component mounts
  useEffect(() => {
    if (!localStorage.getItem('authtoken')) {
      navigate('/login');
      return;
    }
    
    const fetchData = async () => {
      await getUserData();
      await getNotes();
      await getImages(true); // true to exclude image data for better performance
    };
    
    fetchData();
    // eslint-disable-next-line
  }, []);

  // Set edited name when user data is loaded
  useEffect(() => {
    if (userData) {
      setEditedName(userData.name || '');
      setProfilePicBase64(userData.profilePic || '');
    }
  }, [userData]);

  // Calculate stats from notes and images data
  useEffect(() => {
    setStats({
      notesCount: notes.length,
      imagesCount: images.length
    });
  }, [notes, images]);

  // Handle profile picture change
  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      try {
        const base64 = await fileToBase64(file);
        setProfilePicBase64(base64);
      } catch (error) {
        console.error("Error converting image to base64:", error);
        props.showAlert("Error processing image", "danger");
      }
    }
  };

  // Handle profile picture update
  const handleProfilePicUpdate = async () => {
    if (!profilePicBase64) {
      props.showAlert("Please select an image", "warning");
      return;
    }
    
    const result = await updateProfilePicture(profilePicBase64);
    
    if (result.success) {
      props.showAlert("Profile picture updated successfully", "success");
      setIsChangingProfilePic(false);
    } else {
      props.showAlert(result.error || "Failed to update profile picture", "danger");
    }
  };

  // Handle name update
  const handleNameUpdate = async (e) => {
    e.preventDefault();
    
    if (editedName.trim().length < 3) {
      props.showAlert("Name must be at least 3 characters", "warning");
      return;
    }
    
    const result = await updateUserProfile(editedName);
    
    if (result.success) {
      props.showAlert("Profile updated successfully", "success");
      setIsEditing(false);
    } else {
      props.showAlert(result.error || "Failed to update profile", "danger");
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setPasswordErrors({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      general: ''
    });
    
    // Validate
    let hasError = false;
    const newErrors = { ...passwordErrors };
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
      hasError = true;
    }
    
    if (passwordData.newPassword.length < 5) {
      newErrors.newPassword = "New password must be at least 5 characters";
      hasError = true;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      hasError = true;
    }
    
    if (hasError) {
      setPasswordErrors(newErrors);
      return;
    }
    
    // Submit
    const result = await changeUserPassword(
      passwordData.currentPassword,
      passwordData.newPassword
    );
    
    if (result.success) {
      props.showAlert("Password changed successfully", "success");
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } else {
      setPasswordErrors({
        ...newErrors,
        general: result.error || "Failed to change password"
      });
      props.showAlert(result.error || "Failed to change password", "danger");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get user's initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Handle password input changes
  const handlePasswordInputChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  if (isLoading) {
    return (
      <div className="profile-container animate-fadeIn">
        <div className="profile-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading profile information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container animate-fadeIn">
        <div className="profile-error">
          <i className="fas fa-exclamation-circle"></i>
          <h3>Error Loading Profile</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={getUserData}>Try Again</button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-container animate-fadeIn">
        <div className="profile-error">
          <i className="fas fa-user-slash"></i>
          <h3>No Profile Data</h3>
          <p>Unable to load your profile information.</p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`profile-container animate-fadeIn ${theme === 'dark' ? 'dark-mode' : ''}`}>
      <div className="profile-header">
        <h1>Your Profile</h1>
        <p className="profile-subtitle">Manage your account information</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-card-header">
            <div 
              className="profile-avatar"
              onClick={() => setIsChangingProfilePic(true)}
              title="Change profile picture"
            >
              {userData.profilePic ? (
                <img 
                  src={userData.profilePic} 
                  alt={userData.name} 
                  className="profile-image"
                />
              ) : (
                getInitials(userData.name)
              )}
              <div className="profile-avatar-overlay">
                <i className="fas fa-camera"></i>
              </div>
            </div>
            <div className="profile-info">
              <h2>{userData.name}</h2>
              <p className="profile-email">{userData.email}</p>
              <p className="profile-joined">
                <i className="fas fa-calendar-alt me-2"></i> 
                Joined {formatDate(userData.date)}
              </p>
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-value">{stats.notesCount}</div>
              <div className="stat-label">Notes</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.imagesCount}</div>
              <div className="stat-label">Images</div>
            </div>
          </div>

          <div className="profile-actions">
            <button 
              className="btn btn-outline-primary"
              onClick={() => {
                setIsEditing(!isEditing);
                setIsChangingPassword(false);
                setIsChangingProfilePic(false);
              }}
            >
              <i className="fas fa-edit me-2"></i> 
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {isChangingProfilePic && (
            <div className="profile-edit-section">
              <h3><i className="fas fa-camera me-2"></i> Change Profile Picture</h3>
              <div className="profile-pic-update">
                <div className="current-pic-container">
                  <p className="mb-2">Current</p>
                  <div className="current-profile-pic">
                    {userData.profilePic ? (
                      <img src={userData.profilePic} alt={userData.name} />
                    ) : (
                      <div className="no-pic-placeholder">
                        <i className="fas fa-user"></i>
                        <span>No Picture</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="new-pic-container">
                  <p className="mb-2">New</p>
                  <div className="profile-pic-upload">
                    {profilePicBase64 && profilePicBase64 !== userData.profilePic ? (
                      <div className="profile-pic-preview">
                        <img src={profilePicBase64} alt="Profile Preview" className="preview-image" />
                        <button 
                          type="button" 
                          className="remove-pic-btn"
                          onClick={() => {
                            setProfilePic(null);
                            setProfilePicBase64(userData.profilePic || '');
                          }}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ) : (
                      <div className="profile-pic-placeholder">
                        <i className="fas fa-user-circle"></i>
                        <p>Select Image</p>
                        <input
                          type="file"
                          id="profilePic"
                          className="file-input"
                          accept="image/*"
                          onChange={handleProfilePicChange}
                        />
                        <label htmlFor="profilePic" className="upload-btn">
                          <i className="fas fa-camera me-2"></i> Browse
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="d-flex justify-content-end mt-2">
                <button 
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={() => {
                    setIsChangingProfilePic(false);
                    setProfilePicBase64(userData.profilePic || '');
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleProfilePicUpdate}
                  disabled={profilePicBase64 === userData.profilePic}
                >
                  Update
                </button>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="profile-edit-section">
              <h3><i className="fas fa-user-edit me-2"></i> Edit Profile</h3>
              <form onSubmit={handleNameUpdate}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    minLength="3"
                    required
                  />
                  <small className="form-text text-muted">
                    Must be at least 3 characters
                  </small>
                </div>
                <div className="d-flex justify-content-end">
                  <button 
                    type="button"
                    className="btn btn-sm btn-secondary me-2"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedName(userData.name || '');
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-sm btn-primary"
                    disabled={editedName.trim().length < 3}
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="profile-sections">
          <div className="section-card">
            <div className="section-header">
              <h3><i className="fas fa-shield-alt me-2"></i> Security</h3>
            </div>
            <div className="section-content">
              <div className="section-item">
                <div className="section-item-title">
                  <i className="fas fa-key me-2"></i> Password
                </div>
                <div className="section-item-action">
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      setIsChangingPassword(!isChangingPassword);
                      setIsEditing(false);
                      setIsChangingProfilePic(false);
                    }}
                  >
                    {isChangingPassword ? 'Cancel' : 'Change'}
                  </button>
                </div>
              </div>
              
              {isChangingPassword && (
                <div className="password-change-form mt-3">
                  <form onSubmit={handlePasswordChange}>
                    {passwordErrors.general && (
                      <div className="alert alert-danger py-2">{passwordErrors.general}</div>
                    )}
                    <div className="mb-2">
                      <label htmlFor="currentPassword" className="form-label">Current Password</label>
                      <input
                        type="password"
                        className={`form-control ${passwordErrors.currentPassword ? 'is-invalid' : ''}`}
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordInputChange}
                        required
                      />
                      {passwordErrors.currentPassword && (
                        <div className="invalid-feedback">{passwordErrors.currentPassword}</div>
                      )}
                    </div>
                    
                    <div className="mb-2">
                      <label htmlFor="newPassword" className="form-label">New Password</label>
                      <input
                        type="password"
                        className={`form-control ${passwordErrors.newPassword ? 'is-invalid' : ''}`}
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordInputChange}
                        minLength="5"
                        required
                      />
                      {passwordErrors.newPassword ? (
                        <div className="invalid-feedback">{passwordErrors.newPassword}</div>
                      ) : (
                        <small className="form-text text-muted">
                          At least 5 characters
                        </small>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        className={`form-control ${passwordErrors.confirmPassword ? 'is-invalid' : ''}`}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordInputChange}
                        required
                      />
                      {passwordErrors.confirmPassword && (
                        <div className="invalid-feedback">{passwordErrors.confirmPassword}</div>
                      )}
                    </div>
                    
                    <div className="d-flex justify-content-end">
                      <button 
                        type="button"
                        className="btn btn-sm btn-secondary me-2"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          });
                          setPasswordErrors({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                            general: ''
                          });
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-sm btn-primary"
                      >
                        Change Password
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
          
          <div className="section-card mt-3">
            <div className="section-header">
              <h3><i className="fas fa-chart-bar me-2"></i> Account Activity</h3>
            </div>
            <div className="section-content">
              <div className="activity-stats">
                <div className="row g-2">
                  <div className="col-6">
                    <div className="activity-stat-card">
                      <div className="activity-icon">
                        <i className="fas fa-sticky-note"></i>
                      </div>
                      <div className="activity-details">
                        <div className="activity-value">{stats.notesCount}</div>
                        <div className="activity-label">Total Notes</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="activity-stat-card">
                      <div className="activity-icon">
                        <i className="fas fa-images"></i>
                      </div>
                      <div className="activity-details">
                        <div className="activity-value">{stats.imagesCount}</div>
                        <div className="activity-label">Total Images</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 