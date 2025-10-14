import { useState } from 'react';

export function Events({ events = defaultEvents }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <section id="eventos" className="events">
      <h2>Eventos</h2>
      <ul className="events__list">
        {events.map((ev) => (
          <li key={ev.id} className="event">
            <div className="event__header">
              <h3>{ev.title}</h3>
              <span className="event__date">{ev.date}</span>
            </div>
            <p className="event__summary">{ev.summary}</p>
            {expandedId === ev.id && <p className="event__details">{ev.details}</p>}
            <button onClick={() => setExpandedId(expandedId === ev.id ? null : ev.id)}>
              {expandedId === ev.id ? 'Ver menos' : 'Ver más'}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

const defaultEvents = [
  { id: 1, title: 'Noche de jazz', date: 'Viernes 21:00', summary: 'Música en vivo con banda local.', details: 'Reserva anticipada recomendada. Entrada libre.' },
  { id: 2, title: 'Trivia y cervezas', date: 'Miércoles 19:00', summary: 'Premios para el equipo ganador.', details: 'Inscripción en el local desde las 18:00.' },
];