import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileText,
  Activity,
  Send,
  PlusCircle,
  Ticket,
  Info,
  AlertCircle,
  Mail,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Flag,
  ClipboardCheck,
  Lock,
  FileCheck,
  Download,
  BookOpen,
  Check,
} from "lucide-react";
import {
  getMyPractica,
  finalizarPractica,
} from "../services/practica.service.js";
import {
  showErrorAlert,
  showSuccessAlert,
  deleteDataAlert,
} from "../helpers/sweetAlert.js";
import DocumentsModal from "./DocumentsModal";
import { deleteDocumento } from "../services/documento.service.js";
import { deleteBitacora } from "../services/formulario.service.js";
import instance from "../services/root.service.js";
// BADGE
const EstadoBadge = ({ estado }) => {
  // Si no hay estado (ej. no tiene práctica), mostramos "Sin Inscripción"
  if (!estado)
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-semibold bg-gray-100 text-gray-500 border-gray-200">
        <AlertCircle size={14} /> <span>Sin Inscripción</span>
      </span>
    );

  const labels = {
    pendiente: "Pendiente (Empresa no inscrita)",
    enviada_a_empresa: "Enviado a Empresa",
    pendiente_validacion: "Pendiente Validación",
    rechazada: "Observada / Rechazada",
    en_curso: "En Curso",
    finalizada: "Finalizada",
    evaluada: "Evaluada por Empresa",
    cerrada: "Cerrada",
  };
  const icons = {
    pendiente: AlertCircle,
    enviada_a_empresa: Mail,
    pendiente_validacion: Clock,
    rechazada: AlertTriangle,
    en_curso: Activity,
    finalizada: Flag,
    evaluada: ClipboardCheck,
    cerrada: Lock,
  };
  const colors = {
    pendiente: "bg-gray-100 text-gray-700 border-gray-200",
    enviada_a_empresa: "bg-blue-50 text-blue-700 border-blue-200",
    pendiente_validacion: "bg-purple-50 text-purple-700 border-purple-200",
    rechazada: "bg-red-50 text-red-700 border-red-200",
    en_curso: "bg-green-50 text-green-700 border-green-200",
    finalizada: "bg-yellow-50 text-yellow-800 border-yellow-200",
    evaluada: "bg-orange-50 text-orange-800 border-orange-200",
    cerrada: "bg-gray-800 text-white border-gray-600",
  };
  const IconComponent = icons[estado] || AlertCircle;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-semibold ${
        colors[estado] || "bg-gray-100 text-gray-800"
      }`}
    >
      <IconComponent size={14} className="shrink-0" />{" "}
      <span>{labels[estado] || estado}</span>
    </span>
  );
};

// FUNCIÓN PARA EL MENSAJE DE AYUDA
const getMensajeAyuda = (estado) => {
  switch (estado) {
    case "enviada_a_empresa":
      return "Tu solicitud fue enviada. Esperando que tu supervisor ingrese.";
    case "pendiente_validacion":
      return "La empresa firmó. Ahora el coordinador debe aprobar.";
    case "rechazada":
      return "Hay observaciones. Revisa y corrige tu postulación.";
    case "en_curso":
      return "¡Tu práctica está activa! Recuerda subir tus bitácoras.";
    case "finalizada":
      return "Has finalizado el periodo. Sube tu informe final.";
    case "evaluada":
      return "La empresa te evaluó. Esperando cierre del profesor.";
    case "cerrada":
      return "Proceso cerrado exitosamente.";
    default:
      return "Estado de tu solicitud.";
  }
};

// TRACKER DE BITÁCORAS
const BitacoraTracker = ({ documentos }) => {
  const bitacoras =
    documentos?.filter(
      (d) => d.tipo === "bitacora" && d.es_respuesta_formulario === true
    ) || [];
  const count = bitacoras.length;
  const maxObligatorias = 5;

  return (
    <div className="flex items-center gap-2 mt-3">
      {[...Array(maxObligatorias)].map((_, i) => {
        const isCompleted = i < count;
        return (
          <div
            key={i}
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
              isCompleted
                ? "bg-green-100 border-green-500 text-green-600"
                : "bg-gray-50 border-gray-200 text-gray-300"
            }`}
          >
            {isCompleted ? (
              <Check size={16} strokeWidth={3} />
            ) : (
              <span className="text-xs font-bold">{i + 1}</span>
            )}
          </div>
        );
      })}
      <div className="ml-2 text-xs text-gray-500">
        {count >= 5 ? (
          <span className="text-green-600 font-bold">¡Completas!</span>
        ) : (
          <span>{count}/5 enviadas.</span>
        )}
      </div>
    </div>
  );
};

// DASHBOARD PRINCIPAL
const DashboardAlumno = ({ user }) => {
  const navigate = useNavigate();
  const [practica, setPractica] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [recursosGlobales, setRecursosGlobales] = useState([]);
  const getPostulacionRespuestaId = () => {
    // Si 'practica' es null, regresa null
    if (!practica) return null;

    // Aseguramos que 'formularioRespuestas' exista antes de buscar
    const respuesta = practica.formularioRespuestas?.find(
      (r) => r.plantilla?.tipo === "postulacion"
    );

    return respuesta?.id || null;
  };

  const postulacionId = getPostulacionRespuestaId();

  const fetchMiPractica = useCallback(async () => {
    setIsLoading(true);
    try {
      const miPractica = await getMyPractica();
      setPractica(miPractica);
    } catch (err) {
      // Si no tiene práctica (404) o error de auth (401), no pasa nada, se queda null
      if (err.status !== 401)
        console.log("No se pudo cargar estado o no tiene práctica");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onFinalizarPractica = async () => {
    if (!practica) return;
    try {
      await finalizarPractica(practica.id);
      await showSuccessAlert(
        "Práctica finalizada",
        "Se envió la evaluación a la empresa."
      );
      await fetchMiPractica();
    } catch (e) {
      showErrorAlert("No se pudo finalizar", e.message || "Intenta nuevamente");
    }
  };

  //cargar recursos publicos globales
  const fetchRecursosGlobales = async () => {
    try {
      const response = await instance.get("/recursos");
      //prueba
      console.log("🔍 DATOS DEL BACKEND:", response.data.data);
      setRecursosGlobales(response.data.data);
    } catch (error) {
      console.error("Error al cargar pautas:", error);
    }
  };

  // DESCARGAR ARCHIVO
  const handleDownloadRecurso = (urlRecurso) => {
    //1 se obtiene variable actual (http://localhost:3000/api)
    const apiAddress = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
    // 2 se crea un objeto URL
    const urlObj = new URL(apiAddress);

    // 3 extraemos solo el "origin" (protocolo + dominio + puerto)
    const raizServidor = urlObj.origin;

    // 4 construye la ruta final limpia
    const finalUrl = `${raizServidor}${urlRecurso}`;
    window.open(finalUrl, "_blank");
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchMiPractica(), fetchRecursosGlobales()]);
      setIsLoading(false);
    };
    init();
  }, [fetchMiPractica]);

  const handleDeleteDocumento = async (id, es_respuesta_formulario) => {
    deleteDataAlert(async () => {
      try {
        // Si es una bitácora (respuesta de formulario), usar el servicio de formularios
        if (es_respuesta_formulario) {
          await deleteBitacora(id);
          showSuccessAlert("Eliminado", "Bitácora eliminada correctamente.");
        } else {
          // Si es un documento normal (archivo), usar el servicio de documentos
          await deleteDocumento(id);
          showSuccessAlert("Eliminado", "Documento eliminado.");
        }
        fetchMiPractica();
      } catch (error) {
        showErrorAlert("Error", error.message || "No se pudo eliminar.");
      }
    });
  };

  if (isLoading)
    return <div className="p-12 text-center text-gray-600">Cargando...</div>;

  // RENDERIZADO (DISEÑO HÍBRIDO)
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-green-100">
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-green-700">
            Panel del Alumno
          </h2>
          <p className="text-gray-600">
            Bienvenido, <span className="font-semibold">{user.name}</span>.
            Gestiona tu proceso de práctica profesional aquí.
          </p>
        </div>

        <div className="space-y-6">
          {/* --- FILA 1: ESTADO Y POSTULACIÓN --- */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tarjeta Estado */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <Activity size={20} className="text-green-600" /> Estado de
                  Práctica
                </h3>

                {/* Si no tiene práctica, mostramos botón de inscribir */}
                {!practica ? (
                  <div>
                    <p className="text-sm text-gray-500 mb-4">
                      No tienes una práctica inscrita.
                    </p>
                    <button
                      onClick={() => navigate("/postular")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow transition flex items-center justify-center gap-2 text-sm"
                    >
                      <Send size={16} /> Inscribir Práctica
                    </button>
                  </div>
                ) : (
                  <>
                    <EstadoBadge estado={practica.estado} />
                    <p className="text-sm text-gray-500 mt-2">
                      {getMensajeAyuda(practica.estado)}
                    </p>
                  </>
                )}
              </div>
              {/* Botón Finalizar práctica (cuando está en curso) */}
              {practica?.estado === "en_curso" && (
                <div className="mt-4">
                  <button
                    onClick={onFinalizarPractica}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg shadow transition flex items-center justify-center gap-2 text-sm"
                  >
                    <Flag size={16} /> Finalizar Práctica y Enviar Evaluación
                  </button>
                </div>
              )}
              {/* Token (Solo si existe) */}
              {practica?.empresaToken && (
                <div className="mt-4 bg-green-50 p-3 rounded-lg border border-green-200">
                  {/* FILA SUPERIOR: Título a la izquierda, Info a la derecha */}
                  <div className="flex justify-between items-center mb-2">
                    {/* IZQUIERDA: titulo + icono ticket */}
                    <div className="flex items-center gap-2 text-green-800 font-bold text-xs uppercase">
                      <Ticket size={16} /> Token Empresa
                    </div>

                    {/* DERECHA: Tooltip (Ícono 'i') */}
                    <div className="relative group flex items-center">
                      <Info
                        size={16}
                        className="text-green-600 cursor-help hover:text-green-800 transition"
                      />
                      {/* El mensaje flotante */}
                      <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-56 p-3 text-xs font-normal normal-case bg-gray-800 text-white rounded-lg shadow-xl z-50 text-center">
                        Si a tu supervisor no le llega el correo de invitación,
                        entrégale este código manualmente para que pueda
                        evaluarte.
                        {/* Triangulito decorativo para que parezca como burbuja de dialogo */}
                        <div className="absolute top-full right-0 mt-0 mr-1 border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  </div>

                  {/* ABAJO: El Código del Token (Bloque completo) */}
                  <div className="font-mono text-sm text-gray-700 select-all bg-white px-3 py-2 rounded border border-green-100 text-center w-full">
                    {practica.empresaToken.token}
                  </div>
                </div>
              )}
            </div>

            {/* Tarjeta Mi Postulación (Visualización) */}
            <div
              className={`bg-white p-6 rounded-xl shadow-sm border border-green-100 ${
                !practica ? "opacity-50 grayscale" : ""
              }`}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileCheck size={20} className="text-blue-600" /> Mi Postulación
              </h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="text-gray-500">Empresa:</p>
                  <p className="font-medium text-gray-800">
                    {practica?.empresaToken?.empresaNombre || "-"}
                  </p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-500">Fecha de envío:</p>
                  <p className="font-medium text-gray-800">
                    {practica?.fecha_creacion
                      ? new Date(practica.fecha_creacion).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
                {postulacionId ? (
                  <button
                    onClick={() =>
                      navigate(`/revision-formulario/${postulacionId}`)
                    }
                    className="w-full mt-2 border border-blue-600 text-white bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 shadow-md"
                  >
                    <FileCheck size={16} /> Ver Formulario de Postulación
                  </button>
                ) : (
                  <button
                    disabled={!practica}
                    className="w-full mt-2 border border-blue-200 text-blue-600 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download size={16} /> Comprobante No Disponible
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* --- FILA 2: BITÁCORAS (El Tracker) --- */}
          <div
            className={`bg-gradient-to-r from-green-50 to-white p-6 rounded-xl shadow-sm border border-green-200 ${
              !practica ? "opacity-50 grayscale pointer-events-none" : ""
            }`}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-green-800 flex items-center gap-2">
                  <BookOpen size={24} /> Avance de Bitácoras
                </h3>
                <p className="text-sm text-gray-600 mt-1 max-w-lg">
                  Las primeras 5 bitácoras se envían al coordinador.
                </p>

                {/* Usamos practica?.documentos para evitar el crash */}
                <BitacoraTracker
                  documentos={practica?.documentos?.filter(
                    (doc) => doc.tipo === "bitacora"
                  )}
                />
              </div>
              {/* Contenedor de ACCIONES (Derecha) */}
              <div className="flex gap-3 mt-4 md:mt-0">
                {/* 1. BOTÓN: COMPLETAR BITÁCORA (El formulario en la página) */}
                <button
                  disabled={!practica || practica?.estado === "cerrada"}
                  onClick={() => navigate("/forms/responder/bitacora")}
                  title={
                    practica?.estado === "cerrada"
                      ? "La práctica está cerrada. No se pueden crear bitácoras."
                      : undefined
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition flex items-center gap-2 whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <BookOpen size={18} /> Completar Bitácora
                </button>
                <button
                  disabled={!practica || practica?.estado === "cerrada"}
                  onClick={() =>
                    navigate("/upload-document", {
                      state: { practicaId: practica?.id },
                    })
                  }
                  title={
                    practica?.estado === "cerrada"
                      ? "La práctica está cerrada. No se pueden subir documentos."
                      : undefined
                  }
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition flex items-center gap-2 whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Upload size={18} /> Subir Documentos
                </button>
              </div>
            </div>
          </div>

          {/* --- FILA 3: RECURSOS Y REPOSITORIO --- */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recursos (Pautas) */}
            <div className="bg-purple-50 p-6 rounded-xl shadow-sm border border-purple-100 flex flex-col h-full">
              <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
                <FileText size={20} /> Recursos y Pautas
              </h3>

              <div className="space-y-2 grow">
                {recursosGlobales.length > 0 ? (
                  recursosGlobales.map((recurso) => (
                    <button
                      key={recurso.id}
                      onClick={() => handleDownloadRecurso(recurso.url)}
                      className="w-full flex items-center gap-2 text-left text-sm p-3 bg-white border border-purple-100 rounded-lg hover:bg-purple-100 hover:border-purple-300 text-purple-800 transition shadow-sm group"
                    >
                      <Download
                        size={18}
                        className="text-purple-400 group-hover:text-purple-700 shrink-0"
                      />
                      <span className="truncate font-medium">
                        {recurso.nombre}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center bg-white/50 rounded-lg border border-purple-100 border-dashed">
                    <FileText size={24} className="text-purple-200 mb-2" />
                    <p className="text-sm text-gray-500 italic">
                      No hay documentos disponibles aún.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Historial de Archivos */}
            <div
              className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${
                !practica ? "opacity-50" : ""
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Mis Documentos
                </h3>
                <button
                  disabled={!practica}
                  onClick={() => setShowDocsModal(true)}
                  className="text-green-600 hover:underline text-sm font-medium flex items-center gap-1 disabled:text-gray-400"
                >
                  <ClipboardCheck size={16} /> Ver todo el historial
                </button>
              </div>

              <div className="space-y-3">
                {/* Mensaje si no hay docs */}
                {(!practica ||
                  !practica.documentos ||
                  practica.documentos.length === 0) && (
                  <p className="text-gray-400 text-sm">
                    No hay documentos recientes.
                  </p>
                )}

                {/* Lista Miniatura */}
                {practica?.documentos
                  ?.slice(-3)
                  .reverse()
                  .map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-lg text-green-700">
                          {doc.tipo === "Bitácora" ? (
                            <FileText size={20} />
                          ) : (
                            <FileCheck size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700 text-sm">
                            {doc.tipo}
                          </p>
                          <p className="text-xs text-gray-500">Reciente</p>
                        </div>
                      </div>
                      <span
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded font-medium ${
                          doc.estado === "privado"
                            ? "bg-gray-200 text-gray-600"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {doc.estado === "privado" ? (
                          <Lock size={12} />
                        ) : (
                          <CheckCircle2 size={12} />
                        )}
                        {doc.estado === "privado" ? "Personal" : "Enviado"}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal (Solo se muestra si hay práctica) */}
        {practica && (
          <DocumentsModal
            isOpen={showDocsModal}
            onClose={() => setShowDocsModal(false)}
            studentName="Registros de la práctica"
            documents={practica.documentos || []}
            onDelete={handleDeleteDocumento}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardAlumno;
