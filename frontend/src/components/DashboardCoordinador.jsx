import React from 'react';

const DashboardCoordinador = ({ user }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-blue-800 mb-4">Panel del Coordinador</h2>
      <p>Bienvenido, {user.name}.</p>
      <p>Aquí podrás gestionar las prácticas, crear tokens para empresas y validar el cierre de prácticas.</p>
      
      {/* Aquí es donde viviría tu RF10, RF11, RF12 */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold">Acciones Rápidas</h3>
        <ul>
          <li className="mt-2"><button className="text-blue-600 hover:underline">Ver Alumnos Inscritos (RF2)</button></li>
          <li className="mt-2"><button className="text-blue-600 hover:underline">Generar Token Empresa (RF7)</button></li>
          <li className="mt-2"><button className="text-blue-600 hover:underline">Gestionar Formularios (RF12)</button></li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardCoordinador;