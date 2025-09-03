import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ImageContext from "../context/images/imageContext";
import UserContext from "../context/user/userContext";
import ThemeContext from "../context/theme/themeContext";
import "./Navbar.css";

function Navbar(props) {
  // Add context for clearing caches on logout
  const { clearImageCache } = useContext(ImageContext);
  const { userData, clearUserData, getUserData } = useContext(UserContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [userInitials, setUserInitials] = useState('');
  
  //sets navigation
  let navigate = useNavigate();

  //it sets the location of the router
  const location = useLocation();
  
  // Fetch user data when component mounts if auth token exists
  useEffect(() => {
    const fetchUserData = async () => {
      if (localStorage.getItem("authtoken") && !userData) {
        await getUserData();
      }
    };
    
    fetchUserData();
    // eslint-disable-next-line
  }, []);
  
  // Update user initials when userData changes
  useEffect(() => {
    if (userData && userData.name) {
      const initials = userData.name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase();
      setUserInitials(initials);
    }
  }, [userData]);

  const handlelogout = () => {
    // Clear caches when logging out
    clearImageCache();
    clearUserData();
    localStorage.removeItem("authtoken");
    navigate("/login");
    props.showAlert("Logged Out ", "success");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="fas fa-book-open me-2"></i>
          iNoteBook
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link
                className={`nav-link ${
                  location.pathname === "/" ? "active" : ""
                }`}
                aria-current="page"
                to="/"
              >
                <i className="fas fa-home me-1"></i> Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${
                  location.pathname === "/about" ? "active" : ""
                }`}
                to="/about"
              >
                <i className="fas fa-info-circle me-1"></i> About
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${
                  location.pathname === "/images" ? "active" : ""
                }`}
                to="/images"
              >
                <i className="fas fa-images me-1"></i> Images
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${
                  location.pathname === "/notes" ? "active" : ""
                }`}
                to="/notes"
              >
                <i className="fas fa-sticky-note me-1"></i> Notes
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${
                  location.pathname === "/messages" ? "active" : ""
                }`}
                to="/messages"
              >
                <i className="fas fa-comments me-1"></i> Messages
              </Link>
            </li>
          </ul>
          
          <div className="theme-toggle-wrapper me-3">
            <button 
              className="theme-toggle-btn" 
              onClick={toggleTheme} 
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <i className="fas fa-moon"></i>
              ) : (
                <i className="fas fa-sun"></i>
              )}
            </button>
          </div>
          
          {!localStorage.getItem("authtoken") ? (
            <div className="d-flex auth-buttons">
              <Link
                className={`btn auth-btn ${
                  location.pathname === "/login" ? "btn-login-active" : "btn-login"
                }`}
                to="/login"
                role="button"
              >
                <i className="fas fa-sign-in-alt me-1"></i> Login
              </Link>
              <Link
                className={`btn auth-btn ${
                  location.pathname === "/signup" ? "btn-signup-active" : "btn-signup"
                }`}
                to="/signup"
                role="button"
              >
                <i className="fas fa-user-plus me-1"></i> Sign Up
              </Link>
            </div>
          ) : (
            <div className="d-flex align-items-center">
              <Link
                to="/profile"
                className={`user-profile-link me-3 ${
                  location.pathname === "/profile" ? "active" : ""
                }`}
                title="View your profile"
              >
                <div className="navbar-profile-pic">
                  {userData && userData.profilePic ? (
                    <img src={userData.profilePic} alt={userData.name || "User"} />
                  ) : (
                    <div className="navbar-profile-initials">{userInitials || "U"}</div>
                  )}
                </div>
                <span>Profile</span>
              </Link>
              <button className="btn btn-logout" onClick={handlelogout}>
                <i className="fas fa-sign-out-alt me-1"></i> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
