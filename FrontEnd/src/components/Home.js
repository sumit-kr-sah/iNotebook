import React from "react";
import ImageGallery from "./ImageGallery";
import "./Home.css";

function Home(props) {
  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Welcome to your Image Gallery</h1>
        <p className="home-subtitle">Organize, edit, and manage your images with ease</p>
      </div>
      
      <div className="home-content">
        <ImageGallery showAlert={props.showAlert} />
      </div>
    </div>
  );
}

export default Home;
