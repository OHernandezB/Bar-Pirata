import { useCart } from '../context/CartContext.jsx';

export function MenuItemCard({ name, description, price, tags = [] }) {
  const cart = useCart();
  const handleAdd = () => {
    cart?.addItem?.({ id: name, name, price }, 1);
  };
  return (
    <article className="menu-item-card">
      <div className="menu-item-card__header">
        <h3>{name}</h3>
        {price != null && <span className="menu-item-card__price">${price}</span>}
      </div>
      {description && <p className="menu-item-card__desc">{description}</p>}
      {tags.length > 0 && (
        <div className="menu-item-card__tags">
          {tags.map((t) => <span key={t} className="tag">{t}</span>)}
        </div>
      )}
      <div className="menu-item-card__actions">
        <button className="btn" onClick={handleAdd}>Agregar al carrito</button>
      </div>
    </article>
  );
}