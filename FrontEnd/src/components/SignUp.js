import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import userContext from "../context/user/userContext";
import "./Auth.css";

const SignUp = (props) => {
  const [picture, setPicture] = useState();
  const { fileToBase64 } = useContext(userContext);
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    cpassword: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicBase64, setProfilePicBase64] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, password, email, cpassword } = credentials;

    if (password !== cpassword) {
      setPasswordMatch(false);
      props.showAlert("Passwords do not match", "danger");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/createuser`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name,
            email: email,
            password: password,
            profilePic: profilePicBase64,
          }),
        }
      );

      const json1 = await response.json();

      if (json1.success) {
        localStorage.setItem("authtoken", json1.jwt_token);
        props.showAlert("Account Created Successfully", "success");
        navigate("/");
      } else {
        props.showAlert(
          json1.error || "Account not created. Please try again.",
          "danger"
        );
      }
    } catch (error) {
      props.showAlert("Server error. Please try again later.", "danger");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onChange = (e) => {
    if (e.target.name === "cpassword" || e.target.name === "password") {
      setPasswordMatch(true);
    }
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const postPicture = async (e) => {
    // setPicture(picture);
    const file = e.target.files[0];
    console.log(file);

    if (!file) {
      props.showAlert("Please select a picture", "danger");
      return;
    }

    if (
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/jpg"
    ) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "iNoteBook");
      formData.append("cloud_name", "adarsh300");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/adarsh300/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const json = await res.json();
      console.log(json.url);
      setPicture(json.url);
    }
  };

  return (
    <div className="auth-container animate-fadeIn">
      <div className="auth-card">
        <div className="auth-header">
          <h2>
            <i className="fas fa-user-plus me-2"></i> Sign Up
          </h2>
          <p className="auth-subtitle">Create your account to get started</p>
        </div>

        <div className="auth-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="password" className="form-label">
                Picture
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-image"></i>
                </span>
                <input
                  type="file"
                  className="form-control"
                  id="picture"
                  name="picture"
                  accept="image/*"
                  onChange={postPicture}
                  placeholder="Choose your picture"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="profilePic" className="form-label">
                Profile Picture
              </label>
              <div className="profile-pic-upload">
                {profilePicBase64 ? (
                  <div className="profile-pic-preview">
                    <img
                      src={profilePicBase64}
                      alt="Profile Preview"
                      className="preview-image"
                    />
                    <button
                      type="button"
                      className="remove-pic-btn"
                      onClick={() => {
                        setProfilePic(null);
                        setProfilePicBase64("");
                      }}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ) : (
                  <div className="profile-pic-placeholder">
                    <i className="fas fa-user-circle"></i>
                    <p>Add Profile Picture</p>
                    <input
                      type="file"
                      id="profilePic"
                      className="file-input"
                      accept="image/*"
                      onChange={handleProfilePicChange}
                    />
                    <label htmlFor="profilePic" className="upload-btn">
                      <i className="fas fa-camera me-2"></i> Select Image
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-user"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={credentials.name}
                  onChange={onChange}
                  placeholder="Enter your name"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  aria-describedby="emailHelp"
                  name="email"
                  value={credentials.email}
                  onChange={onChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  type="password"
                  className={`form-control ${
                    !passwordMatch ? "is-invalid" : ""
                  }`}
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={onChange}
                  placeholder="Create a password"
                  minLength={5}
                  required
                />
              </div>
              <small className="form-text text-muted">
                Password must be at least 5 characters
              </small>
            </div>

            <div className="mb-4">
              <label htmlFor="cpassword" className="form-label">
                Confirm Password
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-check-circle"></i>
                </span>
                <input
                  type="password"
                  className={`form-control ${
                    !passwordMatch ? "is-invalid" : ""
                  }`}
                  id="cpassword"
                  name="cpassword"
                  value={credentials.cpassword}
                  onChange={onChange}
                  placeholder="Confirm your password"
                  minLength={5}
                  required
                />
              </div>
              {!passwordMatch && (
                <div className="invalid-feedback d-block">
                  Passwords do not match
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-100"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Creating Account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus me-2"></i> Sign Up
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
