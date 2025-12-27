import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { login } from "../services/auth.service";
import { showErrorAlert, showSuccessAlert } from "../helpers/sweetAlert.js";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, Building2, Key, ArrowRight } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginContext } = useAuth();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [tokenEmpresa, setTokenEmpresa] = useState("");
  const [mostrarTokenInput, setMostrarTokenInput] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await login({ email, password });

      if (response.status === "Success") {
        showSuccessAlert("¡Bienvenido!", "Inicio de sesión correcto");

        const userData = response.data.user;
        const token = response.data.token;

        if (!userData || !token) {
          throw new Error("La respuesta del login no incluye usuario o token.");
        }

        loginContext(userData, token);
        const redirectTo = location.state?.from?.pathname || "/panel";
        navigate(redirectTo);
      } else {
        showErrorAlert("Error", response.message || response.errorDetails);
      }
    } catch (error) {
      console.error("Error al iniciar sesión: ", error);
      showErrorAlert("Error", "No se pudo conectar al servidor");
    }
  };

  const handleAccesoEmpresa = (e) => {
    e.preventDefault();

    if (!tokenEmpresa.trim()) {
      showErrorAlert("Error", "Por favor ingresa el token de acceso");
      return;
    }

    // Redirigir a la página de acceso de empresa con el token
    navigate(`/empresa/acceso/${tokenEmpresa}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* FORMULARIO DE LOGIN NORMAL */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 transform transition-all hover:scale-105">
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="**********"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300 pr-10"
                />
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

        {/* SEPARADOR */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-blue-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-transparent text-white font-semibold">
              O
            </span>
          </div>
        </div>

        {/* PANEL DE ACCESO EMPRESA */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 transform transition-all hover:scale-105">
          <div className="flex items-center justify-center mb-6">
            <Building2 className="w-8 h-8 text-green-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">
              Acceso Empresas
            </h2>
          </div>

          <p className="text-center text-gray-600 mb-6 text-sm">
            Si eres una empresa y tienes un token de acceso, ingrésalo aquí para
            gestionar prácticas.
          </p>

          {!mostrarTokenInput ? (
            <button
              onClick={() => setMostrarTokenInput(true)}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Key className="w-5 h-5" />
              <span>Ingresar con Token</span>
            </button>
          ) : (
            <form onSubmit={handleAccesoEmpresa} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="token"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Token de Acceso
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="token"
                    value={tokenEmpresa}
                    onChange={(e) => setTokenEmpresa(e.target.value)}
                    placeholder="Ingresa tu token de acceso"
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarTokenInput(false);
                    setTokenEmpresa("");
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <span>Acceder</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
