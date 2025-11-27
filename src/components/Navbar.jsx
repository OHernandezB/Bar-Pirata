import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Cart4 } from 'react-bootstrap-icons';

export function Navbar({ brand = 'Bar Pirata', links = defaultLinks }) {
  const [open, setOpen] = useState(false);
  const { items } = useCart() || {};
  const { isAuthenticated, isAdmin, logout } = useAuth() || {};
  const navigate = useNavigate();
  const userBtnRef = useRef(null);
  const [userOpen, setUserOpen] = useState(false);

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
      setUserOpen(false);
      navigate('/login', { replace: true });
    }
  };

  useEffect(() => {
    const onDocClick = (e) => {
      if (!userBtnRef.current) return;
      if (!userBtnRef.current.closest('.navbar__user-wrap')) return;
      const wrap = userBtnRef.current.closest('.navbar__user-wrap');
      if (!wrap.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <div className="navbar">
      <div className="navbar__inner">
        {/* Izquierda: Marca */}
        <div className="navbar__brand" aria-label={brand} title={brand}>
          <img src="/IMG/logo-bar-pirata.png" alt={brand} className="navbar__brand-logo" />
        </div>

        {/* Centro: Menú principal */}
        <button
          className="navbar__toggle"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
        <nav className={`navbar__center navbar__links ${open ? 'is-open' : ''}`}>
          {visibleLinks.map((l) => {
            const isHome = l.to === '/inicio' || l.to === '/';
            const onClick = isHome ? handleGoHome : handleCloseMenu;
            return (
              <Link key={`${l.to}-${l.label}`} to={l.to} onClick={onClick}>
                {l.label}
              </Link>
            );
          })}
          
        </nav>

        {/* Derecha: Acciones (Carrito + Usuario) */}
        <div className="navbar__actions">
          <Link to="/carrito" onClick={handleCloseMenu} className="navbar__cart" aria-label="Carrito">
            <Cart4 size={22} />
            {count > 0 && <span className="navbar__cart-count" aria-label={`${count} items`}>{count}</span>}
          </Link>
          <div className="navbar__user-wrap">
            <button
              ref={userBtnRef}
              className="navbar__login"
              aria-haspopup="menu"
              aria-expanded={userOpen}
              onClick={() => setUserOpen((v) => !v)}
            >
              {isAuthenticated ? (isAdmin ? 'Admin' : 'Mi cuenta') : 'Iniciar sesión'}
            </button>

            <div className={`navbar__dropdown ${userOpen ? 'is-open' : ''}`} role="menu">
              {!isAuthenticated && (
                <>
                  <Link role="menuitem" to="/login" onClick={() => setUserOpen(false)}>Iniciar sesión</Link>
                  <Link role="menuitem" to="/signup" onClick={() => setUserOpen(false)}>Registrarse</Link>
                </>
              )}

              {isAuthenticated && !isAdmin && (
                <>
                  <Link role="menuitem" to="/perfil" onClick={() => setUserOpen(false)}>Mi Perfil</Link>
                  <Link role="menuitem" to="/cliente/catalogo" onClick={() => setUserOpen(false)}>Catálogo</Link>
                  <Link role="menuitem" to="/cliente/carrito" onClick={() => setUserOpen(false)}>Carrito</Link>
                  <Link role="menuitem" to="/usuario/ordenes" onClick={() => setUserOpen(false)}>Mis Órdenes</Link>
                  <button role="menuitem" className="navbar__logout" onClick={handleLogout}>Cerrar Sesión</button>
                </>
              )}

              {isAuthenticated && isAdmin && (
                <>
                  <Link role="menuitem" to="/admin" onClick={() => setUserOpen(false)}>Dashboard</Link>
                  <Link role="menuitem" to="/admin/users" onClick={() => setUserOpen(false)}>Usuarios</Link>
                  <Link role="menuitem" to="/admin/products" onClick={() => setUserOpen(false)}>Productos</Link>
                  <Link role="menuitem" to="/admin/categories" onClick={() => setUserOpen(false)}>Categorías</Link>
                  <button role="menuitem" className="navbar__logout" onClick={handleLogout}>Cerrar Sesión</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const defaultLinks = [
  { to: '/inicio', label: 'Inicio' },
  { to: '/cliente/catalogo', label: 'Catálogo' },
  { to: '/#eventos', label: 'Eventos' },
  { to: '/inicio', label: 'Nosotros' },
];
