import { useEffect, useState, useMemo } from 'react';
import { MenuItemCard } from './MenuItemCard.jsx';
import { getProducts } from '../api/xano.js';
import { getCategories } from '../api/xano.js';
import { getProductMainImage, getProductImages, resolveImageUrl } from '../utils/images.js';

export function Menu({ categories: initialCategories = defaultCategories }) {
  const [categories, setCategories] = useState(initialCategories);
  const [active, setActive] = useState('Todos');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openCats, setOpenCats] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [prodData, catData] = await Promise.all([
          getProducts(),
          getCategories().catch(() => []),
        ]);
        const arr = Array.isArray(prodData) ? prodData : (prodData?.items || []);
        const catArr = Array.isArray(catData) ? catData : (catData?.items || []);
        const catMap = {};
        catArr.forEach((c) => { const id = c.id || c.uuid || c._id; const name = c.name || c.nombre || c.nombre_categ || c.title || `Categoría ${id ?? ''}`; if (id != null) catMap[id] = name; });

        // Sembrar categorías desde Xano para que aparezcan aunque no haya productos
        const byCat = { Todos: [] };
        catArr.forEach((c) => { const id = c.id || c.uuid || c._id; const name = catMap[id]; if (name) byCat[name] = []; });

        if (arr.length > 0) {
          const all = arr.map((p) => {
            const id = p.id || p.uuid || p._id;
            const name = p.nombre_product ?? p.name ?? p.nombre ?? p.title ?? '';
            const description = p.descripcion_product ?? p.description ?? p.descripcion ?? '';
            const priceRaw = p.precio_product ?? p.price ?? p.precio;
            const price = Number.isFinite(Number(priceRaw)) ? Number(priceRaw) : null;
            const tags = Array.isArray(p.tags) ? p.tags : (Array.isArray(p.etiquetas) ? p.etiquetas : []);
            const images = getProductImages(p).slice(0, 3);
            const catId = p.category_id ?? p.id_categoria ?? p.categoria_producto_id ?? p.categoria_id ?? p.categoria ?? p.category;
            const categoryName = catMap[catId] || (typeof p.category === 'string' ? p.category : (typeof p.categoria === 'string' ? p.categoria : 'Otros'));
            return { id, name, description, price, tags, images, categoryName };
          });
          byCat.Todos = all;
          all.forEach((p) => { const k = p.categoryName || 'Otros'; if (!byCat[k]) byCat[k] = []; byCat[k].push(p); });
        }
        setCategories(byCat);
      } catch (err) {
        console.error('getProducts error', err);
        setError('No se pudo cargar la carta desde Xano.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const items = useMemo(() => Object.values(categories || {}).flat(), [categories]);
  const tabs = useMemo(() => Object.keys(categories || {}).filter((k) => k !== 'Todos'), [categories]);
  const currentItems = useMemo(() => {
    const base = (categories?.[active] ?? categories?.['Todos'] ?? []);
    if (active === 'Todos') {
      return [...base].sort((a, b) => {
        const ca = String(a.categoryName || '').localeCompare(String(b.categoryName || ''));
        if (ca !== 0) return ca;
        return String(a.name || '').localeCompare(String(b.name || ''));
      });
    }
    return base;
  }, [categories, active]);

  return (
    <section id="menu" className="menu">
      <h2>Ver carta</h2>
      {loading && <p>Cargando carta…</p>}
      {error && <div className="map__placeholder" style={{ border: '1px solid #b87333' }}>{error}</div>}
      {!loading && items.length === 0 && !error && (
        <div className="map__placeholder" style={{ border: '1px solid #b87333' }}>No hay productos disponibles.</div>
      )}
      <div className="menu__filters" style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div className="dropdown" style={{ position: 'relative' }}>
          <button
            className="btn--outline"
            onClick={() => setOpenCats((o) => !o)}
            aria-expanded={openCats}
            aria-haspopup="true"
          >
            Categorías
          </button>
          {openCats && (
            <div
              className="dropdown__menu"
              role="menu"
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                minWidth: '180px',
                background: 'rgba(12,12,12,0.85)',
                border: '1px solid #b87333',
                borderRadius: '8px',
                padding: 0,
                boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
              }}
            >
              {tabs.length === 0 ? (
                <div className="map__placeholder" style={{ padding: '0.5rem' }}>No hay categorías disponibles</div>
              ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {tabs.map((t) => (
                    <li key={t} style={{ borderBottom: '1px solid rgba(184,115,51,0.25)' }}>
                      <button
                        role="menuitem"
                        onClick={() => { setActive(t); setOpenCats(false); }}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--color-light-smoke)',
                          padding: 0,
                          margin: 0,
                          lineHeight: '2.2rem',
                          cursor: 'pointer'
                        }}
                      >
                        {t}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <button
          className="btn--outline"
          onClick={() => { setActive('Todos'); setOpenCats(false); }}
          aria-pressed={active === 'Todos'}
        >
          Mostrar todo
        </button>
      </div>
      <div className="menu__grid">
        {currentItems.map((item) => (
          <MenuItemCard key={`${item.id}-${item.name}`} {...item} />
        ))}
      </div>
    </section>
  );
}

const defaultCategories = {};