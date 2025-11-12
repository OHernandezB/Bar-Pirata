import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function Navbar({ brand = 'Bar Pirata', links = defaultLinks }) {
  const [open, setOpen] = useState(false);
  const { items } = useCart() || {};
  const { isAuthenticated, isAdmin, logout } = useAuth() || {};
  const navigate = useNavigate();

  const count = (items || []).reduce((sum, i) => sum + (i.qty || 0), 0);
  const handleCloseMenu = () => setOpen(false);
  const handleGoHome = () => {
    setOpen(false);
    // Asegurar que al ir a Inicio se sube a la parte superior
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  };

  // Mantener enlaces genéricos en todo el sitio (sin enlaces admin específicos)
  const visibleLinks = links;

  const handleLogout = async () => {
    try {
      logout();
    } finally {
      setOpen(false);
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="navbar">
      <div className="navbar__inner">
        <div className="navbar__brand" aria-label={brand} title={brand}>
          <img src="/IMG/logo-bar-pirata.png" alt={brand} className="navbar__brand-logo" />
        </div>

        <button
          className="navbar__toggle"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>

        <nav className={`navbar__links ${open ? 'is-open' : ''}`}>
          {visibleLinks.map((l) => {
            const isHome = l.to === '/inicio' || l.to === '/';
            const onClick = isHome ? handleGoHome : handleCloseMenu;
            return (
              <Link key={l.to} to={l.to} onClick={onClick}>
                {l.label}
              </Link>
            );
          })}

          {/* Enlace condicional al panel para administradores */}
          {isAuthenticated && isAdmin && (
            <Link to="/admin" onClick={handleCloseMenu}>
              Panel
            </Link>
          )}

          {/* Carrito */}
          <Link to="/carrito" onClick={handleCloseMenu}>
            Carrito{count > 0 ? ` (${count})` : ''}
          </Link>

          {/* Login / Logout condicional */}
          {!isAuthenticated && (
            <Link to="/login" onClick={handleCloseMenu}>
              Iniciar Sesión
            </Link>
          )}
          {isAuthenticated && (
            <button className="navbar__logout" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          )}
        </nav>
      </div>
    </div>
  );
}

const defaultLinks = [
  { to: '/inicio', label: 'Inicio' },
  { to: '/menu', label: 'Ver carta' },
  // Navegación por ancla dentro de Home
  { to: '/#eventos', label: 'Eventos' },
  { to: '/#contacto', label: 'Contacto' },
];
