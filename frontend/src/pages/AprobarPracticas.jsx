import React, { useEffect, useState, useRef } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  User,
  Calendar,
  Eye,
  FileText,
  ArrowLeft,
  Download,
} from "lucide-react";
import instance from "../services/root.service"; 
import FormRender from "../components/FormRender"; 
import {
  showSuccessAlert,
  showErrorAlert,
  showRejectFormAlert,
  showConfirmAlert,
  showHtmlAlert,
  customAlert,
} from "../helpers/sweetAlert";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";

const AprobarPracticas = () => {
  const navigate = useNavigate();
  const [practicas, setPracticas] = useState([]);
  const [loading, setLoading] = useState(true);
  const formContentRef = useRef(null);

  // Estados para el Modal de Revisión
  const [modalOpen, setModalOpen] = useState(false);
  const [seleccionada, setSeleccionada] = useState(null);
  const [plantilla, setPlantilla] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // 1. Cargamos la plantilla para el FormRender
      // Ajusta la ruta si es necesario, pero debería ser esta
      const resPlantilla = await instance.get(
        "/formularios/plantilla/postulacion"
      );
      setPlantilla(resPlantilla.data.data);

      // 2. Cargamos las prácticas pendientes usando NUESTRO controlador
      const resPracticas = await instance.get("/coordinador/pendientes");
      setPracticas(resPracticas.data.data || []);
    } catch (error) {
      console.error("Error:", error);
      showErrorAlert("Error", "No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DEL FORMULARIO ---
  const getRespuestasDePractica = (practica) => {
    if (!practica || !practica.formularioRespuestas) return {};

    const respuesta =
      practica.formularioRespuestas.find(
        (r) => r.plantilla?.tipo === "postulacion"
      ) || practica.formularioRespuestas[0];

    if (!respuesta || !respuesta.datos) return {};

    // Sacamos 'datosFormulario' aparte, y dejamos el resto (datos empresa) en 'restoDatos'
    const { datosFormulario, ...restoDatos } = respuesta.datos;

    // Mezclamos todo priorizando los últimos cambios del alumno (datosFormulario)
    const datosUnificados = {
      ...restoDatos, // Datos de la empresa
      ...(datosFormulario || {}), // Datos del alumno sobrescriben si hay conflicto
    };

    console.log("Datos Unificados para FormRender:", datosUnificados);
    return datosUnificados;
  };

  const handleRevisar = (practica) => {
    setSeleccionada(practica);
    setModalOpen(true);
  };

  // Función para descargar PDF del formulario de postulación
  const handleDescargarPDF = async () => {
    const element = formContentRef.current;
    if (!element) return;

    const alumnoNombre = seleccionada?.student?.name || "Alumno";

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Formulario_Postulacion_${alumnoNombre.replace(
        /\s+/g,
        "_"
      )}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          const sections = clonedDoc.querySelectorAll(
            ".mb-4, .mb-6, table, h2"
          );
          sections.forEach((el) => {
            el.style.pageBreakInside = "avoid";
          });
        },
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: {
        mode: "css",
        before: ".page-break-before",
        after: ".page-break-after",
        avoid: ".no-break",
      },
    };

    await html2pdf().set(opt).from(element).save();
  };

  // --- LÓGICA DE APROBACIÓN/RECHAZO ---
  const handleDecision = async (decision) => {
    const esAprobar = decision === "aprobar";
    let observaciones = "";
    let destinatario = null;

    if (!esAprobar) {
      //  Usamos el helper nuevo
      const { value: formValues } = await showRejectFormAlert();
      if (!formValues) return;

      observaciones = formValues.motivo;
      destinatario = formValues.destinatario;
    } else {
      const result = await showConfirmAlert(
        "¿Aprobar Práctica?",
        "El alumno pasará a estado 'En Curso'. Se enviará correo de notificación."
      );

      if (!result.isConfirmed) return;
    }

    try {
      await instance.put(`/coordinador/evaluar/${seleccionada.id}`, {
        decision,
        observaciones,
        destinatario,
      });

      showSuccessAlert(
        "¡Listo!",
        `Solicitud ${esAprobar ? "aprobada" : "rechazada"} exitosamente.`
      );

      setModalOpen(false);
      cargarDatos();
    } catch (error) {
      console.error(error);
      showErrorAlert("Error", "No se pudo procesar la solicitud.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <p className="text-gray-700 text-xl animate-pulse">
          Cargando solicitudes...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative">
          {/* BOTÓN IZQUIERDA */}
          <button
            onClick={() => navigate("/panel")}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-blue-600 flex items-center gap-2 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft size={20} />
            Volver
          </button>

          {/* TÍTULO CENTRADO */}
          <h1 className="text-2xl font-bold text-blue-700 flex items-center justify-center gap-2">
            <FileText />
            Portal de Prácticas - Coordinador
          </h1>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <h2 className="text-3xl font-bold text-green-800 mb-2">
            Gestionar Inicio de Prácticas
          </h2>
          <p className="text-gray-600">
            Revisa los formularios firmados por Alumno y Empresa antes de dar el
            inicio oficial.
          </p>
        </div>

        {/* Lista de prácticas */}
        {practicas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay prácticas pendientes
            </h3>
            <p className="text-gray-500">
              Todas las confirmaciones han sido procesadas.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {practicas.map((practica) => (
              <div
                key={practica.id}
                className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition"
              >
                {/* Banner Amarillo */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-6 h-6 text-yellow-600 mr-3" />
                    <div>
                      <p className="font-semibold text-yellow-800">
                        Confirmación Recibida
                      </p>
                      <p className="text-yellow-700 text-sm">
                        Fecha:{" "}
                        {new Date(
                          practica.fecha_actualizacion
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grilla de Datos */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <User className="w-5 h-5 text-blue-600 mr-2" />
                      <h4 className="font-semibold text-gray-700">Alumno</h4>
                    </div>
                    <p className="text-lg font-bold text-gray-800">
                      {practica.student?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {practica.student?.email}
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Building2 className="w-5 h-5 text-green-600 mr-2" />
                      <h4 className="font-semibold text-gray-700">Empresa</h4>
                    </div>
                    <p className="text-lg font-bold text-gray-800">
                      {practica.empresaToken?.empresaNombre}
                    </p>
                    <p className="text-sm text-gray-600">
                      {practica.empresaToken?.empresaCorreo}
                    </p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                      <h4 className="font-semibold text-gray-700">Estado</h4>
                    </div>
                    <p className="text-lg font-bold text-gray-800 capitalize">
                      {practica.estado.replace("_", " ")}
                    </p>
                  </div>
                </div>

                {/* Botón Único: Revisar */}
                <button
                  onClick={() => handleRevisar(practica)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition shadow-md"
                >
                  <Eye size={20} /> Revisar Formulario y Evaluar
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- MODAL DE REVISIÓN Y APROBACIÓN --- */}
      {modalOpen && seleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Evaluación de Solicitud
                </h3>
                <p className="text-sm text-gray-500">
                  Revisa los datos antes de aprobar. -{" "}
                  {seleccionada?.student?.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDescargarPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                  title="Descargar formulario como PDF"
                >
                  <Download size={18} />
                  PDF
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
              <div
                ref={formContentRef}
                className="bg-white rounded-lg p-6 shadow"
              >
                {plantilla ? (
                  <FormRender
                    esquema={plantilla.esquema}
                    respuestasIniciales={getRespuestasDePractica(seleccionada)}
                    readOnly={true} // Bloqueado para edición
                    userType="coordinador"
                  />
                ) : (
                  <div className="text-center py-10">
                    Cargando formulario...
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer (Actions) */}
            <div className="p-4 border-t bg-white flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
              <button
                onClick={() => handleDecision("rechazar")}
                className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 font-bold transition"
              >
                <XCircle size={20} /> Rechazar con Observaciones
              </button>
              <button
                onClick={() => handleDecision("aprobar")}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-md hover:shadow-lg transition"
              >
                <CheckCircle size={20} /> Aprobar Práctica
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AprobarPracticas;
