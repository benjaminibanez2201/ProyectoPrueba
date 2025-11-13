import React from "react";
import { Users, Key, ClipboardList } from "lucide-react";

const DashboardCoordinador = ({ user }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
        <h2 className="text-4xl font-extrabold text-blue-700 mb-2">
          Panel del Coordinador
        </h2>
        <p className="text-gray-600 mb-6">
          Bienvenido, <span className="font-semibold">{user.name}</span>.  
          Administra las prácticas, tokens y formularios desde aquí.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-xl shadow-inner hover:shadow-md transition">
            <Users className="text-blue-600 mb-3" size={32} />
            <h3 className="text-lg font-bold text-blue-800">Ver Alumnos</h3>
            <p className="text-gray-600 text-sm mt-1">
              Revisa alumnos inscritos y su progreso (RF2)
            </p>
            <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg w-full">
              Gestionar Alumnos
            </button>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl shadow-inner hover:shadow-md transition">
            <Key className="text-blue-600 mb-3" size={32} />
            <h3 className="text-lg font-bold text-blue-800">Token para Empresas</h3>
            <p className="text-gray-600 text-sm mt-1">
              Genera códigos para vincular empresas (RF7)
            </p>
            <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg w-full">
              Crear Token
            </button>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl shadow-inner hover:shadow-md transition">
            <ClipboardList className="text-blue-600 mb-3" size={32} />
            <h3 className="text-lg font-bold text-blue-800">Formularios</h3>
            <p className="text-gray-600 text-sm mt-1">
              Crea o modifica evaluaciones y formularios (RF12)
            </p>
            <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg w-full">
              Gestionar Formularios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCoordinador;
