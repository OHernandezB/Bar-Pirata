import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import MenuPage from './pages/MenuPage.jsx'
import CartPage from './pages/CartPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import AdminProductsPage from './pages/AdminProductsPage.jsx'
import AdminUsersPage from './pages/AdminUsersPage.jsx'
import { Footer, SiteHeader } from './components'
import { useAuth } from './context/AuthContext.jsx'
import AdminCategoriesPage from './pages/AdminCategoriesPage.jsx'
// import AdminToolbar from './components/AdminToolbar.jsx'
import AdminDashboardPage from './pages/AdminDashboardPage.jsx'
import AdminLayout from './pages/AdminLayout.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'

function App() {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl">
        Verificando sesión...
      </div>
    )
  }

  return (
    <>
      {/* Mostrar el navbar/header genérico también en admin */}
      <SiteHeader messages={[
        'Happy Hour: 6–8 pm',
        'Música en vivo este viernes',
      ]} />

      {/* Sin AdminToolbar para mantener la limpieza visual */}

      <div className="site-content">
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/inicio" element={<Home />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/recuperar" element={<ForgotPasswordPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Login: si ya está autenticado, redirige */}
          <Route
            path="/login"
            element={
              isAuthenticated
                ? <Navigate to={isAdmin ? '/admin' : '/'} replace />
                : <LoginPage />
            }
          />

          {/* Panel Admin protegido */}
          <Route
            path="/admin/*"
            element={
              isAuthenticated && isAdmin
                ? <AdminLayout />
                : <Navigate to="/login" replace />
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />
    </>
  )
}

export default App
