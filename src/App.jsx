import './App.css'
import { useNavigate, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import MenuPage from './pages/MenuPage.jsx'
import ReservationsPage from './pages/ReservationsPage.jsx'
import CartPage from './pages/CartPage.jsx'
import { AnnouncementBar, Navbar, Footer } from './components'

function App() {
  const navigate = useNavigate()

  const handleReservationSubmit = (data) => {
    // Aquí podríamos integrar una API o enviar a un backend.
    alert(
      `Reserva enviada:\n` +
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
        <Route path="/reservas" element={<ReservationsPage onSubmit={handleReservationSubmit} />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="*" element={<Home onReserveClick={() => navigate('/reservas')} />} />
      </Routes>
      <Footer brand="Bar Pirata" />
    </>
  )
}

export default App
