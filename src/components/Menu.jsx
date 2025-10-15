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
          }));
          // Guardamos en un objeto con única clave para compatibilidad, pero no mostramos tabs
          setCategories({ Todos: all });
        }
      } catch (err) {
        console.error('getProducts error', err);
        setError('No se pudo cargar el menú desde Xano. Se muestra menú por defecto.');
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
      {/* Tabs de categorías removidos: se muestran todos los productos */}
      <div className="menu__grid">
        {items.map((item) => (
          <MenuItemCard key={item.name} {...item} />
        ))}
      </div>
    </section>
  );
}

const defaultCategories = {
  Cócteles: [
    { name: 'Mojito', description: 'Ron, hierbabuena, lima, soda.', price: 6500, tags: ['clásico'] },
    { name: 'Negroni', description: 'Ginebra, vermut rojo, Campari.', price: 7000 },
  ],
  Cervezas: [
    { name: 'IPA artesanal', description: 'Amarga y aromática.', price: 4500, tags: ['artesanal'] },
    { name: 'Lager', description: 'Suave y refrescante.', price: 3500 },
  ],
  Comidas: [
    { name: 'Nachos con queso', description: 'Totopos, queso, jalapeños.', price: 6000 },
    { name: 'Hamburguesa pirata', description: 'Doble carne, cheddar, salsa especial.', price: 8500 },
  ],
};