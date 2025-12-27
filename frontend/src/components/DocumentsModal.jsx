import React from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  FileText,
  Download,
  Trash2,
  Eye,
  Folder,
  Calendar,
} from "lucide-react";

const DocumentsModal = ({
  isOpen,
  onClose,
  studentName,
  documents,
  onDelete,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // URL Base para los links
  const API_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000/api";
  const BASE_URL = API_URL.replace("/api", "");

  // Función para formatear el tipo de documento con tildes
  const formatTipoDocumento = (tipo) => {
    const formatos = {
      bitacora: "Bitácora",
      Bitacora: "Bitácora",
      curriculum: "Currículum",
      Curriculum: "Currículum",
      evaluacion: "Evaluación",
      Evaluacion: "Evaluación",
      evaluacion_pr1: "Evaluación PR1",
      evaluacion_pr2: "Evaluación PR2",
      informe: "Informe",
      Informe: "Informe",
    };
    return formatos[tipo] || tipo;
  };

  // Función para obtener color según tipo de documento
  // Todos los archivos en azul (bitácoras, informes, etc.)
  const getDocumentStyle = () => {
    return "bg-blue-100 text-blue-600 border-blue-200";
  };

  return (
    // Overlay con blur
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Folder className="text-white" size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Documentos</h3>
                <p className="text-indigo-200 text-sm">{studentName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Lista de Documentos */}
        <div className="p-5 max-h-[60vh] overflow-y-auto bg-gray-50">
          {documents.length === 0 ? (
            <div className="text-center py-10">
              <Folder className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500 font-medium">
                No hay documentos registrados
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Los archivos aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const isBitacora = doc.es_respuesta_formulario;
                const docStyle = getDocumentStyle(doc);

                const commonClasses =
                  "flex items-center justify-between p-4 rounded-xl border-2 bg-white hover:shadow-lg transition-all duration-200 group w-full text-left cursor-pointer";

                const innerContent = (
                  <>
                    <div className="flex items-center gap-4 overflow-hidden flex-1">
                      {/* Icono del documento */}
                      <div className={`p-3 rounded-xl ${docStyle}`}>
                        <FileText size={22} />
                      </div>

                      {/* Info del documento */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-semibold text-gray-800 truncate">
                          {formatTipoDocumento(doc.tipo)}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                          <Calendar size={12} />
                          <span>
                            {doc.fecha_envio || doc.fecha_creacion
                              ? new Date(
                                  doc.fecha_envio || doc.fecha_creacion
                                ).toLocaleDateString()
                              : "Sin fecha"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Botón de acción principal - Azul para todos */}
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                        {isBitacora ? (
                          <Eye size={18} />
                        ) : (
                          <Download size={18} />
                        )}
                      </div>

                      {/* Botón Eliminar */}
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onClose();
                            onDelete(doc.id, isBitacora);
                          }}
                          className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors z-10"
                          title="Eliminar documento"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </>
                );

                // Renderizado condicional - Todos con borde azul
                if (isBitacora) {
                  return (
                    <div
                      key={doc.id}
                      className={`${commonClasses} border-blue-100 hover:border-blue-300`}
                      onClick={() => {
                        onClose();
                        navigate(`/revision-formulario/${doc.id}`);
                      }}
                    >
                      {innerContent}
                    </div>
                  );
                } else {
                  return (
                    <a
                      key={doc.id}
                      href={`${BASE_URL}/uploads/${doc.ruta_archivo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${commonClasses} border-blue-100 hover:border-blue-300`}
                    >
                      {innerContent}
                    </a>
                  );
                }
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 bg-white flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {documents.length}{" "}
            {documents.length === 1 ? "documento" : "documentos"}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm hover:shadow"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentsModal;
