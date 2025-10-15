import { useEffect, useState } from 'react';
import { MenuItemCard } from './MenuItemCard.jsx';
import { getProducts } from '../api/xano.js';

export function Menu({ categories: initialCategories = defaultCategories }) {
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getProducts();
        const arr = Array.isArray(data) ? data : (data?.items || []);
        if (arr.length > 0) {
          const all = arr.map((p) => ({
            name: p.name || p.title || `Producto ${p.id || ''}`,
            description: p.description || '',
            price: p.price,
            tags: Array.isArray(p.tags) ? p.tags : [],
            image: (p?.image && typeof p.image === 'object' ? p.image?.url : (typeof p?.image === 'string' ? p.image : p?.image_url)) || '',
          }));
          // Guardamos en un objeto con única clave para compatibilidad, pero no mostramos tabs
          setCategories({ Todos: all });
        } else {
          setCategories({});
        }
      } catch (err) {
        console.error('getProducts error', err);
        setError('No se pudo cargar el menú desde Xano.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const items = Object.values(categories || {}).flat();

  return (
    <section id="menu" className="menu">
      <h2>Menú</h2>
      {loading && <p>Cargando menú…</p>}
      {error && <div className="map__placeholder" style={{ border: '1px solid #b87333' }}>{error}</div>}
      {!loading && items.length === 0 && !error && (
        <div className="map__placeholder" style={{ border: '1px solid #b87333' }}>No hay productos disponibles.</div>
      )}
      {/* Tabs de categorías removidos: se muestran todos los productos */}
      <div className="menu__grid">
        {items.map((item) => (
          <MenuItemCard key={item.name} {...item} />
        ))}
      </div>
    </section>
  );
}

const defaultCategories = {};