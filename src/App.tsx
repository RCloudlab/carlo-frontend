import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ScannerHomePage from './pages/scanner/ScannerHomePage'
import NewSessionPage from './pages/scanner/NewSessionPage'
import QrScannerPage from './pages/scanner/QrScannerPage'
import ManualListPage from './pages/scanner/ManualListPage'
import StudentsListPage from './pages/scanner/StudentsListPage'
import AdminPage from './pages/admin/AdminPage'
import ConflictLogPage from './pages/admin/ConflictLogPage'
import ProgramsPage from './pages/admin/ProgramsPage'
import StudentsPage from './pages/admin/StudentsPage'
import CatequistasPage from './pages/admin/CatequistasPage'
import StudentProfilePage from './pages/admin/StudentProfilePage'
import ReportsPage from './pages/admin/ReportsPage'
import AppShell from './components/AppShell'
import ProtectedRoute from './components/ProtectedRoute'
import IOSInstallBanner from './components/IOSInstallBanner'
import OfflineBadge from './components/OfflineBadge'
import { tryRestoreSession } from './services/auth.service'
import { useOfflineSync } from './hooks/useOfflineSync'

function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="coordinador">
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8F9FC' }}>
      <div className="text-center">
        <p className="text-6xl font-extrabold mb-2" style={{ color: '#E2E6EF' }}>404</p>
        <p className="text-base" style={{ color: '#8E97AE' }}>Página no encontrada</p>
      </div>
    </div>
  )
}

function AppInner() {
  useOfflineSync()
  return (
    <>
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Catequista */}
        <Route
          path="/scan"
          element={
            <ProtectedRoute requiredRole="catequista">
              <ScannerHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scan/new"
          element={
            <ProtectedRoute requiredRole="catequista">
              <NewSessionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scan/qr"
          element={
            <ProtectedRoute requiredRole="catequista">
              <QrScannerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scan/manual"
          element={
            <ProtectedRoute requiredRole="catequista">
              <ManualListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute requiredRole="catequista">
              <StudentsListPage />
            </ProtectedRoute>
          }
        />

        {/* Coordinador — todas dentro del AppShell */}
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/admin/students" element={<AdminRoute><StudentsPage /></AdminRoute>} />
        <Route path="/admin/students/:id" element={<AdminRoute><StudentProfilePage /></AdminRoute>} />
        <Route path="/admin/programs" element={<AdminRoute><ProgramsPage /></AdminRoute>} />
        <Route path="/admin/catequistas" element={<AdminRoute><CatequistasPage /></AdminRoute>} />
        <Route path="/admin/reports" element={<AdminRoute><ReportsPage /></AdminRoute>} />
        <Route path="/admin/conflicts" element={<AdminRoute><ConflictLogPage /></AdminRoute>} />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <IOSInstallBanner />
      <OfflineBadge />
    </>
  )
}

export default function App() {
  const [sessionChecked, setSessionChecked] = useState(false)

  useEffect(() => {
    tryRestoreSession().finally(() => setSessionChecked(true))
  }, [])

  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8F9FC' }}>
        <p style={{ color: '#8E97AE' }}>Cargando…</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}
