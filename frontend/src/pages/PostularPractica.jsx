import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormRender from "../components/FormRender";
import { getPlantilla } from "../services/formulario.service.js";
import { postularPractica } from "../services/practica.service.js"; 
import { showSuccessAlert, showErrorAlert } from "../helpers/sweetAlert.js";
import { useAuth } from "../context/AuthContext";

const PostularPractica = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plantilla, setPlantilla] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Cargar la plantilla al iniciar
  useEffect(() => {
    const cargarFormulario = async () => {
      try {
        const data = await getPlantilla("postulacion");
        setPlantilla(data);
      } catch (error) {
        showErrorAlert(
          "Error",
          "No se pudo cargar el formulario de postulación."
        );
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    cargarFormulario();
  }, []);

  // 2. Pre-llenar datos del alumno (Auto-fill)
  // Creamos un objeto con los datos que ya sabemos del usuario
  const valoresIniciales = {
    nombre_alumno: user.name,
    correo_alumno: user.email,
    // Aquí podrías agregar más si los tienes en el usuario (rut, carrera, etc.)
  };

  // 3. Manejar el envío del formulario
  const handleSubmit = async (respuestas) => {
    try {
      // Aquí combinamos las respuestas del formulario dinámico con la lógica de negocio de "crear práctica"

      // Mapeamos los campos del formulario a lo que espera tu backend (practica.service)
      const datosParaBackend = {
        nombreEmpresa: respuestas.nombre_empresa,
        emailEmpresa: respuestas.correo_supervisor, 
        nombreRepresentante: respuestas.nombre_supervisor,
        datosFormulario: respuestas,
      };

      await postularPractica(datosParaBackend);

      showSuccessAlert(
        "¡Éxito!",
        "Tu postulación ha sido enviada correctamente."
      );
      navigate("/panel"); // Volver al panel del alumno
    } catch (error) {
      showErrorAlert("Error", "No se pudo enviar la postulación.");
    }
  };

  if (loading)
    return <div className="p-12 text-center">Cargando formulario...</div>;
  if (!plantilla)
    return (
      <div className="p-12 text-center text-red-500">
        Error al cargar la plantilla.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <FormRender
        esquema={plantilla.esquema}
        valores={valoresIniciales}
        onSubmit={handleSubmit}
        userType="alumno"
        titulo={plantilla.titulo} 
      />
    </div>
  );
};

export default PostularPractica;
