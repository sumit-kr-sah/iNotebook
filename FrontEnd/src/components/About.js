import React from "react";
import "./About.css";

function About() {
  return (
    <div className="about-container animate-fadeIn">
      <div className="about-header">
        <h1>About iNoteBook</h1>
        <p className="about-subtitle">Your secure image management solution</p>
      </div>
      
      <div className="about-content">
        <div className="about-card">
          <div className="about-icon">
            <i className="fas fa-image"></i>
          </div>
          <h3>Image Management</h3>
          <p>
            iNoteBook provides a seamless platform for storing and organizing your 
            images. With our user-friendly interface, you can easily upload, view, 
            and manage your entire image collection.
          </p>
        </div>
        
        <div className="about-card">
          <div className="about-icon">
            <i className="fas fa-tag"></i>
          </div>
          <h3>Smart Organization</h3>
          <p>
            Add titles, descriptions, and tags to your images for better organization. 
            Our smart tagging system allows you to quickly find any image in your 
            collection using simple search queries.
          </p>
        </div>
        
        <div className="about-card">
          <div className="about-icon">
            <i className="fas fa-edit"></i>
          </div>
          <h3>Batch Editing</h3>
          <p>
            Save time with our batch editing feature. Select multiple images 
            and apply changes to titles, descriptions, or tags all at once, 
            making image management faster and more efficient.
          </p>
        </div>
        
        <div className="about-card">
          <div className="about-icon">
            <i className="fas fa-lock"></i>
          </div>
          <h3>Secure Storage</h3>
          <p>
            Your images are securely stored with us. With personal user accounts 
            and authentication, your collection remains private and accessible 
            only to you.
          </p>
        </div>
      </div>
      
      <div className="about-footer">
        <h2>Get Started Today</h2>
        <p>
          Create an account and start managing your image collection the smart way. 
          Experience seamless organization and easy access to all your images.
        </p>
        <div className="about-buttons">
          <a href="/signup" className="btn btn-primary">Sign Up Now</a>
          <a href="/login" className="btn btn-outline-primary">Log In</a>
        </div>
      </div>
    </div>
  );
}

export default About;
