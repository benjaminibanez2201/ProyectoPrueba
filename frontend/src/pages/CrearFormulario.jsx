import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormEditor from "../components/FormEditor"; 
import { crearPlantilla } from "../services/formulario.service";
import { showSuccessAlert, showErrorAlert } from "../helpers/sweetAlert";

const CrearFormulario = () => {
  const navigate = useNavigate();
  
  // Metadatos del formulario
  const [meta, setMeta] = useState({
    titulo: "",
    descripcion: "",
    tipo: "" // IMPORTANTE: Este es el ID interno (ej: "encuesta_final")
  });

  const handleMetaChange = (e) => {
    setMeta({ ...meta, [e.target.name]: e.target.value });
  };

  // Cuando le den a "Guardar" en el Editor
  const handleSave = async (esquemaPreguntas) => {
    // Validaciones básicas
    if (!meta.titulo || !meta.tipo) {
      showErrorAlert("Faltan datos", "Debes ponerle un Título y un Código Único al formulario.");
      return;
    }

    try {
      const datosParaEnviar = {
        ...meta,
        esquema: esquemaPreguntas
      };

      await crearPlantilla(datosParaEnviar);
      showSuccessAlert("¡Creado!", "El nuevo formulario ya está disponible.");
      navigate("/admin/formularios");
    } catch (error) {
      showErrorAlert("Error", error.message || "No se pudo crear.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Crear Nuevo Formulario</h1>
        
        {/* --- DATOS BÁSICOS DEL FORMULARIO --- */}
        <div className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Configuración General</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">Título del Formulario *</label>
              <input 
                name="titulo"
                type="text" 
                placeholder="Ej: Encuesta de Satisfacción 2024"
                className="w-full p-2 border rounded"
                value={meta.titulo}
                onChange={handleMetaChange}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">Código Único (Sin espacios) *</label>
              <input 
                name="tipo"
                type="text" 
                placeholder="Ej: encuesta_2024"
                className="w-full p-2 border rounded bg-gray-50 font-mono text-sm"
                value={meta.tipo}
                onChange={(e) => setMeta({ ...meta, tipo: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
              />
              <p className="text-xs text-gray-400 mt-1">Este código sirve para identificarlo en el sistema.</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-600 mb-1">Descripción</label>
              <textarea 
                name="descripcion"
                placeholder="Breve explicación de para qué sirve este formulario..."
                className="w-full p-2 border rounded"
                rows={2}
                value={meta.descripcion}
                onChange={handleMetaChange}
              />
            </div>
          </div>
        </div>

        {/* --- EL EDITOR DE PREGUNTAS (REUTILIZADO) --- */}
        <FormEditor 
            esquemaInicial={[]} // Empieza vacío
            onSave={handleSave}
            onCancel={() => navigate("/admin/formularios")}
        />
      </div>
    </div>
  );
};

export default CrearFormulario;