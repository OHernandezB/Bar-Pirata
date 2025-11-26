import React from 'react';

export function Hero({
  title = 'Bar Pirata',
  subtitle = 'Cerveza artesanal, tragos, cócteles y buena compañía',
  ctaText = 'Ver menú',
  onCtaClick,
  logoSrc,
  images = defaultImages,
}) {

  return (
    <section className="hero">
      {/* Contenido centrado: logo + título + subtítulo */}
      <div className="hero__content">
        {logoSrc ? (
          <img src={logoSrc} alt={title} className="hero__logo" />
        ) : null}
        <h1 className="hero__title animate-down" aria-label={title}>{title}</h1>
        <p className="hero__subtitle animate-up" aria-label={subtitle || 'Cerveza artesanal, tragos, cócteles y buena compañía'}>
          {subtitle || 'Cerveza artesanal, tragos, cócteles y buena compañía'}
        </p>
        {ctaText && <button className="hero__cta" onClick={onCtaClick}>{ctaText}</button>}
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