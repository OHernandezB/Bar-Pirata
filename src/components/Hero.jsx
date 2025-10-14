import { useEffect, useState } from 'react';

export function Hero({
  title = 'Bar Pirata',
  subtitle = 'Cócteles artesanales, buena música y amigos',
  ctaText = 'Reservar mesa',
  onCtaClick,
  images = defaultImages,
  intervalMs = 5000,
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), intervalMs);
    return () => clearInterval(id);
  }, [images.length, intervalMs]);

  return (
    <section className="hero">
      <div className="hero__bg">
        {images.map((src, i) => (
          <div
            key={src}
            className={`hero__slide ${i === index ? 'is-active' : ''}`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
      </div>
      <div className="hero__overlay" />

      <div className="hero__content">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <button className="hero__cta" onClick={onCtaClick}>{ctaText}</button>
      </div>
    </section>
  );
}

const defaultImages = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1461988091159-20e9c1cd1fd1?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1514361892635-6df3d7bd1b43?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1485217988980-11786ced9454?auto=format&fit=crop&w=1600&q=80',
];