import { useMemo } from 'react';

export function OpeningHours({ hours = defaultHours, compact = false }) {
  const now = new Date();
  const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  const status = useMemo(() => {
    const entry = hours[day];
    if (!entry || entry.closed) return { open: false, label: 'Cerrado hoy' };
    const [openH, openM] = entry.open.split(':').map(Number);
    const [closeH, closeM] = entry.close.split(':').map(Number);
    const openTime = new Date(now); openTime.setHours(openH, openM, 0, 0);
    const closeTime = new Date(now);
    // Manejo de rango que cruza medianoche: si cierre es menor que apertura, sumamos un día
    const crossesMidnight = closeH < openH || (closeH === openH && closeM < openM);
    if (crossesMidnight) {
      closeTime.setDate(closeTime.getDate() + 1);
    }
    closeTime.setHours(closeH, closeM, 0, 0);
    const open = now >= openTime && now <= closeTime;
    return { open, label: `${entry.open}–${entry.close}` };
  }, [hours, day, now]);

  if (compact) {
    return (
      <section className="opening-hours">
        <h2>Horarios</h2>
        <ul>
          <li>
            <span className="day">Lunes – Jueves</span>
            <span className="time">11:30 pm – 3:00 am</span>
          </li>
          <li>
            <span className="day">Viernes – Sábado</span>
            <span className="time">11:30 pm – 6:00 am</span>
          </li>
          <li>
            <span className="day">Domingo</span>
            <span className="time">Cerrado</span>
          </li>
        </ul>
      </section>
    );
  }

  return (
    <section className="opening-hours">
      <h2>Horarios</h2>
      <ul>
        {Object.entries(hours).map(([d, entry]) => (
          <li key={d}>
            <span className="day">{capitalize(d)}</span>
            <span className="time">{entry.closed ? 'Cerrado' : `${entry.open}–${entry.close}`}</span>
          </li>
        ))}
      </ul>
      <div className={`status ${status.open ? 'is-open' : 'is-closed'}`}>
        {status.open ? 'Abierto ahora' : 'Cerrado ahora'} ({status.label})
      </div>
    </section>
  );
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

const defaultHours = {
  monday: { open: '23:30', close: '03:00' },
  tuesday: { open: '23:30', close: '03:00' },
  wednesday: { open: '23:30', close: '03:00' },
  thursday: { open: '23:30', close: '03:00' },
  friday: { open: '23:30', close: '06:00' },
  saturday: { open: '23:30', close: '06:00' },
  sunday: { closed: true },
};