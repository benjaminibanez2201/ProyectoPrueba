import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  //  1. Agregamos estado de carga (empieza en true)
  const [loading, setLoading] = useState(true);

  // El useEffect para cargar el usuario al iniciar la app
  useEffect(() => {
    const token = cookies.get("jwt-auth");
    const storedUser = sessionStorage.getItem("usuario");

    if (token && storedUser) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setUser(JSON.parse(storedUser));
        } else {
          // Token expirado, limpiamos
          cookies.remove("jwt-auth");
          sessionStorage.removeItem("usuario");
        }
      } catch (error) {
        console.error("Error al decodificar token:", error);
        cookies.remove("jwt-auth");
        sessionStorage.removeItem("usuario");
      }
    }
    //  2. Avisamos que terminamos de verificar (haya usuario o no)
    setLoading(false);
  }, []);

  // para guardar el usuario después del login
  const loginContext = (userData, token) => {
    // 1. Guardar en el estado de React
    setUser(userData);
    // 2. Guardar en Session Storage (para el useEffect)
    sessionStorage.setItem("usuario", JSON.stringify(userData));
    // 3. Guardar token accesible para el interceptor
    sessionStorage.setItem("jwt-token", token);
    // 4. (Opcional) Cookie: puede fallar en http si secure=true, por eso usamos sessionStorage como fuente primaria
    try {
      cookies.set("jwt-auth", token, {
        expires: 1,
        secure: true,
        sameSite: "strict",
      });
    } catch (e) {
      // Silenciar en dev
    }
  };

  // para limpiar el usuario al cerrar sesión
  const logoutContext = () => {
    // 1. Limpiar estado de React
    setUser(null);
    // 2. Limpiar Session Storage
    sessionStorage.removeItem("usuario");
    sessionStorage.removeItem("jwt-token");
    // 3. Limpiar cookie
    cookies.remove("jwt-auth");
  };

  //  3. Si está cargando, mostramos una pantalla blanca o mensaje
  // Esto evita que ProtectedRoute te expulse antes de tiempo
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Cargando sesión...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, setUser, loginContext, logoutContext }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
