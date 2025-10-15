import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import MenuPage from './pages/MenuPage.jsx'
import CartPage from './pages/CartPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import AdminProductsPage from './pages/AdminProductsPage.jsx'
import { AnnouncementBar, Navbar, Footer } from './components'
import { useAuth } from './context/AuthContext.jsx'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <>
      <AnnouncementBar messages={[
        'Happy Hour: 6–8 pm',
        'Música en vivo este viernes',
      ]} />
      <Navbar brand="Bar Pirata" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/inicio" element={<Home />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/products" element={isAuthenticated ? <AdminProductsPage /> : <Navigate to="/login" replace />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer brand="Bar Pirata" />
    </>
  )
}

export default App
