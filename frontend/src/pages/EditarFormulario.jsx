import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FormEditor from "../components/FormEditor"; // El componente que acabas de crear
import { getPlantilla, actualizarPlantilla } from "../services/formulario.service"; // Tus servicios
import { showSuccessAlert, showErrorAlert } from "../helpers/sweetAlert";

const EditarFormulario = () => {
  const { id } = useParams(); // Obtenemos el ID de la URL
  const navigate = useNavigate();
  
  const [plantilla, setPlantilla] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Cargar la plantilla existente al iniciar
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // OJO: Aquí tu servicio getPlantilla usaba el "tipo", pero para editar
        // necesitamos buscar por ID o asegurarnos de tener el endpoint correcto.
        // Si tu backend tiene "getById", úsalo. Si no, usaremos la lista y filtraremos (temporalmente)
        // O mejor: Asumimos que 'getPlantilla' puede recibir ID si ajustamos el servicio.
        
        // OPCIÓN ROBUSTA: Usamos getTodasLasPlantillas y filtramos por ID (más seguro por ahora)
        const { getTodasLasPlantillas } = await import("../services/formulario.service");
        const todas = await getTodasLasPlantillas();
        const encontrada = todas.find(p => p.id === Number(id));
        
        if (encontrada) {
            setPlantilla(encontrada);
        } else {
            showErrorAlert("Error", "Plantilla no encontrada");
            navigate("/admin/formularios");
        }
      } catch (error) {
        console.error(error);
        showErrorAlert("Error", "No se pudo cargar la plantilla");
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [id, navigate]);

  // 2. Función que se ejecuta cuando el usuario da clic en "Guardar" en el Editor
  const guardarCambios = async (nuevoEsquema) => {
    try {
      // Preparamos los datos para enviar al backend
      const datosActualizados = {
        titulo: plantilla.titulo,
        descripcion: plantilla.descripcion,
        esquema: nuevoEsquema // <--- AQUÍ VA LA MAGIA (Las nuevas preguntas)
      };

      await actualizarPlantilla(id, datosActualizados);
      
      showSuccessAlert("¡Guardado!", "El formulario se actualizó correctamente.");
      navigate("/admin/formularios"); // Volvemos a la lista
    } catch (error) {
      showErrorAlert("Error", "Falló el guardado del formulario.");
    }
  };

  if (loading) return <div className="p-10 text-center">Cargando editor...</div>;
  if (!plantilla) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Editando: {plantilla.titulo}</h1>
          <p className="text-gray-500">Agrega, elimina o modifica las preguntas de este formulario.</p>
        </div>

        {/* Renderizamos el Editor y le pasamos el esquema actual */}
        <FormEditor 
            esquemaInicial={plantilla.esquema} 
            onSave={guardarCambios}
            onCancel={() => navigate("/admin/formularios")}
        />
      </div>
    </div>
  );
};

export default EditarFormulario;