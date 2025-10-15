import { useEffect, useState } from 'react';

export function AnnouncementBar({ messages = defaultMessages, intervalMs = 5000, phone = '+569 8325 0599', email = 'om.hernandez@duocuc.cl' }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % messages.length), intervalMs);
    return () => clearInterval(id);
  }, [messages.length, intervalMs]);

  return (
    <div className="announcement-bar">
      <span>{messages[index]}</span>
    </div>
  );
}

const defaultMessages = [
  'Happy Hour: 6–8 pm',
  'Música en vivo este viernes',
  'Prueba nuestros cócteles de autor'
];