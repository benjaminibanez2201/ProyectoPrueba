import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/auth.service";
import { showErrorAlert, showSuccessAlert } from "../helpers/sweetAlert.js";
import { CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "alumno", //por defecto
    tipo_practica: "",
  });
  //ojo de la contraseña
  const [showPassword, setShowPassword] = useState(false);
  // ojo de la confirmación
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //para validacion de contraseña
  const [validationState, setValidationState] = useState({
    minLength: false,
    uppercase: false,
    number: false,
  });

  useEffect(() => {
    const password = formData.password;

    // Revisa las reglas y actualiza el estado de validación
    setValidationState({
      minLength: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
    });
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => {
      // Creamos una copia de los datos anteriores
      const updatedFormData = {
        ...prevFormData,
        [name]: value,
      };

      // Si el campo que acaba de cambiar es 'role' Y el nuevo valor NO es 'alumno'
      if (name === "role" && value !== "alumno") {
        // Reseteamos el valor de 'tipo_practica'
        updatedFormData.tipo_practica = "";
      }

      return updatedFormData;
    });
  };

  const registerSubmit = async (e) => {
    //cuando se envia el formulario
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showErrorAlert("Error", "Las contraseñas no coinciden");
      return; //asi no se envia el formulario
    }

    try {
      const dataToSend = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        tipo_practica: formData.tipo_practica,
      };
      const response = await register(dataToSend);
      if (response.status === "Success") {
        showSuccessAlert(
          "Registro exitoso!",
          "Ahora puedes iniciar sesión con tus credenciales"
        );
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        // 1. Tomamos la lista de errores del backend
        const errorList = response.errors;

        if (errorList && Array.isArray(errorList)) {
          // 2. Unimos todos los errores en una sola cadena con saltos de línea
          const formattedErrors = errorList.join("<br/>");

          // 3. Mostramos la lista completa al usuario
          showErrorAlert("Error de Validación", formattedErrors);
        } else {
          showErrorAlert("Error", response.message || "Error desconocido.");
        }
      }
    } catch (error) {
      console.error("Error en el registro:", error);
      showErrorAlert(
        "Error",
        "No se pudo hacer el registro. Por favor, intenta nuevamente"
      );
    }
  };

  // (Esto es solo para no repetir código HTML)
  const ValidationCheck = ({ isMet, text }) => (
    <li
      className={`flex items-center text-sm ${
        isMet ? "text-green-600" : "text-gray-500"
      }`}
    >
      {isMet ? (
        <CheckCircle size={16} className="mr-2 flex-shrink-0" />
      ) : (
        <XCircle size={16} className="mr-2 flex-shrink-0" />
      )}
      {text}
    </li>
  );

  // --- NUEVA LÓGICA DE VALIDACIÓN DE MATCH CONTRASEÑA ---
  const passwordsMatch = formData.password === formData.confirmPassword;
  const shouldShowMatchCheck =
    formData.confirmPassword.length > 0 && formData.password.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 w-full max-w-md transform transition-all hover:scale-105">
        <form className="space-y-4" onSubmit={registerSubmit}>
          <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-600 mb-6">
            Crea tu cuenta
          </h1>

          {/* --- CAMPO NOMBRE --- */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700"
            >
              Nombre Completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Tus nombres y apellidos"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300"
            />
          </div>

          {/* --- CAMPO EMAIL --- */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700"
            >
              Correo Institucional
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="...@ubb.cl"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300"
            />
          </div>

          {/* --- CAMPO CONTRASEÑA (CON VALIDADOR) --- */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700"
            >
              Contraseña
            </label>
            <div className="relative">
              {/* Input y botón del ojo */}
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
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

            {/* LISTA DE VALIDACIÓN */}
            {/* Solo se muestra si el usuario ha empezado a escribir */}
            {formData.password.length > 0 && (
              <ul className="mt-2 space-y-1 pl-1">
                <ValidationCheck
                  isMet={validationState.minLength}
                  text="Mínimo 6 caracteres"
                />
                <ValidationCheck
                  isMet={validationState.uppercase}
                  text="Al menos una mayúscula (A-Z)"
                />
                <ValidationCheck
                  isMet={validationState.number}
                  text="Al menos un número (0-9)"
                />
              </ul>
            )}
          </div>

          {/* --- CAMPO CONFIRMAR CONTRASEÑA --- */}
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-gray-700"
            >
              Confirmar Contraseña
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"} 
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="**********"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-blue-600"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {shouldShowMatchCheck && (
              <ul className="mt-2 space-y-1 pl-1">
                <ValidationCheck
                  isMet={passwordsMatch}
                  text={
                    passwordsMatch
                      ? " ¡Contraseñas coinciden!"
                      : " Las contraseñas no coinciden"
                  }
                />
              </ul>
            )}
          </div>

          {/* --- CAMPO ROL --- */}
          <div className="space-y-2">
            <label
              htmlFor="role"
              className="block text-sm font-semibold text-gray-700"
            >
              Rol
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white"
            >
              <option value="alumno">Alumno</option>
              <option value="coordinador">Coordinador</option>
            </select>
          </div>

          {/* --- CAMPO TIPO PRÁCTICA --- */}
          {formData.role === "alumno" && (
            <div className="space-y-2">
              <label
                htmlFor="tipo_practica"
                className="block text-sm font-semibold text-gray-700"
              >
                Tipo de Práctica
              </label>
              <select
                id="tipo_practica"
                name="tipo_practica"
                value={formData.tipo_practica}
                onChange={handleChange}
                required // Requerido si eres alumno
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white"
              >
                {/* Opción deshabilitada que actúa como placeholder */}
                <option value="" disabled>
                  Selecciona tu práctica...
                </option>
                <option value="Profesional I">Profesional I</option>
                <option value="Profesional II">Profesional II</option>
              </select>
            </div>
          )}

          {/* --- Botón de Submit y Link a Login --- */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 mt-4"
          >
            Registrarse
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          ¿Ya tienes una cuenta?
          <Link
            to="/login"
            className="text-blue-600 hover:underline font-semibold ml-1"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
