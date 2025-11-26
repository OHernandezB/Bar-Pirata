import { useEffect, useRef, useState } from 'react';

function getEventMeta(title = '') {
  const t = String(title).toLowerCase();
  if (t.includes('música en vivo')) return { variantClass: 'event--amber', emoji: '🎸' };
  if (t.includes('happy hour')) return { variantClass: 'event--green', emoji: '🍹' };
  if (t.includes('noche de jazz')) return { variantClass: 'event--violet', emoji: '🎷' };
  if (t.includes('trivia') || t.includes('cervezas')) return { variantClass: 'event--gold', emoji: '🍺' };
  return { variantClass: '', emoji: '' };
}

export function Events({ events = defaultEvents }) {
  const [expandedId, setExpandedId] = useState(null);
  const [visibleIds, setVisibleIds] = useState(() => new Set());
  const itemRefs = useRef({});

  const registerRef = (id, el) => {
    if (!id) return;
    itemRefs.current[id] = el;
  };

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        setVisibleIds((prev) => {
          const next = new Set(prev);
          entries.forEach((e) => {
            const idAttr = e.target.getAttribute('data-id');
            const id = idAttr ? Number(idAttr) : null;
            if (!id) return;
            if (e.isIntersecting) next.add(id);
          });
          return next;
        });
      },
      { root: null, rootMargin: '0px', threshold: 0.15 }
    );

    Object.entries(itemRefs.current).forEach(([, el]) => {
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [events]);

  return (
    <section id="eventos" className="events">
      <h2>Eventos</h2>
      <ul className="events__list">
        {events.map((ev) => {
          const { variantClass, emoji } = getEventMeta(ev.title);
          const isVisible = visibleIds.has(ev.id);
          const hasEmoji = Boolean(emoji);
          const baseTitle = hasEmoji ? String(ev.title).replace(emoji, '').trim() : ev.title;
          return (
            <li
              key={ev.id}
              className={`event ${variantClass} ${isVisible ? 'is-visible' : ''}`}
              data-id={ev.id}
              ref={(el) => registerRef(ev.id, el)}
            >
              <div className="event__header">
                <div className="event__titlegroup">
                  {hasEmoji && <span className="event__icon" aria-hidden="true">{emoji}</span>}
                  <h3 className="event__title">{baseTitle}</h3>
                </div>
              </div>
              <p className="event__summary">{ev.summary}</p>
              {expandedId === ev.id && <p className="event__details">{ev.details}</p>}
              <div className="event__actions">
                <button className="event__button" onClick={() => setExpandedId(expandedId === ev.id ? null : ev.id)}>
                  {expandedId === ev.id ? 'Ver menos' : 'Ver más'}
                </button>
                <span className="event__date">{ev.date}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const defaultEvents = [
  { id: 100, title: '🎸 Música en vivo', date: 'Cada Viernes y Sabado', summary: 'Bandas y artistas en vivo.', details: 'Consulta programación en nuestras redes.' },
  { id: 101, title: '🍹 Happy Hour', date: 'Cada dia 6-8 pm', summary: 'Promociones en cócteles y cervezas artesanales.', details: 'Válido en barra y mesas.' },
  { id: 1, title: '🎷 Noche de jazz', date: 'Cada Sabado 21:00', summary: 'Música en vivo con banda local.', details: 'Reserva anticipada recomendada. Entrada libre.' },
  { id: 2, title: '🍺 Trivia y cervezas', date: 'Miércoles 19:00', summary: 'Premios para el equipo ganador.', details: 'Inscripción en el local desde las 18:00.' },
];