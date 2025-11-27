import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as xanoLogin, getMe, setAuthToken } from "../api/xano.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- Función auxiliar para aplicar el usuario cargado ---
  const applyUser = (me) => {
    setUser(me || null);
    const ok = !!me;
    setIsAuthenticated(ok);
    const rawRol = String(me?.rol || me?.role || "").trim().toLowerCase();
    const isAdm = ["administrador", "admin", "administrator", "adm"].includes(rawRol);
    setIsAdmin(isAdm);
  };

  // --- Carga el usuario actual desde /auth/me ---
  const loadUser = async () => {
    setLoading(true);
    setError("");
    try {
      const me = await getMe(); // ya hace data?.Self ?? data
      applyUser(me);
    } catch (err) {
      console.error("Error cargando /auth/me:", err);
      applyUser(null);
      setError("No se pudo cargar la sesión.");
    } finally {
      setLoading(false);
    }
  };

  // --- Login ---
  const login = async (email, password) => {
    setError("");
    try {
      const res = await xanoLogin({ email, password });

      // Xano puede devolver el token con distintos nombres
      const token =
        res?.authToken ||
        res?.token ||
        res?.auth_token ||
        res?.jwt ||
        res?.access_token;

      if (!token) throw new Error("El login no devolvió token.");

      // Guardar y aplicar el token
      localStorage.setItem("authToken", token); // Usar 'authToken' consistentemente
      setAuthToken(token);
      try { localStorage.setItem('lastAccessAt', new Date().toISOString()) } catch {}

      // Cargar datos del usuario autenticado
      await loadUser();
      return true;
    } catch (err) {
      console.error("Error en login:", err);
      setError("Credenciales inválidas o problema de servidor.");
      return false;
    }
  };

  // --- Logout ---
  const logout = () => {
    localStorage.removeItem("authToken"); // Usar 'authToken' consistentemente
    setAuthToken("");
    try { localStorage.removeItem('lastAccessAt') } catch {}
    applyUser(null);
  };

  // --- Carga sesión si hay token guardado ---
  useEffect(() => {
    const token = localStorage.getItem("authToken"); // Usar 'authToken' consistentemente
    if (token) {
      setAuthToken(token);
      loadUser();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Valor del contexto para los componentes ---
  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isAdmin,
      loading,
      error,
      login,
      logout,
      loadUser,
    }),
    [user, isAuthenticated, isAdmin, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
