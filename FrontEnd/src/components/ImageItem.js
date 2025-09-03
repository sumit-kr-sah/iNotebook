import React, { useContext, useState, useEffect } from 'react';
import ImageContext from '../context/images/imageContext';
import './ImageItem.css';

const ImageItem = (props) => {
  const { image, selectMode } = props;
  const { deleteImage, getImageById, updateImage } = useContext(ImageContext);
  const [fullImage, setFullImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  // Load image data if not already loaded - now automatically loads on mount if needed
  const loadFullImageData = async () => {
    if (!image.imageData && !isLoading && !fullImage) {
      setIsLoading(true);
      try {
        const fetchedImage = await getImageById(image._id);
        if (fetchedImage && fetchedImage.imageData) {
          setFullImage(fetchedImage);
        }
      } catch (error) {
        console.error("Error loading image data:", error);
      }
      setIsLoading(false);
    }
  };

  // When component mounts, check if we need to fetch image data
  useEffect(() => {
    if (image.imageData) {
      setFullImage(image);
    } else {
      // Automatically load image data when component mounts if not available
      loadFullImageData();
    }
    
    // Set initial edit values
    setEditedTitle(image.title);
    setEditedDescription(image.description || '');
  }, [image]);

  const handleDelete = () => {
    deleteImage(image._id);
    props.showAlert("Image deleted successfully", "success");
  };

  const toggleExpand = () => {
    // Don't open if in select mode
    if (selectMode) return;
    setIsExpanded(!isExpanded);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original values
    setEditedTitle(image.title);
    setEditedDescription(image.description || '');
  };

  const handleSaveEdit = async () => {
    try {
      await updateImage(image._id, editedTitle, editedDescription);
      setIsEditing(false);
      props.showAlert("Image updated successfully", "success");
    } catch (error) {
      props.showAlert("Failed to update image", "danger");
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
  };

  const closeFullscreen = (e) => {
    e.stopPropagation();
    setIsExpanded(false);
  };

  // Extract tags from description
  const extractTags = (description) => {
    if (!description) return [];
    const tags = description.match(/#\w+/g);
    return tags || [];
  };

  const tags = extractTags(image.description);

  return (
    <>
      <div className="image-card">
        <div className="card h-100">
          <div className="card-image-container">
            {isLoading ? (
              <div className="image-loading-placeholder">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <img 
                src={(fullImage || image).imageData || 'https://via.placeholder.com/300x200?text=Loading+Image'} 
                className="card-img-top" 
                alt={image.title}
                onClick={toggleExpand}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error';
                }}
              />
            )}
            <div className="image-overlay">
              <div className="image-actions">
                <button 
                  className="icon-action" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                  title="Edit image"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button 
                  className="icon-action" 
                  onClick={toggleExpand}
                  title="View full screen"
                >
                  <i className="fas fa-expand"></i>
                </button>
                <button 
                  className="icon-action delete-action" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  title="Delete image"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          </div>
          <div className="card-body">
            {isEditing ? (
              <div className="edit-form">
                <div className="mb-3">
                  <label htmlFor={`title-${image._id}`} className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    id={`title-${image._id}`}
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor={`description-${image._id}`} className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id={`description-${image._id}`}
                    rows="3"
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    placeholder="Add description and tags with #hashtag"
                  ></textarea>
                  <small className="form-text text-muted">
                    Add tags with # symbol (e.g. #nature #travel)
                  </small>
                </div>
                <div className="d-flex justify-content-end">
                  <button className="btn btn-outline-secondary btn-sm me-2" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={handleSaveEdit}>
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h5 className="card-title">{image.title}</h5>
                
                {image.description && (
                  <p className="card-description">
                    {image.description.replace(/#\w+/g, '')}
                  </p>
                )}
                
                {tags.length > 0 && (
                  <div className="image-tags">
                    {tags.map((tag, index) => (
                      <span key={index} className="tag-badge">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="image-metadata">
                  {image.originalSize > 0 && (
                    <span className="metadata-item">
                      <i className="fas fa-file-alt me-1"></i>
                      {image.compressedSize > 0 
                        ? `${formatFileSize(image.originalSize)} → ${formatFileSize(image.compressedSize)}` 
                        : formatFileSize(image.originalSize)}
                    </span>
                  )}
                  
                  <span className="metadata-item">
                    <i className="far fa-calendar-alt me-1"></i>
                    {new Date(image.date).toLocaleDateString()}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Full-screen image modal */}
      {isExpanded && (fullImage || image).imageData && (
        <div className="fullscreen-image-container" onClick={closeFullscreen}>
          <div className="fullscreen-image-content" onClick={(e) => e.stopPropagation()}>
            <div className="fullscreen-header">
              <h4>{image.title}</h4>
              <div className="fullscreen-actions">
                <button 
                  className="fullscreen-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                    setIsEditing(true);
                  }}
                  title="Edit image"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button 
                  className="fullscreen-action-btn"
                  onClick={closeFullscreen}
                  title="Close"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <img 
              src={(fullImage || image).imageData} 
              className="fullscreen-image" 
              alt={image.title}
            />
            
            <div className="fullscreen-footer">
              {image.description && <p>{image.description}</p>}
              
              {tags.length > 0 && (
                <div className="fullscreen-tags">
                  {tags.map((tag, index) => (
                    <span key={index} className="tag-badge">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="fullscreen-metadata">
                {image.originalSize > 0 && (
                  <span className="metadata-item">
                    <i className="fas fa-file-alt me-1"></i>
                    {formatFileSize(image.originalSize)}
                  </span>
                )}
                
                <span className="metadata-item">
                  <i className="far fa-calendar-alt me-1"></i>
                  {new Date(image.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageItem; 