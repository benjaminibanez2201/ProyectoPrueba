import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from '@pages/Login';
import Home from '@pages/Home';
import Panel from './pages/Panel';
import Error404 from '@pages/Error404';
import Root from '@pages/Root';
import Register from '@pages/Register';
import ProtectedRoute from '@components/ProtectedRoute';
import PostularPractica from '@pages/PostularPractica';
import GestionFormularios from '@pages/GestionFormularios';
import VistaPrevia from './pages/VistaPrevia';
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
        // :tipo es la variable (ej: bitacora, evaluacion_pr1)
        path: '/admin/formularios/preview/:tipo', 
        element: (
          <ProtectedRoute>
            <VistaPrevia />
          </ProtectedRoute>
        )
      },
      {
        path: '/home',
        element: <Home />
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);
