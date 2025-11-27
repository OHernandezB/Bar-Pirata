import React, { useState } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { CartPlus } from 'react-bootstrap-icons';
import { resolveImageUrl, getProductMainImage, getProductImages } from '../../utils/images.js'

const ClientProductCard = ({ product, onAddToCart }) => {
  const imgs = getProductImages(product)
  const [current, setCurrent] = useState(0)
  const resolved = resolveImageUrl(getProductMainImage(product))
  const fallbackGen = 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=botella%20de%20licor%20estilo%20pirata%20minimalista%20fondo%20negro%20dorado&image_size=square'
  const imgSrc = (imgs[current] || product?.imagen || resolved || fallbackGen)
  const prev = (e) => { e.stopPropagation(); setCurrent((i) => (i - 1 + imgs.length) % (imgs.length || 1)) }
  const next = (e) => { e.stopPropagation(); setCurrent((i) => (i + 1) % (imgs.length || 1)) }
  return (
    <Card className="h-100 shadow-sm product-card">
      <div className="product-image-container" onClick={imgs.length > 1 ? next : undefined}>
        <Card.Img 
          variant="top" 
          src={imgSrc}
          alt={product.nombre}
          className="product-image"
        />
        {/* Navegación por clic sin overlay de botones */}
      </div>
      <Card.Body className="d-flex flex-column">
        <div className="mb-2">
          <Badge bg="warning" text="dark" className="mb-2">
            {product.categoria}
          </Badge>
          <Card.Title className="h5 text-light">{product.nombre}</Card.Title>
          <Card.Text className="text-muted small flex-grow-1">
            {product.descripcion}
          </Card.Text>
        </div>
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="h4 mb-0 text-warning">${product.precio}</span>
            <small className="text-muted">Stock: {product.stock}</small>
          </div>
          <Button
            variant="outline-warning"
            className="w-100"
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
          >
            <CartPlus className="me-2" />
            {product.stock === 0 ? 'Sin Stock' : 'Agregar'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ClientProductCard;
