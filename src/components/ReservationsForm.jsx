import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useNavigate } from 'react-router-dom';

export function ReservationsForm({ onSubmit }) {
  const [form, setForm] = useState({ name: '', rut: '', email: '', phone: '', time: '', table: '' });
  const cart = useCart();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Prefill desde selección de Mesas
  useEffect(() => {
    if (cart?.reservation) {
      setForm((f) => ({
        ...f,
        table: cart.reservation.table ?? f.table,
        time: cart.reservation.time ?? f.time,
      }));
    }
  }, [cart?.reservation?.table, cart?.reservation?.time]);

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
        <input name="rut" value={form.rut} onChange={handleChange} placeholder="RUT" required />
        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Correo" required />
        <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Teléfono" required />
        <input type="time" name="time" value={form.time} onChange={handleChange} placeholder="Hora" required />
        <input type="number" name="table" min="1" max="50" value={form.table} onChange={handleChange} placeholder="Mesa" />
        <button type="submit">Enviar reserva</button>
      </form>
    </section>
  );
}