import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Modal } from 'react-bootstrap'
import { Pencil, Person, Envelope, Telephone, GeoAlt } from 'react-bootstrap-icons'
import { useAuth } from '../../context/AuthContext'
import { getMe, updateUser } from '../../api/xano'
import ClientNavbar from '../../components/client/ClientNavbar.jsx'
import '../../styles/client.css'

const ClientProfilePage = () => {
  const { user: authUser } = useAuth()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    last_name: '',
    email: '',
    direccion: '',
    telefono: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || user.nombre || '',
        last_name: user.last_name || '',
        email: user.email || '',
        direccion: user.direccion || '',
        telefono: user.telefono || ''
      })
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      setError('')
      const userData = await getMe()
      setUser(userData)
    } catch (err) {
      console.error('Error fetching user data:', err)
      setError('Error al cargar los datos del usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setShowEditModal(true)
    setSuccess('')
    setError('')
  }

  const handleSaveEdit = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const updateData = {
        name: editForm.name.trim(),
        last_name: editForm.last_name.trim(),
        direccion: editForm.direccion.trim(),
        telefono: editForm.telefono.trim()
      }

      // Solo incluir email si ha cambiado
      if (editForm.email !== user.email) {
        updateData.email = editForm.email.trim()
      }

      const updatedUser = await updateUser(user.id, updateData)
      setUser(updatedUser)
      setSuccess('Datos actualizados correctamente')
      setShowEditModal(false)
    } catch (err) {
      console.error('Error updating user:', err)
      setError('Error al actualizar los datos')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="warning" />
        <p className="mt-3 text-light">Cargando perfil...</p>
      </Container>
    )
  }

  if (!user) {
    return (
      <Container className="py-5">
        <Row>
          <Col md={6} className="mx-auto text-center">
            <i className="bi bi-person-x display-1 text-warning mb-3"></i>
            <h2 className="text-light mb-3">No has iniciado sesión</h2>
            <p className="text-light mb-4">
              Por favor inicia sesión para ver tu perfil
            </p>
            <Button variant="warning" href="/login">
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Iniciar Sesión
            </Button>
          </Col>
        </Row>
      </Container>
    )
  }

  return (
    <div className="client-profile-page">
      <ClientNavbar />
      <div className="client-profile-hero">
        <Container>
          <h1 className="text-center mb-2 text-warning">Mi Perfil</h1>
          <p className="text-center text-light mb-3">Bienvenido nuevamente, <strong>{authUser?.name || authUser?.nombre || user?.name || user?.nombre || 'Cliente'}</strong></p>
          <p className="text-center text-light">
            Gestiona tu información personal
          </p>
        </Container>
      </div>

      <Container className="py-5">
        {error && (
          <Row className="mb-4">
            <Col>
              <Alert variant="danger" className="bar-pirata-alert">
                {error}
              </Alert>
            </Col>
          </Row>
        )}

        {success && (
          <Row className="mb-4">
            <Col>
              <Alert variant="success" className="bar-pirata-alert">
                {success}
              </Alert>
            </Col>
          </Row>
        )}

        <Row>
          <Col lg={8} className="mx-auto">
            <Card className="client-profile-card bg-dark text-light border-warning">
              <Card.Header className="bg-dark border-warning">
                <h3 className="text-warning mb-0">
                  <i className="bi bi-person-circle me-2"></i>
                  Información Personal
                </h3>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <div className="client-profile-field mb-3">
                      <label className="text-warning">Nombre:</label>
                      <p className="mb-0">{user.name || user.nombre || '-'}</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="client-profile-field mb-3">
                      <label className="text-warning">Apellido:</label>
                      <p className="mb-0">{user.last_name || '-'}</p>
                    </div>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <div className="client-profile-field mb-3">
                      <label className="text-warning">Email:</label>
                      <p className="mb-0">{user.email || '-'}</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="client-profile-field mb-3">
                      <label className="text-warning">Teléfono:</label>
                      <p className="mb-0">{user.telefono || '-'}</p>
                    </div>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={12}>
                    <div className="client-profile-field mb-3">
                      <label className="text-warning">Dirección:</label>
                      <p className="mb-0">{user.direccion || '-'}</p>
                    </div>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <div className="client-profile-field mb-3">
                      <label className="text-warning">Estado:</label>
                      <p className="mb-0">
                        <span className={`badge ${
                          user.estado === 'activo' ? 'bg-success' : 
                          user.estado === 'bloqueado' ? 'bg-danger' : 'bg-secondary'
                        }`}>
                          {user.estado || 'activo'}
                        </span>
                      </p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="client-profile-field mb-3">
                      <label className="text-warning">Rol:</label>
                      <p className="mb-0">
                        <span className={`badge ${
                          user.rol === 'administrador' ? 'bg-warning text-dark' : 'bg-info'
                        }`}>
                          {user.rol === 'administrador' ? '⭐ Administrador' : '👤 Cliente'}
                        </span>
                      </p>
                    </div>
                  </Col>
                </Row>
                
                <div className="text-center mt-4">
                  <Button variant="warning" onClick={handleEdit}>
                    <i className="bi bi-pencil me-2"></i>
                    Editar Datos
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal de edición */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
        centered
        className="bar-pirata-modal"
      >
        <Modal.Header closeButton className="bg-dark text-light border-warning">
          <Modal.Title className="text-warning">
            <i className="bi bi-pencil-square me-2"></i>
            Editar Perfil
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="bg-dark text-light">
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-warning">Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    className="bg-dark text-light border-warning"
                    placeholder="Ingresa tu nombre"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-warning">Apellido</Form.Label>
                  <Form.Control
                    type="text"
                    name="last_name"
                    value={editForm.last_name}
                    onChange={handleInputChange}
                    className="bg-dark text-light border-warning"
                    placeholder="Ingresa tu apellido"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-warning">Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                    className="bg-dark text-light border-warning"
                    placeholder="Ingresa tu email"
                  />
                  <Form.Text className="text-muted">
                    Cambiar tu email puede afectar tu inicio de sesión
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-warning">Teléfono</Form.Label>
                  <Form.Control
                    type="tel"
                    name="telefono"
                    value={editForm.telefono}
                    onChange={handleInputChange}
                    className="bg-dark text-light border-warning"
                    placeholder="Ingresa tu teléfono"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-warning">Dirección</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="direccion"
                    value={editForm.direccion}
                    onChange={handleInputChange}
                    className="bg-dark text-light border-warning"
                    placeholder="Ingresa tu dirección completa"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        
        <Modal.Footer className="bg-dark border-warning">
          <Button
            variant="outline-secondary"
            onClick={() => setShowEditModal(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            variant="warning"
            onClick={handleSaveEdit}
            disabled={saving}
          >
            {saving ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Guardando...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Guardar Cambios
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default ClientProfilePage
