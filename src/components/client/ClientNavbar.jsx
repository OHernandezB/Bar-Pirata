import React from 'react';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import { Cart4, Person, Shop } from 'react-bootstrap-icons';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const ClientNavbar = () => {
  const { items } = useCart();
  const location = useLocation();
  
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
  
  const isActive = (path) => location.pathname === path;

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="border-bottom border-warning client-navbar">
      <Container>
        <Navbar.Brand as={Link} to="/cliente/catalogo" className="d-flex align-items-center">
          <span className="navbar-brand-text">Bar Pirata</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="client-navbar-nav" />
        
        <Navbar.Collapse id="client-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link 
              as={Link} 
              to="/cliente/catalogo"
              className={`d-flex align-items-center ${isActive('/cliente/catalogo') ? 'active' : ''}`}
            >
              <Shop className="me-2" />
              Catálogo
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/cliente/carrito"
              className={`d-flex align-items-center position-relative ${isActive('/cliente/carrito') ? 'active' : ''}`}
            >
              <Cart4 className="me-2" />
              Carrito
              {cartItemCount > 0 && (
                <Badge 
                  pill 
                  bg="warning" 
                  text="dark" 
                  className="position-absolute top-0 start-100 translate-middle"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/cliente/perfil"
              className={`d-flex align-items-center ${isActive('/cliente/perfil') ? 'active' : ''}`}
            >
              <Person className="me-2" />
              Perfil
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default ClientNavbar;