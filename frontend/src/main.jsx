import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from '@pages/Login';
import Home from '@pages/Home';
import Panel from './pages/Panel';
import Error404 from '@pages/Error404';
import Root from '@pages/Root';
import Register from '@pages/Register';
import Access from '@pages/Access';
import ProtectedRoute from '@components/ProtectedRoute';
import CrearFormulario from './pages/CrearFormulario';

import PostularPractica from '@pages/PostularPractica';
import GestionFormularios from '@pages/GestionFormularios';
import VistaPrevia from './pages/VistaPrevia';
import EditarFormulario from './pages/EditarFormulario';

import SubirDocumento from  '@pages/SubirDocumento';

import AprobarPracticas from '@pages/AprobarPracticas';

import '@styles/styles.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <Error404 />,
    children: [
      {
        path: '/',
        element: <Login />
      },
      {
        path: '/auth',
        element: <Login />
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/register',
        element: <Register />
      },
      {
        path: '/empresa/acceso/:token',
        element: <Access />
      },
      {
        path: '/admin/formularios/nuevo',
        element: <ProtectedRoute><CrearFormulario /></ProtectedRoute>
        },
      {

        path: '/panel',
        element: ( <ProtectedRoute>
          <Panel />
        </ProtectedRoute>
        )
      },
      {
        path: '/postular',
        element: (
          <ProtectedRoute>
            <PostularPractica />
          </ProtectedRoute>
        )
      },
      {
        path: '/admin/formularios',
        element: (
          <ProtectedRoute>
            <GestionFormularios />
          </ProtectedRoute>
        )
      },
      {
        path: '/admin/formularios/preview/:tipo', 
        element: (
          <ProtectedRoute>
            <VistaPrevia />
          </ProtectedRoute>
        )
      },
      {
        path: '/admin/formularios/editar/:id',
        element: (
          <ProtectedRoute>
          <EditarFormulario />
          </ProtectedRoute>
        )
      },
      {
        path: '/home',
        element: <Home />
      },
      {
        path: '/upload-document',
        element: (
        <ProtectedRoute>
        <SubirDocumento />
        </ProtectedRoute>
        )
      },
      {
        path: '/coordinador/aprobar-practicas',
        element: (
          <ProtectedRoute>
          <AprobarPracticas />
          </ProtectedRoute>
        )
      },

    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);
