import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Hero, Events } from '../components';

export default function Home({ onReserveClick }) {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash?.replace('#', '');
    if (hash) {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.hash]);

  return (
    <main id="inicio">
      <Hero
        title="Bar Pirata"
        logoSrc="/IMG/logo-bar-pirata.png"
        subtitle="Cerveza artesanal, tragos, cócteles y buena compañía"
        ctaText=""
        images={[
          '/IMG/1.jpg',
          '/IMG/2.jpg',
          '/IMG/3.jpg',
          '/IMG/4.jpg',
          '/IMG/5.jpg',
        ]}
        onCtaClick={onReserveClick}
      />
      <Events />
    </main>
  );
}
