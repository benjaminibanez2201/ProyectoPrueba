import React, { useState, useEffect, useCallback } from "react"; 
import { useNavigate } from "react-router-dom"; 
import { Upload, FileText, Activity, Send, PlusCircle } from "lucide-react";
import { getMyPractica } from "../services/practica.service.js"; 

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

const DashboardAlumno = ({ user }) => {
  const navigate = useNavigate();
  const [practica, setPractica] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
            <p className="text-gray-600 text-sm mt-1 mb-4">
              Envía tus informes y certificados (RF8).
            </p>
            <button 
              disabled={!practica} // Deshabilitado si no hay práctica
              className="mt-auto bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg w-full"
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
          </div>
        </div>
        
        {/* SECCIÓN INFERIOR: TOKEN (Solo si hay práctica) */}
        {practica && (
          <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border-2 border-dashed border-green-200">
            <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              🎟️ Token para tu Empresa
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              Copia este código y entrégaselo a tu supervisor. Él lo necesitará para ingresar al sistema y evaluarte.
            </p>
            
            <div className="bg-gray-100 text-gray-800 font-mono text-lg p-4 rounded text-center border border-gray-300 select-all">
              {practica.empresaToken?.token || "Token no disponible"}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DashboardAlumno;