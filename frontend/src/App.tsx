import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/auth/Login';

import Activate from './pages/auth/Activate'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import NotFound from './pages/errors/NotFound.tsx'
import AppLayout from './components/navigations/AppLayout'
import ProtectedRoute from './components/navigations/ProtectedRoute'
import RolesPage from './pages/roles/RolesPage'
import UsersPage from './pages/users/UsersPage'
import RoleDetailPage from './pages/roles/RoleDetailPage'
import PermissionsPage from './pages/permissions/PermissionsPage'
import PermissionDetailPage from './pages/permissions/PermissionDetailPage'
import TerritoriesPage from './features/territory/components/TerritoriesPage'
import { ReportsPage } from './features/reports/components/ReportsPage'
import { MissionsPage } from './features/missions/components/MissionsPage'
import { InterventionsPage } from './features/interventions/components/InterventionsPage'
import { StructuresPage } from './features/structures/components/StructuresPage'
import { SocietesPage } from './features/societes/components/SocietesPage'

function App() {
  return (
    <BrowserRouter>
      {/* Configuration du Toaster pour les alertes globales */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '14px',
          },
          success: {
            style: { background: '#008751', color: '#fff' }, // Vert Bénin
          },
          error: {
            style: { background: '#E8112D', color: '#fff' }, // Rouge Bénin
          },
        }} 
      />
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<Login />} />
        <Route path="/activate" element={<Activate />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />



        {/* Routes privées — protégées par l'authentification */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/roles/:id" element={<RoleDetailPage />} />
            <Route path="/permissions" element={<PermissionsPage />} />
            <Route path="/permissions/:id" element={<PermissionDetailPage />} />
            <Route path="/territories" element={<TerritoriesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/missions" element={<MissionsPage />} />
            <Route path="/interventions" element={<InterventionsPage />} />
            <Route path="/structures" element={<StructuresPage />} />
            <Route path="/societes" element={<SocietesPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App