import { useCart } from '../context/CartContext.jsx';
import { formatCLP } from '../utils/format.js';

export function Cart() {
  const { items, updateQty, removeItem, clearCart, total } = useCart() || {};

  const hasItems = (items?.length || 0) > 0;

  return (
    <section className="cart">
      <h2>Carrito</h2>
      {!hasItems && <p className="cart__empty">Tu carrito está vacío.</p>}
      {hasItems && (
        <div className="cart__items">
          {items.map((it) => (
            <div key={it.id} className="cart__item">
              <div className="cart__item-info">
                <strong>{it.name}</strong>
                <span className="price">{formatCLP(it.price)}</span>
              </div>
              <div className="cart__item-actions">
                <label>
                  Cantidad
                  <input type="number" min="1" value={it.qty} onChange={(e) => updateQty(it.id, Number(e.target.value))} />
                </label>
                <button className="btn btn--ghost" onClick={() => removeItem(it.id)}>Eliminar</button>
              </div>
            </div>
          ))}
          <div className="cart__total">Total: {formatCLP(total || 0)}</div>
        </div>
      )}

      {/* Reservas removidas del proyecto */}

      <div className="cart__actions">
        <button className="btn btn--ghost" onClick={clearCart} disabled={!hasItems}>Vaciar carrito</button>
        <button className="btn" onClick={() => alert('Pedido confirmado. ¡Gracias!')} disabled={!hasItems}>Confirmar pedido</button>
      </div>
    </section>
  );
}