import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function Navbar({ brand = 'Bar Pirata', links = defaultLinks, onLinkClick }) {
  const [open, setOpen] = useState(false);
  const { items } = useCart() || {};
  const { isAuthenticated, logout } = useAuth() || {};
  const count = (items || []).reduce((sum, i) => sum + (i.qty || 0), 0);

  const handleClick = () => {
    setOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div className="navbar__brand">{brand}</div>
        <button
          className="navbar__toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          data-open={open ? 'true' : 'false'}
          onClick={() => setOpen(!open)}
        >
          {open ? '✕' : '☰'}
        </button>
        <nav className={`navbar__links ${open ? 'is-open' : ''}`}>
          {links.map(({ label, to }) => (
            <Link key={to} to={to} onClick={handleClick}>
              {label}
              {to === '/carrito' && count > 0 && (
                <span className="navbar__cart-count">{count}</span>
              )}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link to="/admin/products" onClick={handleClick}>Admin</Link>
              <button className="btn btn--ghost" onClick={() => { logout?.(); handleClick(); }}>Salir</button>
            </>
          ) : (
            <Link to="/login" onClick={handleClick}>Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

const defaultLinks = [
  { label: 'Inicio', to: '/inicio' },
  { label: 'Menú', to: '/menu' },
  { label: 'Reservas', to: '/reservas' },
  { label: 'Eventos', to: '/inicio#eventos' },
  { label: 'Contacto', to: '/inicio#contacto' },
  { label: 'Carrito', to: '/carrito' },
];