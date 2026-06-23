import { useEffect, useState } from 'react'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    function onOnline() { setIsOnline(true) }
    function onOffline() { setIsOnline(false) }

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    // Polling adicional para iOS — el evento online puede tardar segundos
    const interval = setInterval(() => {
      setIsOnline(navigator.onLine)
    }, 5000)

    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      clearInterval(interval)
    }
  }, [])

  return { isOnline }
}
