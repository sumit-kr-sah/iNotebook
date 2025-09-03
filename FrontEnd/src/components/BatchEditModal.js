import React, { useState, useContext } from 'react';
import ImageContext from '../context/images/imageContext';
import './BatchEditModal.css';

const BatchEditModal = ({ selectedImages, onClose, showAlert, refreshGallery }) => {
  const { images, updateImage } = useContext(ImageContext);
  const [tag, setTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addTagMode, setAddTagMode] = useState(true); // true for add, false for replace
  const [progress, setProgress] = useState(0);

  // Get selected images data
  const selectedImagesData = images.filter(img => selectedImages.includes(img._id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!tag.trim()) {
      showAlert("Please enter a tag to add", "warning");
      return;
    }
    
    setIsLoading(true);
    let successCount = 0;
    let errorCount = 0;
    
    // Process each image
    for (let i = 0; i < selectedImagesData.length; i++) {
      const img = selectedImagesData[i];
      try {
        let newDescription;
        
        if (addTagMode) {
          // Add tag mode
          newDescription = img.description 
            ? `${img.description} #${tag}` 
            : `#${tag}`;
        } else {
          // Replace tags mode
          // First remove any existing tags
          const descWithoutTags = img.description 
            ? img.description.replace(/#\w+/g, '').trim() 
            : '';
          
          // Then add the new tag
          newDescription = descWithoutTags 
            ? `${descWithoutTags} #${tag}` 
            : `#${tag}`;
        }
        
        // Update the image
        await updateImage(img._id, img.title, newDescription);
        successCount++;
      } catch (error) {
        console.error(`Error updating image ${img._id}:`, error);
        errorCount++;
      }
      
      // Update progress
      setProgress(Math.round(((i + 1) / selectedImagesData.length) * 100));
    }
    
    // Show results
    if (errorCount === 0) {
      showAlert(`Successfully updated ${successCount} images`, "success");
    } else {
      showAlert(`Updated ${successCount} images, failed to update ${errorCount} images`, "warning");
    }
    
    setIsLoading(false);
    onClose();
    refreshGallery();
  };

  return (
    <div className="batch-edit-modal">
      <div className="batch-edit-content">
        <div className="batch-edit-header">
          <h4>Batch Edit {selectedImages.length} Images</h4>
          <button 
            type="button" 
            className="btn-close" 
            aria-label="Close"
            onClick={onClose}
            disabled={isLoading}
          ></button>
        </div>
        
        <div className="batch-edit-body">
          <p>
            {selectedImagesData.length > 0 
              ? `Selected ${selectedImagesData.length} image${selectedImagesData.length > 1 ? 's' : ''}`
              : 'No images selected'}
          </p>
          
          <div className="image-thumbnails mb-3">
            {selectedImagesData.slice(0, 5).map(img => (
              <div key={img._id} className="thumbnail">
                <img 
                  src={img.imageData} 
                  alt={img.title} 
                  className="img-thumbnail" 
                />
              </div>
            ))}
            {selectedImagesData.length > 5 && (
              <div className="thumbnail more-badge">
                +{selectedImagesData.length - 5} more
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <div className="btn-group w-100 mb-3" role="group">
                <input 
                  type="radio" 
                  className="btn-check" 
                  name="tagMode" 
                  id="addTagMode" 
                  checked={addTagMode} 
                  onChange={() => setAddTagMode(true)}
                />
                <label className="btn btn-outline-primary" htmlFor="addTagMode">
                  Add Tag
                </label>
                
                <input 
                  type="radio" 
                  className="btn-check" 
                  name="tagMode" 
                  id="replaceTagMode" 
                  checked={!addTagMode} 
                  onChange={() => setAddTagMode(false)}
                />
                <label className="btn btn-outline-primary" htmlFor="replaceTagMode">
                  Replace All Tags
                </label>
              </div>
              
              <label htmlFor="tagInput" className="form-label">
                {addTagMode ? 'Add Tag to Images' : 'Replace Tags with'}
              </label>
              <div className="input-group">
                <span className="input-group-text">#</span>
                <input 
                  type="text" 
                  className="form-control" 
                  id="tagInput" 
                  placeholder="Enter tag (without #)" 
                  value={tag}
                  onChange={(e) => setTag(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  disabled={isLoading}
                />
              </div>
              <small className="form-text text-muted">
                {addTagMode 
                  ? 'This will add the tag to each selected image\'s description' 
                  : 'This will remove all existing tags and add this new tag'}
              </small>
            </div>
            
            {isLoading && (
              <div className="progress mb-3">
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ width: `${progress}%` }} 
                  aria-valuenow={progress} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                >
                  {progress}%
                </div>
              </div>
            )}
            
            <div className="d-flex justify-content-end">
              <button 
                type="button" 
                className="btn btn-secondary me-2" 
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isLoading || !tag.trim()}
              >
                {isLoading ? 'Processing...' : 'Apply to All'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BatchEditModal; 