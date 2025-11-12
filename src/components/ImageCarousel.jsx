import React, { useState } from 'react';
import '../styles/ImageCarousel.css';

const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return <img src="/IMG/logo-bar-pirata.png" alt="Default" className="carousel-image" />;
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  return (
    <div className="carousel-container" onClick={handleNext}>
      <img src={images[currentIndex]} alt={`Image ${currentIndex + 1}`} className="carousel-image" />
    </div>
  );
};

export default ImageCarousel;