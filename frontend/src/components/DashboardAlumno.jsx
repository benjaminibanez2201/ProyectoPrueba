import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Activity, Send, PlusCircle, Ticket, Info, AlertCircle, Mail, Clock, AlertTriangle, CheckCircle2, Flag, ClipboardCheck, Lock } from "lucide-react";
import { getMyPractica, postularPractica } from "../services/practica.service.js";
import { showErrorAlert, showSuccessAlert, deleteDataAlert } from "../helpers/sweetAlert.js";
import DocumentsModal from "./DocumentsModal";
import { deleteDocumento } from "../services/documento.service.js";


// --- 1. BADGE CORREGIDO (Separamos color de texto) ---
const EstadoBadge = ({ estado }) => {
  
  // A. Diccionario de Textos (Lo que lee el usuario)
  const labels = {
    pendiente: "Pendiente (Empresa no inscrita)",
    enviada_a_empresa: "Enviado a Empresa",
    pendiente_validacion: "Pendiente Validación",
    rechazada: "Observada / Rechazada",
    en_curso: "En Curso",
    finalizada: "Finalizada",
    evaluada: "Evaluada por Empresa",
    cerrada: "Cerrada"
  };

  // 2. Mapeo de Íconos Lucide
  const icons = {
    pendiente: AlertCircle,
    enviada_a_empresa: Mail,
    pendiente_validacion: Clock,
    rechazada: AlertTriangle,
    en_curso: Activity, // O CheckCircle2 si prefieres
    finalizada: Flag,
    evaluada: ClipboardCheck,
    cerrada: Lock
  };

  // 3. Colores (Mantenemos los que ya te gustaban)
  const colors = {
    pendiente: "bg-gray-100 text-gray-700 border-gray-200",
    enviada_a_empresa: "bg-blue-50 text-blue-700 border-blue-200",
    pendiente_validacion: "bg-purple-50 text-purple-700 border-purple-200",
    rechazada: "bg-red-50 text-red-700 border-red-200",
    en_curso: "bg-green-50 text-green-700 border-green-200",
    finalizada: "bg-yellow-50 text-yellow-800 border-yellow-200",
    evaluada: "bg-orange-50 text-orange-800 border-orange-200",
    cerrada: "bg-gray-800 text-white border-gray-600"
  };

  // Lógica para elegir el ícono y texto
  const IconComponent = icons[estado] || AlertCircle;
  const textoFallback = estado ? estado.charAt(0).toUpperCase() + estado.slice(1).replace(/_/g, ' ') : 'Desconocido';

  return (
    <span className={`
      inline-flex items-center gap-1.5 
      px-3 py-1.5 rounded-md border text-xs font-semibold mb-1
      ${colors[estado] || "bg-gray-100 text-gray-800"}
    `}>
      {/* Renderizamos el ícono con un tamaño pequeñito (size={14}) */}
      <IconComponent size={14} className="shrink-0" />
      
      {/* El texto */}
      <span>{labels[estado] || textoFallback}</span>
    </span>
  );
};

// --- 2. FUNCIÓN PARA EL MENSAJE DE AYUDA ---
const getMensajeAyuda = (estado) => {
  switch (estado) {
    case 'enviada_a_empresa': return "Tu solicitud fue enviada. Esperando que tu supervisor ingrese.";
    case 'pendiente_validacion': return "La empresa firmó. Ahora el coordinador debe aprobar.";
    case 'rechazada': return "Hay observaciones. Revisa y corrige tu postulación.";
    case 'en_curso': return "¡Tu práctica está activa! Recuerda subir tus bitácoras.";
    case 'finalizada': return "Has finalizado el periodo. Sube tu informe final.";
    case 'evaluada': return "La empresa te evaluó. Esperando cierre del profesor.";
    case 'cerrada': return "Proceso cerrado exitosamente.";
    default: return "Estado de tu solicitud.";
  }
};

const DashboardAlumno = ({ user }) => {
  const navigate = useNavigate();
  const [practica, setPractica] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDocsModal, setShowDocsModal] = useState(false);

  const fetchMiPractica = useCallback(async () => {
    setIsLoading(true);
    try {
      const miPractica = await getMyPractica();
      setPractica(miPractica);
    } catch (err) {
      if (err.status !== 401) {
        console.log("No se pudo cargar estado o no tiene práctica");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMiPractica();
  }, [fetchMiPractica]);

  const handleDeleteDocumento = async (id) => {
    deleteDataAlert(async () => {
      try {
        const response = await deleteDocumento(id);
        if (response.status === 'Success') {
          showSuccessAlert('Eliminado', 'El documento ha sido eliminado.');
          fetchMiPractica(); 
        } else {
          showErrorAlert('Error', response.message);
        }
      } catch (error) {
        showErrorAlert('Error', 'No se pudo eliminar el documento.');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-gray-600">Cargando información...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-green-100">

        {/* HEADER */}
        <div className="mb-8">
          <h2 className="text-4xl font-extrabold text-green-700 mb-2">
            Panel del Alumno
          </h2>
          <p className="text-gray-600">
            Bienvenido, <span className="font-semibold">{user.name}</span>.
            Gestiona tu proceso de práctica profesional aquí.
          </p>
        </div>

        {/* GRID DE TARJETAS */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* TARJETA 1: ESTADO */}
          <div className="bg-green-50 p-6 rounded-xl shadow-inner border border-green-100 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4">
                <Activity className="text-green-600" size={32} />
                {!practica && <PlusCircle className="text-blue-500" size={24} />}
              </div>
              <h3 className="text-lg font-bold text-green-800 mb-2">Estado Actual</h3>

              {practica ? (
                <div className="mt-2">
                  <EstadoBadge estado={practica.estado} />
                  
                  {/* 👇 AQUÍ USAMOS EL MENSAJE DINÁMICO */}
                  <p className="text-xs text-gray-500 mt-2">
                    {getMensajeAyuda(practica.estado)}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    No tienes ninguna práctica inscrita actualmente.
                  </p>
                  <button
                    onClick={() => navigate("/postular")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <Send size={16} />
                    Inscribir Práctica
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* TARJETA 2: SUBIR DOCUMENTOS */}
          <div className={`bg-green-50 p-6 rounded-xl shadow-inner border border-green-100 transition ${!practica ? 'opacity-60 grayscale' : 'hover:shadow-md'}`}>
            <Upload className="text-green-600 mb-3" size={32} />
            <h3 className="text-lg font-bold text-green-800">Subir Documentos</h3>
            <p className="text-gray-600 text-sm mt-1">
              Envía tus informes y certificados (RF6)
            </p>
            <button
              disabled={!practica}
              onClick={() => {
                navigate('/upload-document', { state: { practicaId: practica?.id } });
              }}
              className="mt-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg w-full"
            >
              Subir Archivos
            </button>
          </div>

          {/* TARJETA 3: HISTORIAL */}
          <div className={`bg-green-50 p-6 rounded-xl shadow-inner border border-green-100 transition ${!practica ? 'opacity-60 grayscale' : 'hover:shadow-md'}`}>
            <FileText className="text-green-600 mb-3" size={32} />
            <h3 className="text-lg font-bold text-green-800">Documentos</h3>
            <p className="text-gray-600 text-sm mt-1">
              Consulta tus entregas registradas.
            </p>
            <button
              disabled={!practica}
              onClick={() => setShowDocsModal(true)}
              className="mt-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg w-full"
            >
              Ver Mis Archivos
            </button>
          </div>
        </div>

        {/* TOKEN INFO (Solo visible si ya envió a empresa y no ha terminado) */}
        {practica && practica.empresaToken && practica.estado !== 'finalizada' && practica.estado !== 'cerrada' && (
          <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border-2 border-dashed border-green-200">
            <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Ticket size={20} /> Token para tu Empresa
              <div className="relative group">
                <Info size={18} className="text-gray-500 hover:text-gray-700 cursor-pointer" />
                <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 hidden group-hover:block w-64 p-3 text-sm bg-gray-800 text-white rounded-lg shadow-lg z-50">
                  Si a tu supervisor no le llega el correo o se pierde, entrégale este token. 
                  Lo necesitará para ingresar al sistema y completar tu formulario de postulación y evaluación.
                </div>
              </div>
            </h3>
            <div className="bg-gray-100 text-gray-800 font-mono text-lg p-4 rounded text-center border border-gray-300 select-all">
              {practica.empresaToken.token}
            </div>
          </div>
        )}

        {/* Modal */}
        {practica && (
          <DocumentsModal
            isOpen={showDocsModal}
            onClose={() => setShowDocsModal(false)}
            studentName="la práctica"
            documents={practica.documentos || []}
            onDelete={handleDeleteDocumento}
          />
        )}

      </div>
    </div>
  );
};

export default DashboardAlumno;