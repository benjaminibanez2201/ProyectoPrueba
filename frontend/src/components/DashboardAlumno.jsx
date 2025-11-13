import React from 'react';

const DashboardAlumno = ({ user }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-green-800 mb-4">Panel del Alumno</h2>
      <p>Bienvenido, {user.name}.</p>
      <p>Este es el seguimiento de tu práctica profesional.</p>

      {/* Aquí es donde viviría tu RF8, RF10 */}
       <div className="mt-6">
        <h3 className="text-xl font-semibold">Mi Práctica</h3>
        <p>Estado: <span className="font-bold text-orange-500">Pendiente (RF10)</span></p>
         <button className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">
           Subir Documentos (RF8)
         </button>
      </div>
    </div>
  );
};

export default DashboardAlumno;