import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/auth.service";
import { showErrorAlert, showSuccessAlert } from "../helpers/sweetAlert.js";
import { useAuth } from "../context/AuthContext"; // <-- 1. IMPORTAR useAuth
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginContext } = useAuth(); // <-- 2. OBTENER LA FUNCIÓN DEL CONTEXTO

  const [showPassword, setShowPassword] = useState(false); //para lo del ojo en contraseña

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await login({ email, password });

      if (response.status === "Success") {
        showSuccessAlert("¡Bienvenido!", "Inicio de sesión correcto");

        // --- LÓGICA ACTUALIZADA ---
        // Obtenemos el usuario y el token de la respuesta
        const userData = response.data.user;
        const token = response.data.token;

        if (!userData || !token) {
          throw new Error("La respuesta del login no incluye usuario o token.");
        }

        // 4. GUARDAMOS EL USUARIO EN EL CONTEXTO
        loginContext(userData, token);

        // 5. REDIRIGIMOS A UNA SOLA RUTA
        navigate("/panel");
      } else {
        showErrorAlert("Error", response.message || response.errorDetails);
      }
    } catch (error) {
      console.error("Error al iniciar sesión: ", error);
      showErrorAlert("Error", "No se pudo conectar al servidor");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 w-full max-w-md transform transition-all hover:scale-105">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-600 mb-8">
            Iniciar sesión
          </h1>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700"
            >
              Correo institucional
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="...@ubb.cl"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700"
            >
              Contraseña
            </label>
            {/* Contenedor relativo para el botón */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} // <-- Lógica de visibilidad
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="**********"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300 pr-10" // <-- Padding para el ojo
              />
              {/* Botón del "Ojo" */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-blue-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Iniciar sesión
          </button>

          <p className="text-center text-gray-600 mt-6">
            ¿No tienes una cuenta?
            <Link
              to="/register"
              className="text-blue-600 hover:underline font-semibold ml-1"
            >
              Regístrate aquí
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
export default Login;
