import { useState } from 'react';
import { MenuItemCard } from './MenuItemCard.jsx';

export function Menu({ categories = defaultCategories }) {
  const [active, setActive] = useState(Object.keys(categories)[0]);
  const items = categories[active] || [];

  return (
    <section id="menu" className="menu">
      <h2>Menú</h2>
      <div className="menu__tabs">
        {Object.keys(categories).map((cat) => (
          <button key={cat} className={`tab ${active === cat ? 'is-active' : ''}`} onClick={() => setActive(cat)}>
            {cat}
          </button>
        ))}
      </div>
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