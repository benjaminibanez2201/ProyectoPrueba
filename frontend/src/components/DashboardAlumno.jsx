import React from "react";
import { Upload, FileText, Activity } from "lucide-react";

const DashboardAlumno = ({ user }) => {
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

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-green-50 p-6 rounded-xl shadow-inner hover:shadow-md transition">
            <Activity className="text-green-600 mb-3" size={32} />
            <h3 className="text-lg font-bold text-green-800">Estado Actual</h3>
            <p className="text-green-700 font-medium mt-2">
              🕓 Pendiente (RF10)
            </p>
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
      </div>
    </div>
  );
};

export default DashboardAlumno;
