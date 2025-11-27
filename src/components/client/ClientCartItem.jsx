import React from 'react';
import { Button, InputGroup, Form, Row, Col } from 'react-bootstrap';
import { Trash, Plus, Dash } from 'react-bootstrap-icons';

const ClientCartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value) || 1;
    if (newQuantity >= 1 && newQuantity <= item.stock) {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  const handleIncrement = () => {
    if (item.quantity < item.stock) {
      onUpdateQuantity(item.id, item.quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  return (
    <Row className="cart-item align-items-center py-3 border-bottom">
      <Col xs={3} md={2}>
        <img
          src={item.image || item.imagen || 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=botella%20de%20licor%20estilo%20pirata%20minimalista%20fondo%20negro%20dorado&image_size=square'}
          alt={item.nombre}
          className="img-fluid rounded"
          style={{ maxHeight: '60px', objectFit: 'cover' }}
        />
      </Col>
      <Col xs={9} md={4}>
        <h6 className="mb-1 text-light">{item.nombre}</h6>
        <p className="text-muted mb-1 small">{item.descripcion}</p>
        <p className="text-warning mb-0 fw-bold">${item.precio}</p>
      </Col>
      <Col xs={6} md={3} className="mt-2 mt-md-0">
        <InputGroup size="sm">
          <Button
            variant="outline-warning"
            onClick={handleDecrement}
            disabled={item.quantity <= 1}
          >
            <Dash />
          </Button>
          <Form.Control
            type="number"
            value={item.quantity}
            onChange={handleQuantityChange}
            className="text-center bg-dark text-light border-warning"
            min="1"
            max={item.stock}
            style={{ maxWidth: '60px' }}
          />
          <Button
            variant="outline-warning"
            onClick={handleIncrement}
            disabled={item.quantity >= item.stock}
          >
            <Plus />
          </Button>
        </InputGroup>
        <small className="text-muted d-block mt-1">Stock: {item.stock}</small>
      </Col>
      <Col xs={6} md={2} className="text-end">
        <p className="mb-1 text-warning fw-bold">
          ${(item.precio * item.quantity).toFixed(2)}
        </p>
      </Col>
      <Col xs={12} md={1} className="text-end">
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => onRemove(item.id)}
          className="mt-2 mt-md-0"
        >
          <Trash />
        </Button>
      </Col>
    </Row>
  );
};

export default ClientCartItem;
