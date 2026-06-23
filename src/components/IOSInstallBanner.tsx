import { useState } from 'react'

function isIOS(): boolean {
  const ua = navigator.userAgent
  return (
    /iPhone|iPad|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

function isStandalone(): boolean {
  return (navigator as Navigator & { standalone?: boolean }).standalone === true
}

const DISMISSED_KEY = 'ios-install-dismissed'

export default function IOSInstallBanner() {
  const [visible, setVisible] = useState<boolean>(() => {
    if (!isIOS()) return false
    if (isStandalone()) return false
    if (sessionStorage.getItem(DISMISSED_KEY)) return false
    return true
  })

  if (!visible) return null

  function dismiss() {
    sessionStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  return (
    <div
      role="banner"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg p-4 flex gap-3 items-start"
    >
      <div className="flex-shrink-0 text-2xl select-none" aria-hidden>
        📲
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 mb-1">Instala Carlo en tu celular</p>
        <p className="text-xs text-gray-600">
          Toca el ícono{' '}
          <span className="inline-flex items-center gap-0.5 font-medium text-blue-600">
            Compartir <ShareIcon />
          </span>{' '}
          y luego <span className="font-medium">"Añadir a pantalla de inicio"</span>
        </p>
      </div>
      <button
        onClick={dismiss}
        className="flex-shrink-0 text-xs text-gray-500 underline min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Cerrar banner de instalación"
      >
        Entendido
      </button>
    </div>
  )
}

function ShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5 inline"
      aria-hidden
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )
}
