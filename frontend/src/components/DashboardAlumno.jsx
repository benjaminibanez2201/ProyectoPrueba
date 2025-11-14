import React, { useState, useEffect } from "react"; // 1. Importamos hooks
import { Upload, FileText, Activity, Send } from "lucide-react";
import { getMyPractica } from "../services/practica.service.js"; // 2. Importamos el "puente"
import { showErrorAlert } from "../helpers/sweetAlert.js";

// Componente de insignia de estado (¡lo reutilizamos!)
const EstadoBadge = ({ estado }) => {
  // ... (mismo componente que en DashboardCoordinador)
  let texto = estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' ');
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

// --- ¡NUEVO COMPONENTE! ---
// Este es el formulario ESTÁTICO (RF13) que mostraremos
// si el alumno NO tiene práctica.
const FormularioPostulacion = () => {
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // ¡¡¡AQUÍ IRÁ LA LÓGICA DEL PASO 2!!!
    // (Llamar al servicio postularPractica(data))
    alert("¡Lógica de envío pendiente! (Paso 2)");
  };

  return (
    <div className="mt-8 bg-green-50 p-6 rounded-xl shadow-inner border border-green-200">
      <h3 className="text-2xl font-bold text-green-800 mb-4">
        1. Inscribe tu Práctica (RF13)
      </h3>
      <p className="text-gray-600 mb-6">
        Completa los datos de la empresa donde realizarás tu práctica.
      </p>
      
      {/* ¡Este es tu formulario ESTÁTICO! */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Empresa</label>
          <input type="text" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email Contacto (Empresa)</label>
          <input type="email" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Contacto (Empresa)</label>
          <input type="text" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <button 
          type="submit"
          className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg w-full flex items-center justify-center gap-2"
        >
          <Send size={18} />
          Enviar Postulación
        </button>
      </form>
    </div>
  );
};


const DashboardAlumno = ({ user }) => {
  // 3. Usamos las "cajas" de memoria
  const [practica, setPractica] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 4. Usamos el "disparador" para llamar a la API
  useEffect(() => {
    const fetchMiPractica = async () => {
      try {
        const miPractica = await getMyPractica(); // Llama al "puente"
        setPractica(miPractica); // Guarda la práctica (o null)
      } catch (err) {
        setError(err.message || "No se pudo cargar tu estado");
        showErrorAlert("Error", err.message || "No se pudo cargar tu estado");
      } finally {
        setIsLoading(false); // Terminamos de cargar
      }
    };

    fetchMiPractica();
  }, []); // El [] significa "ejecutar 1 sola vez"


  // --- Renderizado Condicional ---
  
  if (isLoading) {
    return <p className="text-center p-12">Cargando tu información...</p>;
  }
  if (error) {
    return <p className="text-center p-12 text-red-600">{error}</p>;
  }

  // 5. ¡LA LÓGICA PRINCIPAL!
  // Esta es la parte dinámica que decide qué mostrar.
  const renderContent = () => {
    
    // 5A. Si NO hay práctica, mostramos el formulario
    if (!practica) {
      return <FormularioPostulacion />;
    }

    // 5B. Si SÍ hay práctica, mostramos tu dashboard original
    return (
      <>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-green-50 p-6 rounded-xl shadow-inner">
            <Activity className="text-green-600 mb-3" size={32} />
            <h3 className="text-lg font-bold text-green-800">Estado Actual</h3>
            {/* ¡DATO DINÁMICO! */}
            <div className="mt-2">
              <EstadoBadge estado={practica.estado} />
            </div>
          </div>
          <div className="bg-green-50 p-6 rounded-xl shadow-inner hover:shadow-md transition">
            <Upload className="text-green-600 mb-3" size={32} />
            <h3 className="text-lg font-bold text-green-800">Subir Documentos</h3>
            <p className="text-gray-600 text-sm mt-1">
              Envía tus informes y certificados (RF8)
            </p>
            <button className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg w-full">
              Subir Archivos
            </button>
          </div>
          <div className="bg-green-50 p-6 rounded-xl shadow-inner hover:shadow-md transition">
            <FileText className="text-green-600 mb-3" size={32} />
            <h3 className="text-lg font-bold text-green-800">Documentos Subidos</h3>
            <p className="text-gray-600 text-sm mt-1">
              Consulta tus entregas registradas.
            </p>
          </div>
        </div>
        
        {/* ¡BONUS! (RF13 Manual) Mostramos el token a la empresa */}
        <div className="mt-8 bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Token para tu Empresa
          </h3>
          <p className="text-gray-600 mb-4">
            Tu práctica está en estado: <span className="font-semibold">{practica.estado}</span>.
            Si tu empresa necesita completar formularios, envíale este token:
          </p>
          <p className="bg-gray-200 text-gray-900 font-mono text-lg p-4 rounded text-center">
            {practica.tokenEmpresa || "TOKEN_PENDIENTE"} {/* (Necesitamos añadir esto) */}
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
        
        {/* ¡Aquí se renderiza el contenido dinámico! */}
        {renderContent()}

      </div>
    </div>
  );
};

export default DashboardAlumno;