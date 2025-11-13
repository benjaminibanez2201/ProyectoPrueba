import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import cookies from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // El useEffect para cargar el usuario al iniciar la app (esto está perfecto)
  useEffect(() => {
    const token = cookies.get('jwt-auth');
    const storedUser = sessionStorage.getItem('usuario');
    
    if (token && storedUser) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setUser(JSON.parse(storedUser));
        } else {
          // Token expirado, limpiamos
          cookies.remove('jwt-auth');
          sessionStorage.removeItem('usuario');
        }
      } catch (error) {
        console.error('Error al decodificar token:', error);
        cookies.remove('jwt-auth');
        sessionStorage.removeItem('usuario');
      }
    }
  }, []);

  // --- NUEVA FUNCIÓN ---
  // Función para guardar el usuario después del login
  const loginContext = (userData, token) => {
    // 1. Guardar en el estado de React
    setUser(userData);
    // 2. Guardar en Session Storage (para el useEffect)
    sessionStorage.setItem('usuario', JSON.stringify(userData));
    // 3. Guardar la cookie (para el backend)
    cookies.set('jwt-auth', token, { expires: 1, secure: true, sameSite: 'strict' });
  };

  // --- NUEVA FUNCIÓN ---
  // Función para limpiar el usuario al cerrar sesión
  const logoutContext = () => {
    // 1. Limpiar estado de React
    setUser(null);
    // 2. Limpiar Session Storage
    sessionStorage.removeItem('usuario');
    // 3. Limpiar cookie
    cookies.remove('jwt-auth');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loginContext, logoutContext }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};