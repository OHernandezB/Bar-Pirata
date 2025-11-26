import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

const ClientCheckoutModal = ({ show, onHide, cartItems, total, onConfirm }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    notas: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onConfirm(formData);
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        direccion: '',
        notas: ''
      });
    } catch (error) {
      console.error('Error en checkout:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="checkout-modal">
      <Modal.Header closeButton className="bg-dark text-light border-warning">
        <Modal.Title>Finalizar Pedido</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-light">
        <div className="mb-4">
          <h5 className="text-warning mb-3">Resumen del Pedido</h5>
          {cartItems.map(item => (
            <div key={item.id} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary">
              <div>
                <span className="text-light">{item.nombre}</span>
                <small className="text-muted d-block">Cantidad: {item.quantity}</small>
              </div>
              <span className="text-warning">${(item.precio * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-warning">
            <h5 className="text-light mb-0">Total:</h5>
            <h4 className="text-warning mb-0">${total.toFixed(2)}</h4>
          </div>
        </div>

        <Form onSubmit={handleSubmit}>
          <h5 className="text-warning mb-3">Datos de Contacto</h5>
          
          <Form.Group className="mb-3">
            <Form.Label>Nombre Completo</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
              className="bg-secondary text-light border-warning"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="bg-secondary text-light border-warning"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              required
              className="bg-secondary text-light border-warning"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Dirección de Entrega</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="direccion"
              value={formData.direccion}
              onChange={handleInputChange}
              required
              className="bg-secondary text-light border-warning"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notas Adicionales (Opcional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="notas"
              value={formData.notas}
              onChange={handleInputChange}
              className="bg-secondary text-light border-warning"
            />
          </Form.Group>

          <Alert variant="info" className="bg-warning text-dark border-0">
            <small>
              <strong>Importante:</strong> Este es un pedido de simulación. No se procesarán pagos reales.
            </small>
          </Alert>
        </Form>
      </Modal.Body>
      <Modal.Footer className="bg-dark text-light border-warning">
        <Button variant="outline-secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button
          variant="warning"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ClientCheckoutModal;