import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Activity, Send, PlusCircle, Ticket, Info } from "lucide-react";
import { getMyPractica, postularPractica } from "../services/practica.service.js";
import { showErrorAlert, showSuccessAlert, deleteDataAlert } from "../helpers/sweetAlert.js";
import DocumentsModal from "./DocumentsModal";
import { deleteDocumento } from "../services/documento.service.js";


const EstadoBadge = ({ estado }) => {
  let texto = 'Pendiente';
  if (estado) {
    texto = estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' ');
  }
  const S = {
    // Estado inicial (Si implementamos carga masiva de alumnos después)
    pendiente: "🔴 Pendiente (Empresa no inscrita)",

    // Flujo normal
    enviada_a_empresa: "✉️ Enviado a Empresa (Esperando respuesta)",
    pendiente_validacion: "⏳ Pendiente Validación (Coordinador)",
    rechazada: "⚠️ Rechazada con Observaciones",
    en_curso: "✅ En Curso",
    finalizada: "🏁 Finalizada (Esperando Evaluación)",
    evaluada: "📝 Evaluada por Empresa",
    cerrada: "🔒 Cerrada (Nota Final Asignada)"
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${S[estado] || S.pendiente}`}>
      {texto}
    </span>
  );
};

const DashboardAlumno = ({ user }) => {
  const navigate = useNavigate();
  const [practica, setPractica] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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



  // Función para manejar la eliminación
  const handleDeleteDocumento = async (id) => {
    deleteDataAlert(async () => {
      try {
        const response = await deleteDocumento(id);
        if (response.status === 'Success') {
          showSuccessAlert('Eliminado', 'El documento ha sido eliminado.');
          fetchMiPractica(); // RECARGAR DATOS
        } else {
          showErrorAlert('Error', response.message);
        }
      } catch (error) {
        showErrorAlert('Error', 'No se pudo eliminar el documento.');
      }
    });
  };

  // --- Renderizado Condicional ---


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

        {/* HEADER DEL DASHBOARD */}
        <div className="mb-8">
          <h2 className="text-4xl font-extrabold text-green-700 mb-2">
            Panel del Alumno
          </h2>
          <p className="text-gray-600">
            Bienvenido, <span className="font-semibold">{user.name}</span>.
            Gestiona tu proceso de práctica profesional aquí.
          </p>
        </div>

        {/* GRID DE TARJETAS (Siempre visible) */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* TARJETA 1: ESTADO / INSCRIPCIÓN */}
          <div className="bg-green-50 p-6 rounded-xl shadow-inner border border-green-100 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4">
                <Activity className="text-green-600" size={32} />
                {/* Si no hay práctica, mostramos un icono de alerta o plus */}
                {!practica && <PlusCircle className="text-blue-500" size={24} />}
              </div>
              <h3 className="text-lg font-bold text-green-800 mb-2">Estado Actual</h3>

              {/* AQUÍ ESTÁ LA LÓGICA CONDICIONAL DENTRO DE LA TARJETA */}
              {practica ? (
                <div className="mt-2">
                  <EstadoBadge estado={practica.estado} />
                  <p className="text-xs text-gray-500 mt-2">Tu práctica está activa.</p>
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

            {/* BORRAMOS EL PRIMER P Y BUTTON QUE NO HACIAN NADA */}

            {/* DEJAMOS ESTE QUE ES EL QUE FUNCIONA (RF6) */}
            <p className="text-gray-600 text-sm mt-1">
              Envía tus informes y certificados (RF6)
            </p>
            <button
              disabled={!practica} // Tip: Puedes agregarle esto para que se bloquee si no hay práctica
              onClick={() => {
                // Navegamos a la ruta y le pasamos el ID de la práctica "escondido"
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

            {/* 3. BOTÓN ACTIVADO */}
            <button
              onClick={() => setShowDocsModal(true)}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg w-full"
            >
              Ver Mis Archivos
            </button>
          </div>
        </div>

        {practica && (
          <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border-2 border-dashed border-green-200">

            <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Ticket size={20} /> Token para tu Empresa

              {/* TOOLTIP SIN DEPENDENCIAS */}
              <div className="relative group">
                <Info size={18} className="text-gray-500 hover:text-gray-700 cursor-pointer" />
                <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 hidden group-hover:block
                        w-64 p-3 text-sm bg-gray-800 text-white rounded-lg shadow-lg z-50">
                  Si a tu supervisor no le llega el correo o se pierde, entrégale este token.
                  Lo necesitará para ingresar al sistema y completar el formulario y tu evaluación.
                </div>
              </div>
            </h3>

            <div className="bg-gray-100 text-gray-800 font-mono text-lg p-4 rounded text-center border border-gray-300 select-all">
              {practica.empresaToken?.token || "Token no disponible"}
            </div>

          </div>
        )}


        {/* Modal de Documentos */}
        {practica && (
          <DocumentsModal
            isOpen={showDocsModal}
            onClose={() => setShowDocsModal(false)}
            studentName="la práctica"
            // Aquí pasamos los documentos de la práctica del alumno
            documents={practica.documentos || []}
            onDelete={handleDeleteDocumento}
          />
        )}

      </div>
    </div>
  );
};

export default DashboardAlumno;