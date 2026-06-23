import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import { logout } from '../services/auth.service'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

const ADMIN_NAV: NavItem[] = [
  {
    label: 'Inicio',
    path: '/admin',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Alumnos',
    path: '/admin/students',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Programas',
    path: '/admin/programs',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    label: 'Catequistas',
    path: '/admin/catequistas',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: 'Reportes',
    path: '/admin/reports',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: 'Conflictos',
    path: '/admin/conflicts',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
]

function SidebarNavItem({ item, active }: { item: NavItem; active: boolean }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(item.path)}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left"
      style={{
        background: active ? 'rgba(201,148,42,0.15)' : 'transparent',
        color: active ? '#F4C842' : 'rgba(255,255,255,0.60)',
        border: 'none',
        fontSize: 14,
        fontWeight: active ? 700 : 500,
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent'
      }}
    >
      <span style={{ color: active ? '#F4C842' : 'rgba(255,255,255,0.50)', flexShrink: 0 }}>
        {item.icon}
      </span>
      {item.label}
      {active && (
        <div
          className="ml-auto w-1.5 h-1.5 rounded-full"
          style={{ background: '#C9942A', flexShrink: 0 }}
        />
      )}
    </button>
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const initials = user?.full_name
    ?.split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('') ?? 'U'

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#F8F9FC' }}>

      {/* ── Sidebar (desktop ≥1024px) ── */}
      <aside
        className="hidden lg:flex flex-col"
        style={{
          width: 240,
          background: '#0F1B3D',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 20,
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, #1A3A6B, #2452A0)',
                border: '1.5px solid rgba(201,148,42,0.40)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 36 36" fill="none">
                <rect x="15" y="4" width="6" height="28" rx="2" fill="rgba(201,148,42,0.9)" />
                <rect x="4" y="13" width="28" height="6" rx="2" fill="rgba(201,148,42,0.9)" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-extrabold text-white" style={{ letterSpacing: '-0.01em' }}>Carlo</p>
              <p className="text-xs" style={{ color: 'rgba(201,148,42,0.70)' }}>Coordinador</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {ADMIN_NAV.map((item) => (
            <SidebarNavItem
              key={item.path}
              item={item}
              active={
                item.path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.path)
              }
            />
          ))}
        </nav>

        {/* Footer de usuario */}
        <div
          className="px-4 py-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #1A3A6B, #2452A0)', border: '1.5px solid rgba(201,148,42,0.30)' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.full_name ?? 'Usuario'}</p>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.40)' }}>{user?.email ?? ''}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors"
              style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 lg:ml-60 min-w-0">

        {/* Mobile top bar */}
        <div
          className="lg:hidden flex items-center gap-3 px-4 sticky top-0 z-10"
          style={{
            height: 56,
            background: '#0F1B3D',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center gap-2 flex-1">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(201,148,42,0.20)', border: '1px solid rgba(201,148,42,0.30)' }}
            >
              <svg width="12" height="12" viewBox="0 0 36 36" fill="none">
                <rect x="15" y="4" width="6" height="28" rx="2" fill="#C9942A" />
                <rect x="4" y="13" width="28" height="6" rx="2" fill="#C9942A" />
              </svg>
            </div>
            <span className="text-sm font-extrabold text-white">Carlo</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.70)', border: 'none' }}
          >
            Salir
          </button>
        </div>

        {/* Mobile bottom nav */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 flex z-20 overflow-x-auto"
          style={{
            background: '#FFFFFF',
            borderTop: '1px solid #E2E6EF',
            paddingBottom: 'env(safe-area-inset-bottom, 8px)',
          }}
        >
          {ADMIN_NAV.map((item) => {
            const active = item.path === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.path)
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex-1 flex flex-col items-center gap-1 py-2 min-w-[56px]"
                style={{ background: 'transparent', border: 'none' }}
              >
                <span style={{ color: active ? '#1A3A6B' : '#8E97AE' }}>{item.icon}</span>
                <span className="text-xs font-semibold" style={{ color: active ? '#1A3A6B' : '#8E97AE', fontSize: 10 }}>
                  {item.label}
                </span>
                {active && <div className="w-1 h-1 rounded-full" style={{ background: '#C9942A' }} />}
              </button>
            )
          })}
        </nav>

        {/* Page content */}
        <div className="pb-20 lg:pb-0">
          {children}
        </div>
      </main>
    </div>
  )
}
