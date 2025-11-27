import React, { useState } from 'react';
import '../styles/ImageCarousel.css';

const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return <img src="/IMG/logo-bar-pirata.png" alt="Default" className="carousel-image" />;
  }

  const prev = (e) => { e.stopPropagation(); setCurrentIndex((i) => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setCurrentIndex((i) => (i + 1) % images.length); };

  return (
    <div className="carousel-container">
      <button type="button" aria-label="Anterior" className="carousel-btn prev" onClick={prev}>‹</button>
      <img src={images[currentIndex]} alt={`Image ${currentIndex + 1}`} className="carousel-image" />
      <button type="button" aria-label="Siguiente" className="carousel-btn next" onClick={next}>›</button>
    </div>
  );
};

export default ImageCarousel;
