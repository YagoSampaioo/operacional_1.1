import { Outlet } from 'react-router-dom';
import { AuthProvider } from './AuthProvider';

export function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}