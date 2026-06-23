import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useZxing } from 'react-zxing'
import { useSessionStore } from '../../store/session.store'
import { scanAttendance } from '../../services/attendance.service'
import { uuidv4 } from '../../utils/uuid'
import { useScanSound } from '../../hooks/useScanSound'
import { addPendingScan, isAlreadyScannedLocally } from '../../db/offline-queue'

type ScanStatus = 'registered' | 'duplicate_session' | 'duplicate_day' | 'student_not_found' | 'session_not_active'

interface ScanResult {
  status: ScanStatus
  student_name: string | null
}

type ViewState = 'scanning' | 'processing' | 'result' | 'denied'

export default function QrScannerPage() {
  const navigate = useNavigate()
  const { activeSession } = useSessionStore()
  const [viewState, setViewState] = useState<ViewState>('scanning')
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const isProcessing = useRef(false)
  const resultTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { playSuccess, playWarning, playError } = useScanSound()

  useEffect(() => {
    if (!activeSession) {
      navigate('/scan', { replace: true })
    }
  }, [activeSession, navigate])

  useEffect(() => {
    return () => {
      if (resultTimer.current) clearTimeout(resultTimer.current)
    }
  }, [])

  async function handleDecode(rawText: string) {
    if (isProcessing.current || viewState !== 'scanning' || !activeSession) return
    isProcessing.current = true
    setViewState('processing')

    const studentUuid = rawText.trim()
    const recordId = uuidv4()
    const scannedAt = new Date().toISOString()

    const alreadyLocal = await isAlreadyScannedLocally(activeSession.id, studentUuid)
    if (alreadyLocal) {
      playWarning()
      setScanResult({ status: 'duplicate_session', student_name: null })
      setViewState('result')
      resultTimer.current = setTimeout(() => {
        setScanResult(null)
        setViewState('scanning')
        isProcessing.current = false
      }, 1500)
      return
    }

    if (!navigator.onLine) {
      await addPendingScan({
        id: recordId,
        session_id: activeSession.id,
        student_id: studentUuid,
        student_name: '',
        scanned_at: scannedAt,
        source: 'qr',
      })
      playSuccess()
      setScanResult({ status: 'registered', student_name: 'Guardado offline' })
      setViewState('result')
      resultTimer.current = setTimeout(() => {
        setScanResult(null)
        setViewState('scanning')
        isProcessing.current = false
      }, 1500)
      return
    }

    try {
      const result = await scanAttendance({
        id: recordId,
        student_uuid: studentUuid,
        mass_session_id: activeSession.id,
        scanned_at: scannedAt,
      })

      if (result.status === 'registered') {
        playSuccess()
      } else if (result.status === 'duplicate_session' || result.status === 'duplicate_day') {
        playWarning()
      } else {
        playError()
      }

      setScanResult(result)
      setViewState('result')

      resultTimer.current = setTimeout(() => {
        setScanResult(null)
        setViewState('scanning')
        isProcessing.current = false
      }, 1500)
    } catch {
      await addPendingScan({
        id: recordId,
        session_id: activeSession.id,
        student_id: studentUuid,
        student_name: '',
        scanned_at: scannedAt,
        source: 'qr',
      })
      playSuccess()
      setScanResult({ status: 'registered', student_name: 'Guardado offline' })
      setViewState('result')
      resultTimer.current = setTimeout(() => {
        setScanResult(null)
        setViewState('scanning')
        isProcessing.current = false
      }, 1500)
    }
  }

  const { ref } = useZxing({
    onDecodeResult(result) {
      handleDecode(result.rawValue)
    },
    onError(error) {
      if (error instanceof Error && error.name === 'NotAllowedError') {
        setViewState('denied')
      }
    },
    constraints: {
      video: { facingMode: 'environment' },
    },
    paused: viewState !== 'scanning',
  })

  if (!activeSession) return null

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#000000' }}>

      {/* Header */}
      <div
        className="flex items-center justify-between px-4"
        style={{
          height: 56,
          background: 'linear-gradient(180deg, rgba(15,27,61,0.95) 0%, rgba(0,0,0,0) 100%)',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <button
          onClick={() => navigate('/scan')}
          className="flex items-center gap-1 font-semibold text-sm"
          style={{ color: '#FFFFFF', minHeight: 44, minWidth: 44 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Volver
        </button>
        <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {activeSession.session_date}
        </span>
      </div>

      {/* Permiso denegado */}
      {viewState === 'denied' && (
        <div
          className="flex-1 flex flex-col items-center justify-center px-6 gap-5"
          style={{ background: '#0F1B3D' }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(201,148,42,0.15)', border: '2px solid rgba(201,148,42,0.30)' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9942A" strokeWidth="1.5">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <p className="text-white text-center text-base leading-relaxed">
            Necesitamos acceso a la cámara para escanear QRs.
            <br />Puedes usar la lista manual.
          </p>
          <button
            onClick={() => navigate(`/scan/manual?sessionId=${activeSession.id}`)}
            className="w-full max-w-xs font-bold text-white rounded-2xl"
            style={{
              height: 50,
              background: 'linear-gradient(135deg, #C9942A, #E8B84B)',
              boxShadow: '0 4px 16px rgba(201,148,42,0.35)',
            }}
          >
            Ir a Lista Manual
          </button>
        </div>
      )}

      {/* Viewfinder */}
      {viewState !== 'denied' && (
        <div className="flex-1 relative flex items-center justify-center" style={{ background: '#000000' }}>
          {/* Video */}
          <video
            ref={ref}
            className="w-full h-full object-cover"
            muted
            playsInline
          />

          {/* Esquinas doradas del viewfinder */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative" style={{ width: 260, height: 260 }}>
              {/* Esquina superior izquierda */}
              <span className="absolute top-0 left-0 w-9 h-9 rounded-tl-lg"
                style={{ borderTop: '3px solid #C9942A', borderLeft: '3px solid #C9942A' }} />
              {/* Esquina superior derecha */}
              <span className="absolute top-0 right-0 w-9 h-9 rounded-tr-lg"
                style={{ borderTop: '3px solid #C9942A', borderRight: '3px solid #C9942A' }} />
              {/* Esquina inferior izquierda */}
              <span className="absolute bottom-0 left-0 w-9 h-9 rounded-bl-lg"
                style={{ borderBottom: '3px solid #C9942A', borderLeft: '3px solid #C9942A' }} />
              {/* Esquina inferior derecha */}
              <span className="absolute bottom-0 right-0 w-9 h-9 rounded-br-lg"
                style={{ borderBottom: '3px solid #C9942A', borderRight: '3px solid #C9942A' }} />

              {/* Línea de escaneo dorada — animación de 2s */}
              {viewState === 'scanning' && (
                <div
                  className="absolute left-3 right-3"
                  style={{
                    height: 2,
                    background: 'linear-gradient(90deg, transparent, #C9942A, #F4C842, #C9942A, transparent)',
                    boxShadow: '0 0 8px rgba(201,148,42,0.80)',
                    animation: 'scan-line 2s ease-in-out infinite',
                  }}
                />
              )}
            </div>
          </div>

          {/* Instrucción */}
          {viewState === 'scanning' && (
            <p
              className="absolute bottom-16 text-center text-sm font-medium px-6"
              style={{ color: 'rgba(255,255,255,0.70)' }}
            >
              Apunta al código QR del alumno
            </p>
          )}

          {/* Overlay procesando */}
          {viewState === 'processing' && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(15,27,61,0.80)' }}>
              <p className="text-white text-lg font-bold">Procesando…</p>
            </div>
          )}

          {/* Overlay resultado */}
          {viewState === 'result' && scanResult && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center px-6 gap-4"
              style={{ background: overlayBg(scanResult.status) }}
            >
              <span className="text-6xl font-black text-white" style={{ lineHeight: 1 }}>
                {overlayIcon(scanResult.status)}
              </span>
              <p className="text-white text-xl font-extrabold text-center" style={{ letterSpacing: '-0.01em' }}>
                {overlayMessage(scanResult)}
              </p>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes scan-line {
          0%   { top: 12px;  opacity: 0.3; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { top: calc(100% - 12px); opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}

function overlayBg(status: ScanStatus): string {
  switch (status) {
    case 'registered':
      return 'rgba(26,58,107,0.94)'      // azul marino
    case 'duplicate_session':
    case 'duplicate_day':
      return 'rgba(180,126,20,0.94)'     // dorado oscuro
    default:
      return 'rgba(192,39,30,0.94)'      // rojo polo
  }
}

function overlayIcon(status: ScanStatus): string {
  switch (status) {
    case 'registered':      return '✓'
    case 'duplicate_session':
    case 'duplicate_day':   return '⚠'
    default:                return '✗'
  }
}

function overlayMessage(result: ScanResult): string {
  switch (result.status) {
    case 'registered':
      return result.student_name ?? 'Firma registrada'
    case 'duplicate_session':
      return `Ya registrado en esta sesión${result.student_name ? `: ${result.student_name}` : ''}`
    case 'duplicate_day':
      return `Ya tiene firma de hoy${result.student_name ? `: ${result.student_name}` : ''}`
    case 'student_not_found':
      return 'QR desconocido'
    case 'session_not_active':
      return 'La sesión ya fue cerrada'
  }
}
