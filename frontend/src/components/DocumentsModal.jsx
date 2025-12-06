import React from 'react';
import { X, FileText, Download,Trash2 } from 'lucide-react';

const DocumentsModal = ({ isOpen, onClose, studentName, documents, onDelete }) => {
  if (!isOpen) return null;

  // URL Base para los links
  const API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api';
  const BASE_URL = API_URL.replace('/api', '');

  return (
    // 1. El Fondo Oscuro (Overlay)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      
      {/* 2. La Caja Blanca (El Modal) */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        
        {/* Encabezado */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-blue-200">
          <h3 className="text-lg font-bold text-gray-800">
            Documentos de {studentName}
          </h3>
          <button 
            onClick={onClose}
            className="text-blue-100 hover:text-white hover:bg-blue-500 p-1 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lista de Documentos */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {documents.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay documentos.</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <a
                  key={doc.id}
                  href={`${BASE_URL}/uploads/${doc.ruta_archivo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-white p-2 rounded-md shadow-sm text-blue-500">
                      <FileText size={20} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-gray-700 text-sm truncate">
                        {doc.tipo}
                      </span>
                      <span className="text-xs text-gray-400">
                        Click para ver
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-gray-300 group-hover:text-blue-600 transition-colors">
                    <Download size={18} />
                  </div>
                  {onDelete && (
                      <button
                        onClick={(e) => {
                          e.preventDefault(); // Evita que se abra el enlace de descarga
                          e.stopPropagation();
                          onDelete(doc.id,doc.es_respuesta_formulario); // Llamamos a la función
                        }}
                        className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors z-10"
                        title="Eliminar documento"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Pie del Modal */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentsModal;