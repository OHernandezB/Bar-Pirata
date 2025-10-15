import { useCart } from '../context/CartContext.jsx';
import { formatCLP } from '../utils/format.js';

export function MenuItemCard({ name, description, price, tags = [], image }) {
  const cart = useCart();
  const handleAdd = () => {
    cart?.addItem?.({ id: name, name, price }, 1);
  };
  return (
    <article className="menu-item-card">
      {image && (
        <img src={image} alt={name} className="menu-item-card__image" />
      )}
      <div className="menu-item-card__header">
        <h3>{name}</h3>
        {price != null && <span className="menu-item-card__price">{formatCLP(price)}</span>}
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