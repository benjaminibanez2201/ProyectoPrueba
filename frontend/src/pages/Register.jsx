import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {register} from '../services/auth.service';
import {showErrorAlert, showSuccessAlert} from '../helpers/sweetAlert.js';


const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'alumno', //por defecto
        tipo_practica: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const registerSubmit = async (e) => {//cuando se envia el formulario
        e.preventDefault();

        try {
            const response = await register(formData);
            if (response.status === 'Success') {
                showSuccessAlert('Registro exitoso!', 'Ahora puedes iniciar sesión con tus credenciales');
                setTimeout(() => {navigate('/login');}, 1500);
            } else {
                showErrorAlert('Error', response.message || response.errorDetails);
            }
        } catch (error) {
            console.error('Error en el registro:', error);
            showErrorAlert('Error', 'No se pudo hacer el registro. Por favor, intenta nuevamente');
        }
    };

    return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 w-full max-w-md transform transition-all hover:scale-105">
        
        <form className="space-y-4" onSubmit={registerSubmit}>
          <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-600 mb-6">
            Crea tu cuenta
          </h1>
          
          {/*campo para el nombre*/}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
              Nombre y Apellido
            </label>
            <input
              type="text" id="name" name="name"
              value={formData.name} onChange={handleChange}
              placeholder="Tu nombre y apellido" required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300"
            />
          </div>

          {/*campo para el correo*/}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
              Correo Institucional
            </label>
            <input
              type="email" id="email" name="email"
              value={formData.email} onChange={handleChange}
              placeholder="...@ubb.cl" required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300"
            />
          </div>

          {/*campo para la contraseña*/}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              Contraseña
            </label>
            <input
              type="password" id="password" name="password"
              value={formData.password} onChange={handleChange}
              placeholder="mínimo 6 carac y 1 mayúscula" required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300"
            />
          </div>

          {/*campo para el rol*/}
          <div className="space-y-2">
            <label htmlFor="role" className="block text-sm font-semibold text-gray-700">
              Rol
            </label>
            <select
              id="role" name="role"
              value={formData.role} onChange={handleChange} required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white" 
            >
              <option value="alumno">Alumno</option>
              <option value="coordinador">Coordinador</option>
            </select>
          </div>

          {/*campo para el tipo de practica*/}
          <div className="space-y-2">
            <label htmlFor="tipo_practica" className="block text-sm font-semibold text-gray-700">
              Tipo de Práctica (solo alumnos)
            </label>
            <input
              type="text" id="tipo_practica" name="tipo_practica"
              value={formData.tipo_practica} onChange={handleChange}
              placeholder="Ej: Profesional I / II"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 mt-4"
          >
            Registrarse
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          ¿Ya tienes una cuenta? 
          <Link to="/login" className="text-blue-600 hover:underline font-semibold ml-1">
            Inicia sesión aquí
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
