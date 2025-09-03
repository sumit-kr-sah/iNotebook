import React from 'react';
import ImageUpload from './ImageUpload';
import ImageGallery from './ImageGallery';

const Images = (props) => {
  return (
    <div className="container">
      <ImageUpload showAlert={props.showAlert} />
      <hr className="my-5" />
      <ImageGallery showAlert={props.showAlert} />
    </div>
  );
};

export default Images; 