import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

export function Tables({ tables = defaultTables }) {
  const cart = useCart();
  const navigate = useNavigate();
  const [queryTime, setQueryTime] = useState('');
  const now = new Date();

  const computed = useMemo(() => {
    const ref = queryTime ? timeToDate(queryTime, now) : now;
    return tables.map((t) => {
      const ranges = t.bookings.map((b) => normalizeRange(b.start, b.end, ref));
      const active = ranges.find((r) => isWithin(ref, r));
      const next = ranges
        .filter((r) => r.start > ref)
        .sort((a, b) => a.start - b.start)[0] || null;
      return { ...t, active, next };
    });
  }, [tables, queryTime, now]);

  return (
    <section id="mesas" className="tables">
      <h2>Disponibilidad de mesas</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <label>Consultar a las:</label>
        <input type="time" value={queryTime} onChange={(e) => setQueryTime(e.target.value)} />
      </div>
      <ul className="tables__grid">
        {computed.map((t) => (
          <li key={t.id} className="table-card">
            <div className="table-card__header">
              <h3>{t.name} <span className="table-card__cap">({t.capacity}p)</span></h3>
              <span className={`table-card__status ${t.active ? 'is-occupied' : 'is-free'}`}>
                {t.active ? `Ocupada ${formatRange(t.active)}` : (queryTime ? 'Libre a esa hora' : 'Libre ahora')}
              </span>
            </div>
            <div className="table-card__details">
              {t.active ? (
                <span className="table-card__label">Usada en</span>
              ) : (
                <span className="table-card__label">Próxima</span>
              )}
              <span className="table-card__next">{t.active ? formatRange(t.active) : t.next ? formatRange(t.next) : 'Sin reservas próximas'}</span>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <button
                className="btn"
                onClick={() => {
                  const selectedTime = queryTime || '';
                  cart?.setReservation?.({ ...(cart?.reservation || {}), table: t.id, time: selectedTime });
                  // Si no estamos ya en /reservas, navegamos.
                  try { navigate('/reservas'); } catch {}
                }}
                disabled={Boolean(t.active)}
              >
                Elegir mesa
              </button>
            </div>
            {t.bookings?.length > 0 && (
              <div className="table-card__schedule">
                <span className="table-card__label">Horarios de hoy:</span>
                <span>
                  {t.bookings.map((b, idx) => (
                    <span key={idx} className="table-card__slot">
                      {b.start}–{b.end}{idx < t.bookings.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function normalizeRange(startStr, endStr, refDate) {
  const start = new Date(refDate);
  const [sh, sm] = startStr.split(':').map(Number);
  start.setHours(sh, sm, 0, 0);

  const end = new Date(refDate);
  const [eh, em] = endStr.split(':').map(Number);
  end.setHours(eh, em, 0, 0);

  // Si el cierre es menor que la apertura, cruza medianoche
  if (end < start) {
    end.setDate(end.getDate() + 1);
  }
  return { start, end };
}

function isWithin(now, range) {
  return now >= range.start && now <= range.end;
}

function timeToDate(timeStr, baseDate) {
  const d = new Date(baseDate);
  const [h, m] = timeStr.split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d;
}

function formatRange(range) {
  const sh = String(range.start.getHours()).padStart(2, '0');
  const sm = String(range.start.getMinutes()).padStart(2, '0');
  const eh = String(range.end.getHours()).padStart(2, '0');
  const em = String(range.end.getMinutes()).padStart(2, '0');
  return `${sh}:${sm}–${eh}:${em}`;
}

export const defaultTables = [
  {
    id: 1,
    name: 'Mesa 1',
    capacity: 4,
    bookings: [
      { start: '21:00', end: '22:30' },
      { start: '23:45', end: '00:30' }, // cruza medianoche
    ],
  },
  {
    id: 2,
    name: 'Mesa 2',
    capacity: 2,
    bookings: [
      { start: '20:00', end: '21:00' },
      { start: '22:00', end: '23:00' },
    ],
  },
  {
    id: 3,
    name: 'Mesa 3',
    capacity: 6,
    bookings: [], // libre toda la noche
  },
  {
    id: 4,
    name: 'Mesa 4',
    capacity: 4,
    bookings: [
      { start: '19:30', end: '20:15' },
    ],
  },
  {
    id: 5,
    name: 'Mesa 5',
    capacity: 2,
    bookings: [
      { start: '21:15', end: '22:00' },
    ],
  },
  {
    id: 6,
    name: 'Mesa 6',
    capacity: 6,
    bookings: [],
  },
  {
    id: 7,
    name: 'Mesa 7',
    capacity: 4,
    bookings: [
      { start: '00:30', end: '01:15' },
    ],
  },
  {
    id: 8,
    name: 'Mesa 8',
    capacity: 2,
    bookings: [
      { start: '23:00', end: '23:30' },
    ],
  },
  {
    id: 9,
    name: 'Mesa 9',
    capacity: 6,
    bookings: [],
  },
  {
    id: 10,
    name: 'Mesa 10',
    capacity: 4,
    bookings: [
      { start: '20:00', end: '21:45' },
    ],
  },
];