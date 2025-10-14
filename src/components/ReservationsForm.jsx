import { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useNavigate } from 'react-router-dom';

export function ReservationsForm({ onSubmit }) {
  const [form, setForm] = useState({ name: '', phone: '', date: '', time: '', size: 2, table: '' });
  const cart = useCart();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === 'size' ? Number(value) : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    cart?.setReservation?.(form);
    if (onSubmit) onSubmit(form);
    navigate('/carrito');
  };

  return (
    <section id="reservas" className="reservations">
      <h2>Reservas</h2>
      <form className="reservations__form" onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Nombre" required />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Teléfono" required />
        <input type="date" name="date" value={form.date} onChange={handleChange} required />
        <input type="time" name="time" value={form.time} onChange={handleChange} required />
        <input type="number" name="size" min="1" max="20" value={form.size} onChange={handleChange} />
        <input type="number" name="table" min="1" max="50" value={form.table} onChange={handleChange} placeholder="Mesa (opcional)" />
        <button type="submit">Enviar reserva</button>
      </form>
    </section>
  );
}