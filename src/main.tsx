import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard.tsx';
import { AddCompany } from './pages/AddCompany.tsx';
import { Churns } from './pages/Churns.tsx';
import { AddChurn } from './pages/AddChurn.tsx';
import { Upsell } from './pages/Upsell.tsx';
import { AddUpsell } from './pages/AddUpsell.tsx';
import { Updates } from './pages/Updates.tsx';
import { Login } from './pages/Login.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { RootLayout } from './components/RootLayout.tsx';
import App from './App.tsx';
import './index.css';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/map',
        element: (
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        ),
      },
      {
        path: '/add-company',
        element: (
          <ProtectedRoute requireAdmin>
            <AddCompany />
          </ProtectedRoute>
        ),
      },
      {
        path: '/churns',
        element: (
          <ProtectedRoute>
            <Churns />
          </ProtectedRoute>
        ),
      },
      {
        path: '/churns/add',
        element: (
          <ProtectedRoute requireAdmin>
            <AddChurn />
          </ProtectedRoute>
        ),
      },
      {
        path: '/upsell',
        element: (
          <ProtectedRoute>
            <Upsell />
          </ProtectedRoute>
        ),
      },
      {
        path: '/upsell/add',
        element: (
          <ProtectedRoute requireAdmin>
            <AddUpsell />
          </ProtectedRoute>
        ),
      },
      {
        path: '/updates',
        element: (
          <ProtectedRoute>
            <Updates />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);