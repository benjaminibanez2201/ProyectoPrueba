import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FormRender from "../components/FormRender";
import { getPlantilla } from "../services/formulario.service";
import { ArrowLeft } from "lucide-react";

const VistaPrevia = () => {
  const { tipo } = useParams(); // Leemos el tipo desde la URL
  const navigate = useNavigate();
  const [plantilla, setPlantilla] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        // Pedimos la plantilla específica (postulacion, bitacora, etc.)
        const data = await getPlantilla(tipo);
        setPlantilla(data);
      } catch (error) {
        console.error("Error cargando vista previa", error);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [tipo]);

  if (loading) return <div className="p-10 text-center">Cargando vista previa...</div>;
  if (!plantilla) return <div className="p-10 text-center text-red-500">Formulario no encontrado</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Botón Volver */}
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={20} />
          Volver a Gestión
        </button>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded shadow-sm">
          <p className="text-yellow-800 font-medium">
                Modo Vista Previa: Así es como verán el formulario los usuarios.
          </p>
        </div>

        {/* Renderizamos el formulario en modo Solo Lectura */}
        <FormRender 
          esquema={plantilla.esquema} 
          titulo={plantilla.titulo}
          readOnly={true} // <--- IMPORTANTE: Bloqueado
          onSubmit={() => {}} // No hace nada
          userType="coordinador" // Para que vea todos los campos
        />
      </div>
    </div>
  );
};

export default VistaPrevia;