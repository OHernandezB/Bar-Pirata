import { useState } from 'react';

export function Gallery({ images = defaultImages }) {
  const [selected, setSelected] = useState(null);

  return (
    <section className="gallery">
      <h2>Galería</h2>
      <div className="gallery__grid">
        {images.map((src, i) => (
          <button key={i} className="gallery__item" onClick={() => setSelected(src)}>
            <img src={src} alt={`Foto ${i + 1}`} loading="lazy" />
          </button>
        ))}
      </div>
      {selected && (
        <div className="gallery__modal" role="dialog" aria-modal="true">
          <button className="gallery__close" aria-label="Cerrar" onClick={() => setSelected(null)}>✕</button>
          <img src={selected} alt="Foto ampliada" />
        </div>
      )}
    </section>
  );
}

const defaultImages = [
  'https://picsum.photos/seed/bar1/600/400',
  'https://picsum.photos/seed/bar2/600/400',
  'https://picsum.photos/seed/bar3/600/400',
  'https://picsum.photos/seed/bar4/600/400',
];