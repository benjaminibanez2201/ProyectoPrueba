import React, { useState, useEffect, useCallback } from "react"; 
import { Upload, FileText, Activity, Send } from "lucide-react";
import { getMyPractica, postularPractica } from "../services/practica.service.js"; 
import { showErrorAlert, showSuccessAlert } from "../helpers/sweetAlert.js";
import { useNavigate } from "react-router-dom";
import DocumentsModal from "./DocumentsModal";

// (EstadoBadge... no cambia)
const EstadoBadge = ({ estado }) => {
  let texto = 'Pendiente';
  if (estado) {
    texto = estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' ');
  }
  const S = {
    pendiente: "bg-yellow-100 text-yellow-800",
    pendiente_revision: "bg-blue-100 text-blue-800",
    en_curso: "bg-blue-100 text-blue-800",
    finalizada: "bg-green-100 text-green-800",
    evaluada: "bg-purple-100 text-purple-800",
    cerrada: "bg-gray-100 text-gray-800",
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${S[estado] || S.pendiente}`}>
      {texto}
    </span>
  );
};

// --- COMPONENTE FormularioPostulacion ---
const FormularioPostulacion = ({ onPostulacionExitosa }) => {
  
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [emailEmpresa, setEmailEmpresa] = useState("");
  const [nombreRepresentante, setNombreRepresentante] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); 

    const data = {
      nombreEmpresa,
      emailEmpresa,
      nombreRepresentante,
    };

    try {
      // Llamamos al backend
      const nuevaPractica = await postularPractica(data);
      
      // Mostramos el token (¡RF13 Manual!)
      // Accedemos a nuevaPractica.empresaToken.token
      const token = nuevaPractica.empresaToken?.token || "Token generado (revisa tu dashboard)";

      showSuccessAlert(
        "¡Postulación Enviada!",
        `Tu token para la empresa es: ${token}`
      );
      
      // Recargamos el dashboard
      onPostulacionExitosa(); 

    } catch (err) {
      const errorMessage = err.message || "No se pudo enviar la postulación";
      showErrorAlert("Error al postular", errorMessage);
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="mt-8 bg-green-50 p-6 rounded-xl shadow-inner border border-green-200">
      <h3 className="text-2xl font-bold text-green-800 mb-4">
        1. Inscribe tu Práctica (RF13)
      </h3>
      <p className="text-gray-600 mb-6">
        Completa los datos de la empresa donde realizarás tu práctica.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Empresa</label>
          <input 
            type="text" 
            value={nombreEmpresa}
            onChange={(e) => setNombreEmpresa(e.target.value)}
            required 
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email Contacto (Empresa)</label>
          <input 
            type="email" 
            value={emailEmpresa}
            onChange={(e) => setEmailEmpresa(e.target.value)}
            required 
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Contacto (Empresa)</label>
          <input 
            type="text" 
            value={nombreRepresentante}
            onChange={(e) => setNombreRepresentante(e.target.value)}
            required 
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
          />
        </div>
        <button 
          type="submit"
          disabled={isSubmitting} 
          className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg w-full flex items-center justify-center gap-2 disabled:bg-gray-400"
        >
          <Send size={18} />
          {isSubmitting ? "Enviando..." : "Enviar Postulación"}
        </button>
      </form>
    </div>
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
      // Ignoramos error 401 (logout)
      if (err.status !== 401) {
         const errorMessage = err.message || "No se pudo cargar tu estado";
         setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchMiPractica();
  }, [fetchMiPractica]); 


  // --- Renderizado Condicional ---
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-gray-600">Cargando tu información...</p>
      </div>
    );
  }
  // (Opcional: Podrías mostrar el error aquí si es crítico, 
  // pero si no hay práctica, simplemente mostramos el formulario)

  const renderContent = () => {
    
    // Si NO hay práctica, mostramos el formulario
    if (!practica) {
      return <FormularioPostulacion onPostulacionExitosa={fetchMiPractica} />;
    }

    // Si SÍ hay práctica, mostramos el dashboard
    return (
      <>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-green-50 p-6 rounded-xl shadow-inner">
            <Activity className="text-green-600 mb-3" size={32} />
            <h3 className="text-lg font-bold text-green-800">Estado Actual</h3>
            <div className="mt-2">
              <EstadoBadge estado={practica.estado} />
            </div>
          </div>
          <div className="bg-green-50 p-6 rounded-xl shadow-inner hover:shadow-md transition">
            <Upload className="text-green-600 mb-3" size={32} />
            <h3 className="text-lg font-bold text-green-800">Subir Documentos</h3>
            <p className="text-gray-600 text-sm mt-1">
              Envía tus informes y certificados (RF6)
            </p>
            <button 
          onClick={() => {
             // Navegamos a la ruta y le pasamos el ID de la práctica "escondido"
             navigate('/upload-document', { state: { practicaId: practica.id } });
          }}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg w-full"
        >
          Subir Archivos
        </button>
          </div>
          <div className="bg-green-50 p-6 rounded-xl shadow-inner hover:shadow-md transition">
            <FileText className="text-green-600 mb-3" size={32} />
            <h3 className="text-lg font-bold text-green-800">Documentos Subidos</h3>
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
        
        {/* ¡BONUS! (RF13 Manual) Mostramos el token a la empresa */}
        <div className="mt-8 bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Token para tu Empresa
          </h3>
          {/* ¡AQUÍ ESTÁ LA CORRECCIÓN! Era un </D>, ahora es un </p> */}
          <p className="text-gray-600 mb-4">
            Tu práctica está en estado: <span className="font-semibold">{practica.estado}</span>.
            Si tu empresa necesita completar formularios, envíale este token:
          </p>
          
          <p className="bg-gray-200 text-gray-900 font-mono text-lg p-4 rounded text-center break-all">
            {practica.empresaToken?.token || "Token no disponible (contacta al soporte)"}
          </p>
        </div>
      </>
    );
  };

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-green-100">
        <h2 className="text-4xl font-extrabold text-green-700 mb-2">
          Panel del Alumno
        </h2>
        <p className="text-gray-600 mb-6">
          Bienvenido, <span className="font-semibold">{user.name}</span>.
          Aquí puedes seguir el progreso de tu práctica profesional.
        </p>
        
        {renderContent()}

        {/* Modal de Documentos */}
        {practica && (
          <DocumentsModal
            isOpen={showDocsModal}
            onClose={() => setShowDocsModal(false)}
            studentName="la práctica"
            // Aquí pasamos los documentos de la práctica del alumno
            documents={practica.documentos || []} 
          />
        )}

      </div>
    </div>
  );
};

export default DashboardAlumno;