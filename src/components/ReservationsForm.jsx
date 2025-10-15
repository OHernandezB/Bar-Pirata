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

  const handleCancel = (e) => {
    e.preventDefault();
    setForm({ name: '', rut: '', email: '', phone: '', time: '', table: '' });
    cart?.setReservation?.(null);
  };

  return (
    <section id="reservas" className="reservations container py-4">
      <h2 className="mb-3">Reservas</h2>
      <form className="reservations__form row g-3" onSubmit={handleSubmit}>
        <div className="col-sm-6">
          <input className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="Nombre" required />
        </div>
        <div className="col-sm-6">
          <input className="form-control" name="rut" value={form.rut} onChange={handleChange} placeholder="RUT" required />
        </div>
        <div className="col-sm-6">
          <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} placeholder="Correo" required />
        </div>
        <div className="col-sm-6">
          <input className="form-control" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Teléfono" required />
        </div>
        <div className="col-sm-6">
          <input className="form-control" type="time" name="time" value={form.time} onChange={handleChange} placeholder="Hora" required />
        </div>
        <div className="col-sm-6">
          <input className="form-control" type="number" name="table" min="1" max="50" value={form.table} onChange={handleChange} placeholder="Mesa" />
        </div>
        <div className="col-12 d-flex gap-2">
          <button className="btn btn-primary" type="submit">Enviar reserva</button>
          {cart?.reservation && (
            <button className="btn btn--ghost btn--danger" type="button" onClick={handleCancel}>Cancelar reserva</button>
          )}
        </div>
      </form>
    </section>
  );
}