/* eslint-disable */
/* tslint:disable */
import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import NosotrosPage from './pages/NosotrosPage.jsx'
import MenuPage from './pages/MenuPage.jsx'
import CartPage from './pages/CartPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import AdminProductsPage from './pages/admin/AdminProductsPage.jsx'
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.jsx'
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx'
import AdminOrdersPage from './pages/admin/AdminOrdersPage.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import UserLayout from './pages/user/UserLayout.jsx'
import UserOrdersPage from './pages/user/UserOrdersPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import ClientCatalogPage from './pages/client/ClientCatalogPage.jsx'
import ClientCartPage from './pages/client/ClientCartPage.jsx'
import ClientProfilePage from './pages/client/ClientProfilePage.jsx'
import { Footer } from './components'
import { useAuth } from './context/AuthContext.jsx'

// Importar SiteHeader directamente en lugar de desde index
import SiteHeader from './components/SiteHeader.jsx'

function App() {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const postLoginRedirect = typeof window !== 'undefined' ? (localStorage.getItem('postLoginRedirect') || '') : ''

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl">
        Verificando sesión...
      </div>
    )
  }

  return (
    <>
      <SiteHeader messages={[
        'Happy Hour: 6–8 pm',
        'Música en vivo este viernes',
      ]} />

      <div className="site-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inicio" element={<Home />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/nosotros" element={<NosotrosPage />} />
          <Route path="/recuperar" element={<ForgotPasswordPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/perfil" element={<ProfilePage />} />

          <Route path="/cliente/catalogo" element={<ClientCatalogPage />} />
          <Route path="/cliente/carrito" element={<ClientCartPage />} />
          <Route path="/cliente/perfil" element={<ClientProfilePage />} />

          <Route
            path="/login"
            element={
              isAuthenticated
                ? <Navigate to={isAdmin ? '/admin' : (postLoginRedirect || '/cliente/perfil')} replace />
                : <LoginPage />
            }
          />

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
            <Route path="orders" element={<AdminOrdersPage />} />
          </Route>

          <Route
            path="/usuario/*"
            element={
              isAuthenticated && !isAdmin
                ? <UserLayout />
                : <Navigate to={isAdmin ? '/admin' : '/login'} replace />
            }
          >
            <Route index element={<Navigate to="/cliente/catalogo" replace />} />
            <Route path="ordenes" element={<UserOrdersPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />
    </>
  )
}

export default App
