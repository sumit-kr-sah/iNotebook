import { useState } from "react";
import ImageContext from "./imageContext";

const ImageState = (props) => {
  const host = "http://localhost:5000";
  const imagesList = [];
  const [images, setImages] = useState(imagesList);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageCache, setImageCache] = useState({});

  // Get all Images (with option to exclude image data for faster loading)
  const getImages = async (excludeImageData = true) => {
    setLoading(true);
    // API call
    try {
      const response = await fetch(`${host}/api/images/fetchallimages?excludeImageData=${excludeImageData}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("authtoken"),
        },
      });
      const json = await response.json();
      
      // If we already have image data in cache, merge it with the new data
      if (excludeImageData && Object.keys(imageCache).length > 0) {
        const mergedImages = json.map(img => {
          // If we have this image in cache with image data, use it
          if (imageCache[img._id] && imageCache[img._id].imageData) {
            return {
              ...img,
              imageData: imageCache[img._id].imageData
            };
          }
          return img;
        });
        setImages(mergedImages);
      } else {
        // Update cache if we're getting full image data
        if (!excludeImageData) {
          const newCache = {};
          json.forEach(img => {
            if (img.imageData) {
              newCache[img._id] = {
                _id: img._id,
                imageData: img.imageData
              };
            }
          });
          setImageCache(newCache);
        }
        
        // Set images state
        setImages(json);
      }
      
      setLoading(false);
      return json;
    } catch (error) {
      console.error("Error fetching images:", error);
      setLoading(false);
      return [];
    }
  };

  // Get single image by ID (with full image data)
  const getImageById = async (id) => {
    // First check if we have it in cache
    if (imageCache[id] && imageCache[id].imageData) {
      // If in cache, don't need to fetch again
      const cachedImage = imageCache[id];
      
      // Find the full image info and merge with cached data
      const fullImage = images.find(img => img._id === id);
      if (fullImage) {
        const mergedImage = {
          ...fullImage,
          imageData: cachedImage.imageData
        };
        setSelectedImage(mergedImage);
        return mergedImage;
      }
    }
    
    // Not in cache, need to fetch
    setLoading(true);
    try {
      const response = await fetch(`${host}/api/images/image/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("authtoken"),
        },
      });
      const json = await response.json();
      
      // Add to cache
      setImageCache(prevCache => ({
        ...prevCache,
        [id]: {
          _id: id,
          imageData: json.imageData
        }
      }));
      
      setSelectedImage(json);
      setLoading(false);
      return json;
    } catch (error) {
      console.error("Error fetching image:", error);
      setLoading(false);
      return null;
    }
  };

  // Add new Image
  const addImage = async (title, description, imageData, imageType, metadata = {}) => {
    setLoading(true);
    // API call
    try {
      const response = await fetch(`${host}/api/images/addimage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("authtoken"),
        },
        body: JSON.stringify({ 
          title, 
          description, 
          imageData, 
          imageType,
          originalSize: metadata.originalSize,
          compressedSize: metadata.compressedSize,
          dimensions: metadata.dimensions
        }),
      });
      const json = await response.json();
      
      // Add the full image data to the response for immediate display
      const imageWithData = {
        ...json,
        imageData
      };
      
      // Add to cache
      setImageCache(prevCache => ({
        ...prevCache,
        [json._id]: {
          _id: json._id,
          imageData
        }
      }));
      
      // Update state with the new image
      setImages(images.concat(imageWithData));
      setLoading(false);
      return json;
    } catch (error) {
      console.error("Error adding image:", error);
      setLoading(false);
      throw error;
    }
  };

  // Delete an Image
  const deleteImage = async (id) => {
    setLoading(true);
    // API call
    try {
      const response = await fetch(`${host}/api/images/deleteimage/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("authtoken"),
        },
      });
      
      // Remove from cache
      setImageCache(prevCache => {
        const newCache = {...prevCache};
        delete newCache[id];
        return newCache;
      });
      
      // Update state by removing the deleted image
      const newImages = images.filter((image) => {
        return image._id !== id;
      });
      setImages(newImages);
      setLoading(false);
    } catch (error) {
      console.error("Error deleting image:", error);
      setLoading(false);
    }
  };

  // Update an Image
  const updateImage = async (id, title, description) => {
    setLoading(true);
    // API call
    try {
      const response = await fetch(`${host}/api/images/updateimage/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("authtoken"),
        },
        body: JSON.stringify({ title, description }),
      });
      
      const json = await response.json();
      
      // Update the state
      let newImages = JSON.parse(JSON.stringify(images));
      for (let index = 0; index < images.length; index++) {
        const element = newImages[index];
        if (element._id === id) {
          newImages[index].title = title;
          newImages[index].description = description;
          break;
        }
      }
      setImages(newImages);
      
      // Also update selectedImage if this is the currently selected image
      if (selectedImage && selectedImage._id === id) {
        setSelectedImage({
          ...selectedImage,
          title,
          description
        });
      }
      
      setLoading(false);
      return json;
    } catch (error) {
      console.error("Error updating image:", error);
      setLoading(false);
      throw error;
    }
  };

  // Clear cache (for logout)
  const clearImageCache = () => {
    setImageCache({});
    setImages([]);
    setSelectedImage(null);
  };

  return (
    <ImageContext.Provider
      value={{ 
        images, 
        selectedImage,
        loading,
        getImages, 
        getImageById,
        addImage, 
        deleteImage, 
        updateImage,
        clearImageCache
      }}
    >
      {props.children}
    </ImageContext.Provider>
  );
};

export default ImageState; 