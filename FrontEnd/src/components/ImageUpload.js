import React, { useState, useContext } from 'react';
import './ImageUpload.css';
import ImageContext from '../context/images/imageContext';
import imageCompression from 'browser-image-compression';

const ImageUpload = (props) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageTitle, setImageTitle] = useState('');
  const [imageDescription, setImageDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // Get the addImage function from ImageContext
  const { addImage } = useContext(ImageContext);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };
  
  const handleFiles = (file) => {
    if (file) {
      setSelectedImage(file);
      setOriginalSize(file.size / 1024 / 1024); // Size in MB
      
      // Create a preview URL for the selected image
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const compressImage = async (imageFile) => {
    const options = {
      maxSizeMB: 1, // Max file size in MB
      maxWidthOrHeight: 1920, // Max width/height in pixels
      useWebWorker: true,
      onProgress: (progress) => setUploadProgress(Math.round(progress * 50)) // First 50% is for compression
    };
    
    try {
      const compressedFile = await imageCompression(imageFile, options);
      setCompressedSize(compressedFile.size / 1024 / 1024); // Size in MB
      return compressedFile;
    } catch (error) {
      console.error("Error compressing image:", error);
      throw error;
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const getImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedImage) {
      setIsUploading(true);
      setUploadProgress(0);
      
      try {
        // Step 1: Compress the image
        const compressedImage = await compressImage(selectedImage);
        
        // Step 2: Convert to base64
        const base64String = await convertToBase64(compressedImage);
        
        // Step 3: Get dimensions
        const dimensions = await getImageDimensions(compressedImage);
        
        // Step 4: Upload the image
        // For large files, update progress as we go
        setUploadProgress(50); // Compression is done, now at 50%
        
        try {
          // Prepare metadata
          const metadata = {
            originalSize: originalSize * 1024 * 1024, // Convert MB to bytes
            compressedSize: compressedSize * 1024 * 1024, // Convert MB to bytes
            dimensions
          };
          
          // Use the context function to add the image
          const response = await addImage(
            imageTitle,
            imageDescription,
            base64String,
            selectedImage.type,
            metadata
          );
          
          setUploadProgress(100); // Upload complete
          
          if (response) {
            // Show success message
            props.showAlert("Image uploaded successfully!", "success");
            
            // Clear form
            setSelectedImage(null);
            setPreviewUrl(null);
            setImageTitle('');
            setImageDescription('');
            setUploadProgress(0);
            setOriginalSize(0);
            setCompressedSize(0);
          }
        } catch (error) {
          props.showAlert("Failed to upload image", "danger");
          console.error("Error during upload:", error);
        }
        
        setIsUploading(false);
      } catch (error) {
        console.error("Error preparing image:", error);
        props.showAlert("Failed to process image", "danger");
        setIsUploading(false);
        setUploadProgress(0);
      }
    } else {
      props.showAlert("Please select an image first", "warning");
    }
  };

  return (
    <div className="container">
      <h2 className="screen-title mb-4">Select Image</h2>
      <div className="upload-container animate-slideIn">
        <div className="row">
          <div className="col-md-7">
            <div className="upload-area">
              <div 
                className={`drag-drop-area ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="drag-drop-content">
                  <i className="fas fa-cloud-upload-alt"></i>
                  <p>Drag & Drop your image here or</p>
                  <button className="btn btn-primary browse-btn" onClick={() => document.getElementById('imageUpload').click()}>
                    Browse Files
                  </button>
                  <input 
                    type="file" 
                    id="imageUpload" 
                    className="file-input" 
                    accept="image/*" 
                    onChange={handleImageChange}
                  />
                </div>
              </div>
              
              <div className="mb-3 mt-4">
                <label htmlFor="imageTitle" className="form-label">Image Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="imageTitle" 
                  value={imageTitle} 
                  onChange={(e) => setImageTitle(e.target.value)}
                  placeholder="Enter a title for your image"
                  required
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="imageDescription" className="form-label">Description</label>
                <textarea 
                  className="form-control" 
                  id="imageDescription"
                  rows="4" 
                  value={imageDescription} 
                  onChange={(e) => setImageDescription(e.target.value)}
                  placeholder="Add description and tags with #hashtag"
                ></textarea>
                <small className="form-text text-muted">Add tags with # symbol (e.g. #nature #travel)</small>
              </div>
              
              <button 
                type="button" 
                className="btn btn-primary w-100 mt-4 upload-btn"
                onClick={handleSubmit}
                disabled={!selectedImage || isUploading}
              >
                <i className="fas fa-cloud-upload-alt me-2"></i>
                {isUploading ? 'Uploading...' : 'Upload Image'}
              </button>
              
              {isUploading && (
                <div className="upload-progress mt-3">
                  <div className="progress">
                    <div 
                      className="progress-bar" 
                      role="progressbar" 
                      style={{ width: `${uploadProgress}%` }} 
                      aria-valuenow={uploadProgress} 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    ></div>
                  </div>
                  <small className="text-muted d-block text-center mt-2">
                    {uploadProgress < 50 ? 'Compressing image...' : 'Uploading to server...'}
                  </small>
                </div>
              )}
            </div>
          </div>
          
          <div className="col-md-5">
            <div className="preview-section">
              <h4 className="mb-3">Preview</h4>
              <div className="preview-container">
                {previewUrl ? (
                  <div className="image-preview">
                    <img src={previewUrl} alt="Preview" className="preview-image" />
                    {(imageTitle || imageDescription) && (
                      <div className="preview-overlay">
                        {imageTitle && <h5 className="preview-title">{imageTitle}</h5>}
                        {imageDescription && <p className="preview-description">{imageDescription}</p>}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-preview">
                    <i className="far fa-image"></i>
                    <p>Preview will appear here</p>
                  </div>
                )}
              </div>
              
              {selectedImage && (
                <div className="file-info mt-3">
                  <div className="file-name">
                    <span className="file-label">File:</span>
                    <span className="file-value">{selectedImage.name}</span>
                  </div>
                  <div className="file-size">
                    <span className="file-label">Size:</span>
                    <span className="file-value">
                      {originalSize.toFixed(2)} MB
                      {compressedSize > 0 && (
                        <span className="compress-info">
                          <i className="fas fa-arrow-right mx-1"></i>
                          {compressedSize.toFixed(2)} MB
                          <span className="savings">
                            ({Math.round((1 - compressedSize / originalSize) * 100)}% saved)
                          </span>
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload; 