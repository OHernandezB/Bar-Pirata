import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Form, InputGroup, Spinner, Alert, Button } from 'react-bootstrap'
import { Search } from 'react-bootstrap-icons'
import ClientProductCard from '../../components/client/ClientProductCard.jsx'
import { getProducts } from '../../api/xano.js'
import { useCart } from '../../context/CartContext.jsx'
import '../../styles/client.css'

const ClientCatalogPage = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { addProduct, refresh } = useCart()
  const addMapped = async (p) => {
    const pid = p.id ?? null
    if (pid == null) return
    await addProduct(pid, 1)
    await refresh()
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [searchTerm, products])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getProducts()
      setProducts(data)
      setFilteredProducts(data)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Error al cargar los productos. Por favor, intenta más tarde.')
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products)
      return
    }

    const filtered = products.filter(product => {
      const name = (product.nombre || product.name || '').toLowerCase()
      const searchLower = searchTerm.toLowerCase()
      return name.includes(searchLower)
    })
    setFilteredProducts(filtered)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="warning" />
        <p className="mt-3 text-light">Cargando productos...</p>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="py-5">
        <Row>
          <Col>
            <Alert variant="danger" className="bar-pirata-alert">
              {error}
            </Alert>
          </Col>
        </Row>
        <div className="text-center">
          <Button className="btn btn-warning" onClick={fetchProducts}>
            Reintentar
          </Button>
        </div>
      </Container>
    )
  }

  return (
    <div className="client-catalog-page">
      <div className="client-catalog-hero">
        <Container>
          <h1 className="text-center mb-4 text-warning">Catálogo de Productos</h1>
          <p className="text-center text-light mb-4">
            Descubre nuestra selección de bebidas y productos exclusivos
          </p>
        </Container>
      </div>

      <Container className="py-5">
        {/* Barra de búsqueda */}
        <Row className="mb-4">
          <Col md={6} className="mx-auto">
            <InputGroup className="client-search-input-group">
              <InputGroup.Text className="bg-dark text-warning border-warning">
                <Search />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Buscar productos por nombre..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="bg-dark text-light border-warning"
              />
              {searchTerm && (
                <Button
                  variant="outline-warning"
                  onClick={() => setSearchTerm('')}
                  className="border-start-0"
                >
                  ×
                </Button>
              )}
            </InputGroup>
          </Col>
        </Row>

        {/* Resultados de búsqueda */}
        {searchTerm && (
          <Row className="mb-3">
            <Col>
              <p className="text-light">
                {filteredProducts.length === 0
                  ? 'No se encontraron productos'
                  : `Mostrando ${filteredProducts.length} producto${filteredProducts.length !== 1 ? 's' : ''}`
                }
              </p>
            </Col>
          </Row>
        )}

        {/* Grid de productos */}
        {filteredProducts.length === 0 ? (
          <Row>
            <Col className="text-center py-5">
              <div className="display-1 text-warning mb-3">🍾</div>
              <h3 className="text-light">No hay productos disponibles</h3>
              <p className="text-light">
                {searchTerm 
                  ? 'Intenta con otro término de búsqueda'
                  : 'Vuelve más tarde para ver nuevos productos'
                }
              </p>
            </Col>
          </Row>
        ) : (
          <Row className="g-4">
            {filteredProducts.map((product) => (
              <Col key={product.id} xs={12} sm={12} md={6} lg={4}>
                <ClientProductCard 
                  product={product} 
                  onAddToCart={addMapped}
                />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  )
}

export default ClientCatalogPage
