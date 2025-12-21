import React, { useState, useEffect } from "react";
import {
  Upload,
  Trash2,
  FileText,
  X,
  Layout,
  FolderOpen,
  AlertCircle,
  Eye,
} from "lucide-react";
import instance from "../services/root.service.js";
import { useNavigate } from "react-router-dom";

const GestionRecursosModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  // Estado de las pestañas
  const [activeTab, setActiveTab] = useState("archivos"); // 'archivos' o 'plantillas'

  // Datos
  const [recursos, setRecursos] = useState([]);
  const [plantillas, setPlantillas] = useState([]);

  // Estado para subida de archivos
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      fetchRecursos();
      fetchPlantillas();
      setError(null);
      setFile(null);
    }
  }, [isOpen]);

  // --- FUNCIONES DE API ---

  const fetchRecursos = async () => {
    try {
      const res = await instance.get("/recursos");
      // Asumimos que el backend devuelve { data: [...] }
      setRecursos(res.data.data || res.data);
    } catch (err) {
      console.error("Error al cargar recursos:", err);
    }
  };

  const fetchPlantillas = async () => {
    try {
      const res = await instance.get("/formularios/plantillas");
      setPlantillas(res.data.data || res.data);
    } catch (err) {
      console.error(
        "Error al cargar plantillas. Tal vez la ruta no existe aún.",
        err
      );
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    // 'file' debe coincidir con uploadMiddleware.single('file') del backend
    formData.append("file", file);
    formData.append("nombre", file.name);

    try {
      await instance.post("/recursos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      fetchRecursos(); // Recargar la lista
    } catch (err) {
      console.error(err);
      setError("Error al subir el archivo. Revisa el tamaño o formato.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteRecurso = async (id) => {
    if (
      !confirm(
        "¿Estás seguro de borrar este archivo? Los alumnos ya no podrán descargarlo."
      )
    )
      return;

    try {
      await instance.delete(`/recursos/${id}`);
      fetchRecursos();
    } catch (err) {
      console.error("Error al eliminar:", err);
      setError("No se pudo eliminar el archivo.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
        {/* --- CABECERA --- */}
        <div className="bg-gradient-to-r from-purple-700 to-purple-900 p-5 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <FolderOpen size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl">Biblioteca Central</h3>
              <p className="text-purple-200 text-xs">
                Gestiona lo que ven los alumnos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* --- PESTAÑAS --- */}
        <div className="flex border-b border-gray-200 bg-gray-50 shrink-0">
          <button
            onClick={() => setActiveTab("archivos")}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all relative
                            ${
                              activeTab === "archivos"
                                ? "text-purple-700 bg-white"
                                : "text-gray-500 hover:text-purple-600 hover:bg-gray-100"
                            }`}
          >
            <FileText size={18} />
            Archivos y Pautas
            {activeTab === "archivos" && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-700 rounded-t-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("plantillas")}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all relative
                            ${
                              activeTab === "plantillas"
                                ? "text-orange-600 bg-white"
                                : "text-gray-500 hover:text-orange-600 hover:bg-gray-100"
                            }`}
          >
            <Layout size={18} />
            Formularios Digitales
            {activeTab === "plantillas" && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 rounded-t-full"></div>
            )}
          </button>
        </div>

        {/* --- CONTENIDO --- */}
        <div className="p-6 overflow-y-auto grow bg-gray-50/50">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm flex items-center gap-2 border border-red-200">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* --- TAB 1: SUBIR ARCHIVOS --- */}
          {activeTab === "archivos" && (
            <div className="space-y-6">
              {/* Zona de Carga */}
              <div className="bg-white border border-purple-100 rounded-xl p-5 shadow-sm">
                <h4 className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
                  <Upload size={16} /> Subir Nuevo Documento
                </h4>
                <form
                  onSubmit={handleUpload}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 border border-gray-200 rounded-lg cursor-pointer bg-white py-2"
                  />
                  <button
                    type="submit"
                    disabled={!file || isUploading}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-bold transition shadow-md whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    {isUploading ? "Subiendo..." : "Subir"}
                  </button>
                </form>
                <p className="text-xs text-gray-400 mt-2 ml-1">
                  Formatos permitidos: PDF, Word, Excel, ZIP. (Máx 10MB)
                </p>
              </div>

              {/* Lista */}
              <div>
                <h4 className="font-bold text-gray-700 mb-3 ml-1 text-sm uppercase tracking-wide">
                  Documentos Disponibles
                </h4>
                <div className="space-y-2">
                  {recursos.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-purple-50 p-3 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">
                            {rec.nombre}
                          </p>
                          <p className="text-xs text-gray-500">
                            Subido el{" "}
                            {new Date(rec.fecha_subida).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteRecurso(rec.id)}
                        className="text-gray-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition"
                        title="Eliminar archivo"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {recursos.length === 0 && (
                    <div className="text-center py-10 text-gray-400 bg-white rounded-xl border-2 border-dashed border-gray-200">
                      <p>No hay documentos subidos aún.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 2: VER PLANTILLAS --- */}
          {activeTab === "plantillas" && (
            <div className="space-y-4">
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                <p className="text-sm text-orange-800">
                  Estos son los formularios activos. Para editarlos, ve a la
                  sección <strong>"Formularios"</strong> del dashboard.
                </p>
              </div>

              <div className="grid gap-3">
                {plantillas.map((plantilla) => (
                  <div
                    key={plantilla.id}
                    className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
                  >
                    <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
                      <Layout size={24} />
                    </div>
                    <div className="grow">
                      <h5 className="font-bold text-gray-800">
                        {plantilla.titulo}
                      </h5>
                      {/* Badge dinámico según el tipo */}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          plantilla.tipo === "sistema"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {plantilla.tipo || "Personalizado"}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        onClose(); // Cerramos el modal primero para que no estorbe
                        // Usamos la ruta exacta que usa tu compañero
                        navigate(
                          `/admin/formularios/preview/${plantilla.tipo}`
                        );
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-blue-600 transition"
                      title="Vista Previa"
                    >
                      <Eye size={20} />
                    </button>
                  </div>
                ))}
                {plantillas.length === 0 && (
                  <div className="text-center py-10 text-gray-400 bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <p>No has creado plantillas de formulario.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GestionRecursosModal;
