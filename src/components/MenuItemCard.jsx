import { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { formatCLP } from '../utils/format.js';
import { resolveImageUrl, getProductImages } from '../utils/images.js';

export function MenuItemCard({ id, name, description, price, tags = [], images = [], image, categoryName }) {
  const cart = useCart();
  const fromProp = Array.isArray(images) ? images : [];
  const resolvedFromProp = fromProp.map(resolveImageUrl).filter(Boolean);
  const resolvedFromUtils = getProductImages({ images, image, imagen: image });
  const allImages = (resolvedFromProp.length > 0 ? resolvedFromProp : resolvedFromUtils);
  const fallbackSrc = image ? resolveImageUrl(image) : '/IMG/logo-bar-pirata.png';
  const carouselImages = (allImages.length > 0 ? allImages : [fallbackSrc]);
  const [current, setCurrent] = useState(0);
  const [qty, setQty] = useState(1);
  const inc = () => setQty((q) => Math.min(99, q + 1));
  const dec = () => setQty((q) => Math.max(1, q - 1));
  const prev = () => setCurrent((i) => (i - 1 + carouselImages.length) % carouselImages.length);
  const next = () => setCurrent((i) => (i + 1) % carouselImages.length);

  const handleAdd = () => {
    const firstImg = carouselImages[current] || '/IMG/logo-bar-pirata.png';
    const pid = id ?? name; // usar nombre si no hay id
    if (!pid) return;
    cart?.addItem?.({ id: pid, name: name || 'Producto', price, image: firstImg }, qty);
  };
  const handleImgError = (e) => {
    if (e.currentTarget.dataset.fallbackApplied === 'true') return;
    e.currentTarget.src = '/IMG/logo-bar-pirata.png';
    e.currentTarget.dataset.fallbackApplied = 'true';
  };
  return (
    <article className="menu-item-card">
      <div className="menu-item-card__content">
        <div className="menu-item-card__carousel">
          <img
            src={carouselImages[current]}
            alt={`${name || 'Producto'} imagen ${current + 1}`}
            loading="lazy"
            className="menu-item-card__image"
            onError={handleImgError}
          />
          {carouselImages.length > 1 && (
            <div className="menu-item-card__nav">
              <button type="button" aria-label="Imagen anterior" className="menu-item-card__nav-btn prev" onClick={prev}>‹</button>
              <button type="button" aria-label="Imagen siguiente" className="menu-item-card__nav-btn next" onClick={next}>›</button>
            </div>
          )}
        </div>
        <div className="menu-item-card__details">
          <div className="menu-item-card__header">
            <h3 className="menu-item-card__title">{name || 'Producto'}</h3>
            {price != null && <h3 className="menu-item-card__price">{formatCLP(price)}</h3>}
          </div>
          <div className="menu-item-card__actions">
            <div className="menu-item-card__qty">
              <button type="button" className="btn--outline" aria-label="Disminuir cantidad" onClick={dec}>−</button>
              <input type="number" inputMode="numeric" min="1" max="99" value={qty} onChange={(e) => setQty(Math.max(1, Math.min(99, Number(e.target.value) || 1)))} />
              <button type="button" className="btn--outline" aria-label="Aumentar cantidad" onClick={inc}>+</button>
            </div>
            <button className="btn--outline" onClick={handleAdd}>Agregar al carrito</button>
          </div>
          {categoryName && <div className="menu-item-card__category">{categoryName}</div>}
          {description && <p className="menu-item-card__desc">{description}</p>}
          {tags.length > 0 && (
            <div className="menu-item-card__tags">
              {tags.map((t) => <span key={t} className="tag">{t}</span>)}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}