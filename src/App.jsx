import './App.css'
import { useNavigate, Routes, Route } from 'react-router-dom'
import { createReservation } from './api/xano.js'
import Home from './pages/Home.jsx'
import MenuPage from './pages/MenuPage.jsx'
import ReservationsPage from './pages/ReservationsPage.jsx'
import CartPage from './pages/CartPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import AdminProductsPage from './pages/AdminProductsPage.jsx'
import { AnnouncementBar, Navbar, Footer } from './components'

function App() {
  const navigate = useNavigate()

  const handleReservationSubmit = async (data) => {
    // Si está configurado Xano, intentamos enviar; si no, mostramos el resumen como antes.
    try {
      const sent = await createReservation(data)
      if (sent) {
        alert('Reserva enviada a Xano correctamente.')
        return
      }
    } catch (err) {
      console.error('[Xano] Error enviando reserva:', err)
      alert(`Error enviando a Xano (${err.status || ''}). Se mostrará resumen local.`)
    }

    // Fallback: resumen local si no hay configuración o falla la API
    alert(
      `Reserva enviada (local):\n` +
      `Nombre: ${data.name}\n` +
      `RUT: ${data.rut}\n` +
      `Correo: ${data.email}\n` +
      `Teléfono: ${data.phone}` +
      (data.time ? `\nHora: ${data.time}` : '') +
      (data.table ? `\nMesa: ${data.table}` : '')
    )
  }

  return (
    <>
      <AnnouncementBar messages={[
        'Happy Hour: 6–8 pm',
        'Música en vivo este viernes',
        'Reservas abiertas: ¡asegura tu mesa!',
      ]} />
      <Navbar brand="Bar Pirata" />
      <Routes>
        <Route path="/" element={<Home onReserveClick={() => navigate('/reservas')} />} />
        <Route path="/inicio" element={<Home onReserveClick={() => navigate('/reservas')} />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/products" element={<AdminProductsPage />} />
        <Route path="/reservas" element={<ReservationsPage onSubmit={handleReservationSubmit} />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="*" element={<Home onReserveClick={() => navigate('/reservas')} />} />
      </Routes>
      <Footer brand="Bar Pirata" />
    </>
  )
}

export default App
