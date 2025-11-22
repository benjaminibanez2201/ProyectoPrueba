import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTodasLasPlantillas } from "../services/formulario.service";
import { Edit, FileText, Settings, Loader } from "lucide-react";

const GestionFormularios = () => {
  const navigate = useNavigate();
  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Cargar la lista al iniciar
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const data = await getTodasLasPlantillas();
        setPlantillas(data);
      } catch (error) {
        console.error("Error al cargar plantillas:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Encabezado */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Formularios</h1>
            <p className="text-gray-600 mt-1">Administra las plantillas y preguntas del sistema.</p>
          </div>
          {/* Botón para crear nuevo (Opcional, por ahora nos centramos en editar los existentes) */}
          {/* <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
            <Plus size={20} /> Nuevo Formulario
          </button> */}
        </div>

        {/* Grid de Tarjetas */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plantillas.map((plantilla) => (
            <div 
              key={plantilla.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                  <FileText size={24} />
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full uppercase">
                  {plantilla.tipo}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">{plantilla.titulo}</h3>
              <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                {plantilla.descripcion || "Sin descripción disponible."}
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={() => navigate(`/admin/formularios/editar/${plantilla.id}`)}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                >
                  <Edit size={16} />
                  Editar
                </button>
                {/* Botón para probar cómo se ve (Preview) */}
                <button 
                  // USAMOS plantilla.tipo PARA IR AL FORMULARIO CORRECTO
                  onClick={() => navigate(`/admin/formularios/preview/${plantilla.tipo}`)} 
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                  title="Vista Previa"
                >
                  <Settings size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {plantillas.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No se encontraron plantillas. Asegúrate de haber ejecutado el Seeder.
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionFormularios;