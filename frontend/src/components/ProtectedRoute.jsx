import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const role = user?.role;
    if (!allowedRoles.includes(role)) {
      // Si no tiene permisos, enviamos al panel
      return <Navigate to="/panel" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
