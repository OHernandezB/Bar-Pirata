import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Button, Alert, Spinner } from 'react-bootstrap'
import { Cart4 } from 'react-bootstrap-icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../../context/CartContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import ClientCartItem from '../../components/client/ClientCartItem.jsx'
import ClientCheckoutModal from '../../components/client/ClientCheckoutModal.jsx'
import ClientNavbar from '../../components/client/ClientNavbar.jsx'
import '../../styles/client.css'
import { confirmPedido } from '../../api/xano.js'

const ClientCartPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { items, clearCart, total, updateQty, removeItem, refresh } = useCart()
  const { user } = useAuth()
  const [showCheckout, setShowCheckout] = useState(false)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleCheckout = async () => {
    if (!user) {
      try {
        localStorage.setItem('tempCart', JSON.stringify(items))
        localStorage.setItem('postLoginRedirect', '/cliente/carrito?resume=1')
      } catch {}
      navigate('/login')
      return
    }

    if (items.length === 0) {
      setErrorMessage('El carrito está vacío')
      return
    }

    setLoading(true)
    setErrorMessage('')

    try {
      await confirmPedido()
      setSuccessMessage('Tu pedido fue enviado y está pendiente de aprobación.')
      await refresh()
      try {
        localStorage.removeItem('tempCart')
        localStorage.removeItem('postLoginRedirect')
      } catch {}
      setShowCheckout(false)
      // Redirigir a Mis Órdenes después de 2 segundos
      setTimeout(() => {
        navigate('/usuario/ordenes')
      }, 2000)
    } catch (error) {
      console.error('Error en checkout:', error)
      setErrorMessage('No se pudo confirmar el pedido. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const q = new URLSearchParams(location.search)
    const resume = q.get('resume')
    if (resume) {
      setShowCheckout(true)
      try { localStorage.removeItem('postLoginRedirect') } catch {}
    }
  }, [location.search])

  if (successMessage) {
    return (
      <div className="client-cart-page">
        <ClientNavbar />
        <Container className="py-5 flex-grow-1 d-flex align-items-center">
          <Row className="w-100">
            <Col md={8} className="mx-auto text-center">
              <Alert variant="success" className="bar-pirata-alert">
                <i className="bi bi-check-circle-fill display-4 text-success mb-3"></i>
                <h4 className="text-success">¡Éxito!</h4>
                <p className="text-light">{successMessage}</p>
                <p className="text-muted small">
                  Serás redirigido al catálogo en unos segundos...
                </p>
              </Alert>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="client-cart-page">
        <ClientNavbar />
        <Container className="py-5 flex-grow-1 d-flex align-items-center">
          <Row className="w-100">
            <Col md={8} className="mx-auto text-center">
              <i className="bi bi-cart-x display-1 text-warning mb-3"></i>
              <h2 className="text-light mb-3">Tu carrito está vacío</h2>
              <p className="text-light mb-4">
                ¡Agrega algunos productos a tu carrito para continuar!
              </p>
              <Button
                variant="warning"
                onClick={() => navigate('/cliente/catalogo')}
                className="btn-lg"
              >
                <i className="bi bi-arrow-left me-2"></i>
                Ir al Catálogo
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }

  return (
    <div className="client-cart-page">
      <ClientNavbar />
      <div className="client-cart-hero">
        <Container>
          <h1 className="text-center mb-4 text-warning">Tu Carrito</h1>
          <p className="text-center text-light">
            Revisa tus productos antes de finalizar la compra
          </p>
        </Container>
      </div>

      <Container className="py-5 flex-grow-1">
        {errorMessage && (
          <Row className="mb-4">
            <Col>
              <Alert variant="danger" className="bar-pirata-alert">
                {errorMessage}
              </Alert>
            </Col>
          </Row>
        )}

        {/* Lista de productos */}
        <Row>
          <Col lg={8}>
            <div className="client-cart-items-container">
              {items.map((item) => (
                <ClientCartItem key={item.id} item={item} onUpdateQuantity={updateQty} onRemove={removeItem} />
              ))}
            </div>
            
            <div className="mt-4">
              <Button
                variant="outline-danger"
                onClick={clearCart}
                className="me-3"
              >
                <i className="bi bi-trash me-2"></i>
                Vaciar Carrito
              </Button>
              
              <Button
                variant="outline-warning"
                onClick={() => navigate('/cliente/catalogo')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Seguir Comprando
              </Button>
            </div>
          </Col>

          {/* Resumen del pedido */}
          <Col lg={4}>
            <div className="client-order-summary">
              <h3 className="text-warning mb-4">Resumen del Pedido</h3>
              
              <div className="summary-item d-flex justify-content-between mb-2">
                <span className="text-light">Subtotal:</span>
                <span className="text-light">${total.toLocaleString('es-CL')}</span>
              </div>
              
              <div className="summary-item d-flex justify-content-between mb-2">
                <span className="text-light">Envío:</span>
                <span className="text-success">Gratis</span>
              </div>
              
              <hr className="border-secondary" />
              
              <div className="summary-total d-flex justify-content-between mb-4">
                <strong className="text-warning">Total:</strong>
                <strong className="text-warning">
                  ${total.toLocaleString('es-CL')}
                </strong>
              </div>
              
              <Button
                variant="warning"
                size="lg"
                className="w-100 client-checkout-btn"
                onClick={() => setShowCheckout(true)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Procesando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-credit-card me-2"></i>
                    Pagar y Solicitar Envío
                  </>
                )}
              </Button>
              
              {!user && (
                <p className="text-danger small mt-3">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  Debes iniciar sesión para realizar el pedido
                </p>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      {/* Modal de checkout */}
      <ClientCheckoutModal
        show={showCheckout}
        onHide={() => setShowCheckout(false)}
        onConfirm={handleCheckout}
        total={total}
        loading={loading}
      />
    </div>
  )
}

export default ClientCartPage
