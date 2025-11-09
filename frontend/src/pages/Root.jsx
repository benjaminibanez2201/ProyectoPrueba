import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@context/AuthContext';

function Root() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

export default Root;
