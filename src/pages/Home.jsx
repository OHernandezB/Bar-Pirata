import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Hero, Events, Contact } from '../components';

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
        subtitle="Cócteles artesanales, buena música y amigos"
        ctaText="Reservar mesa"
        onCtaClick={onReserveClick}
      />
      <Events />
      <Contact />
    </main>
  );
}