import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageContext from '../context/images/imageContext';
import ImageItem from './ImageItem';
import BatchEditModal from './BatchEditModal';
import './ImageGallery.css';

const ImageGallery = (props) => {
  const { images, getImages, loading } = useContext(ImageContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showBatchEdit, setShowBatchEdit] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectMode, setSelectMode] = useState(false);

  // Function to fetch images
  const fetchImages = async (loadImageData = false) => {
    if (localStorage.getItem('authtoken')) {
      setIsLoading(true);
      // If loadImageData is true, we'll fetch full image data instead of just metadata
      await getImages(!loadImageData); // passing false means include image data
      setIsLoading(false);
    } else {
      navigate('/login');
    }
  };

  // Load images when component mounts
  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line
  }, []);

  // Function to refresh the gallery
  const refreshGallery = () => {
    fetchImages(false);
    // Reset selection mode when refreshing
    setSelectMode(false);
    setSelectedImages([]);
  };

  // Toggle select mode for batch editing
  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    if (selectMode) {
      // If turning off select mode, clear selections
      setSelectedImages([]);
    }
  };

  // Toggle selection of an image
  const toggleImageSelection = (imageId) => {
    if (selectedImages.includes(imageId)) {
      setSelectedImages(selectedImages.filter(id => id !== imageId));
    } else {
      setSelectedImages([...selectedImages, imageId]);
    }
  };

  // Close the batch edit modal
  const closeBatchEdit = () => {
    setShowBatchEdit(false);
  };

  // Open the batch edit modal
  const openBatchEdit = () => {
    if (selectedImages.length > 0) {
      setShowBatchEdit(true);
    } else {
      props.showAlert("Please select at least one image", "warning");
    }
  };

  return (
    <div className="image-gallery animate-slideIn">
      <div className="gallery-header">
        <div className="gallery-title">
          <h2><i className="fas fa-images me-2"></i>Your Gallery</h2>
          <p className="gallery-subtitle">Manage and organize your image collection</p>
        </div>
        <div className="gallery-actions">
          {isLoading && 
            <div className="spinner-border text-primary spinner-sm me-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          }
          <div className="btn-group">
            <button 
              className="btn btn-sm btn-outline-primary gallery-btn"
              onClick={refreshGallery}
              disabled={isLoading}
              title="Refresh gallery"
            >
              <i className="fas fa-sync-alt me-1"></i> Refresh
            </button>
            <button 
              className={`btn btn-sm gallery-btn ${selectMode ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={toggleSelectMode}
              disabled={isLoading || images.length === 0}
              title={selectMode ? 'Cancel selection' : 'Select multiple images'}
            >
              <i className={`fas ${selectMode ? 'fa-times' : 'fa-check-square'} me-1`}></i> 
              {selectMode ? 'Cancel' : 'Select'}
            </button>
            {selectMode && (
              <button 
                className="btn btn-sm btn-outline-primary gallery-btn"
                onClick={openBatchEdit}
                disabled={selectedImages.length === 0}
                title="Edit selected images"
              >
                <i className="fas fa-edit me-1"></i> Edit <span className="badge bg-primary ms-1">{selectedImages.length}</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {!isLoading && images.length === 0 && (
        <div className="empty-gallery">
          <div className="empty-gallery-content">
            <i className="fas fa-images empty-icon"></i>
            <h3>No images yet</h3>
            <p>Upload your first image to get started</p>
          </div>
        </div>
      )}
      
      <div className="gallery-grid">
        {images.map((image) => (
          <div key={image._id} className={`gallery-item-wrapper ${selectMode ? 'selectable' : ''}`}>
            {selectMode && (
              <div className="selection-overlay">
                <div className="form-check">
                  <input 
                    type="checkbox" 
                    className="form-check-input selection-checkbox" 
                    checked={selectedImages.includes(image._id)}
                    onChange={() => toggleImageSelection(image._id)}
                    id={`select-${image._id}`}
                  />
                  <label className="form-check-label" htmlFor={`select-${image._id}`}>
                    Select
                  </label>
                </div>
              </div>
            )}
            <ImageItem 
              image={image} 
              showAlert={props.showAlert} 
              selectMode={selectMode}
            />
          </div>
        ))}
      </div>
      
      {/* Batch Edit Modal */}
      {showBatchEdit && (
        <BatchEditModal 
          selectedImages={selectedImages}
          onClose={closeBatchEdit}
          showAlert={props.showAlert}
          refreshGallery={refreshGallery}
        />
      )}
    </div>
  );
};

export default ImageGallery; 