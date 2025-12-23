import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getTodasLasPlantillas,
  eliminarPlantilla,
} from "../services/formulario.service";
import {
  Edit,
  FileText,
  Settings,
  Loader,
  Eye,
  Plus,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import {
  showSuccessAlert,
  showErrorAlert,
  deleteDataAlert,
} from "../helpers/sweetAlert";

const GestionFormularios = () => {
  const navigate = useNavigate();
  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lista de formularios que NO se pueden borrar
  const protegidos = [
    "postulacion",
    "bitacora",
    "evaluacion_pr1",
    "evaluacion_pr2",
  ];

  // 1. Definimos la función AFUERA para poder usarla en el useEffect y en el handleDelete
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

  // 2. Usamos el efecto solo para llamar a la función
  useEffect(() => {
    cargarDatos();
  }, []);

  // --- FUNCIÓN PARA BORRAR ---
  const handleDelete = async (id, titulo) => {
    deleteDataAlert(async () => {
      try {
        await eliminarPlantilla(id);
        showSuccessAlert(
          "Eliminado",
          `El formulario "${titulo}" ha sido borrado.`
        );
        cargarDatos(); // Ahora sí funciona porque la función está afuera
      } catch (error) {
        showErrorAlert("Error", error.message || "No se pudo eliminar.");
      }
    });
  };

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
          {/*parte izquierda de la pantalla */}
          <div className="flex-1">
            {/*botón nuevo para volver a la página principal del coordinador */}
            <button
              onClick={() => navigate("/panel")}
              className=" bg-blue-600 flex items-center gap-2 text-white px-4 py-2 rounded-lg  hover:bg-blue-700"
            >
              <ArrowLeft size={20} />
              Volver a la página principal
            </button>
          </div>
          {/*parte central de la pantalla */}
          <div className="flex-1 text-center">
            <h1 className="text-3xl font-bold text-gray-800 text-center">
              Gestión de Formularios
            </h1>
            <p className="text-gray-600 mt-1">
              Administra las plantillas y preguntas del sistema.
            </p>
          </div>
          {/*parte derecha de la pantalla */}
          <div className="flex-1 flex justify-end">
            <button
              onClick={() => navigate("/admin/formularios/nuevo")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Plus size={20} /> Nuevo Formulario
            </button>
          </div>
        </div>
        {/* Grid de tarjetas */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plantillas.map((plantilla) => {
            // --- CORRECCIÓN CRÍTICA: Calculamos si es protegido aquí ---
            const esProtegido = protegidos.includes(plantilla.tipo);

            return (
              <div
                key={plantilla.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                    <FileText size={24} />
                  </div>

                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full uppercase ${
                      esProtegido
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {esProtegido ? "Sistema" : plantilla.tipo}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {plantilla.titulo}
                </h3>

                <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                  {plantilla.descripcion || "Sin descripción disponible."}
                </p>

                <div className="flex gap-3">
                  {/* Botón Editar */}
                  <button
                    onClick={() =>
                      navigate(`/admin/formularios/editar/${plantilla.id}`)
                    }
                    className="flex-1 bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Edit size={16} />
                    Editar
                  </button>

                  {/* Botón Preview */}
                  <button
                    onClick={() =>
                      navigate(`/admin/formularios/preview/${plantilla.tipo}`)
                    }
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                    title="Vista Previa"
                  >
                    <Eye size={20} />
                  </button>

                  {/* 🔴 BOTÓN ELIMINAR (Solo si NO es protegido) */}
                  {!esProtegido && (
                    <button
                      onClick={() =>
                        handleDelete(plantilla.id, plantilla.titulo)
                      }
                      className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="Eliminar Formulario"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {plantillas.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No se encontraron plantillas.
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionFormularios;
