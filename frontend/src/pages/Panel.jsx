import React from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardCoordinador from '../components/DashboardCoordinador';
import DashboardAlumno from '../components/DashboardAlumno';
import { Navigate } from 'react-router-dom';

const Panel = () => {
  const { user, logoutContext } = useAuth();

  // Si por alguna razón no hay usuario (aunque ProtectedRoute debería pararlo)
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Botón de Logout (ejemplo)
  const handleLogout = () => {
    logoutContext();
    // No es necesario un navigate, el ProtectedRoute hará su trabajo
  };

  const renderDashboard = () => {
    switch (user.role) {
      case 'coordinador':
        return <DashboardCoordinador user={user} />;
      case 'alumno':
        return <DashboardAlumno user={user} />;
      default:
        // Si el rol no es ni alumno ni coordinador
        return (
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600">Rol no reconocido</h1>
            <p>Tu rol ({user.role}) no tiene un panel asignado.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-700">Portal de Prácticas</h1>
        <div>
          <span className="mr-4">Hola, <span className="font-semibold">{user.name}</span></span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <main className="p-8">
        {renderDashboard()}
      </main>
    </div>
  );
};

export default Panel;