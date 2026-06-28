import { useRef } from 'react'

export function useScanSound() {
  const audioCtxRef = useRef<AudioContext | null>(null)

  function getCtx(): AudioContext {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    return audioCtxRef.current
  }

  async function play(fn: (ctx: AudioContext) => void) {
    try {
      const ctx = getCtx()
      if (ctx.state === 'suspended') {
        await ctx.resume()
      }
      fn(ctx)
    } catch {
      // No romper el flujo de escaneo si el audio falla
    }
  }

  function playSuccess() {
    // Doble beep ascendente — tipo "confirmación amigable"
    play((ctx) => {
      const t = ctx.currentTime

      function beep(startTime: number, freq: number) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, startTime)
        gain.gain.setValueAtTime(0, startTime)
        gain.gain.linearRampToValueAtTime(0.55, startTime + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.13)
        osc.start(startTime)
        osc.stop(startTime + 0.13)
      }

      beep(t, 880)        // primer tono — La5
      beep(t + 0.14, 1320) // segundo tono más alto — Mi6
    })
  }

  function playWarning() {
    // Tono doble neutro — ni error ni éxito
    play((ctx) => {
      const t = ctx.currentTime

      function beep(startTime: number, freq: number) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, startTime)
        gain.gain.setValueAtTime(0, startTime)
        gain.gain.linearRampToValueAtTime(0.45, startTime + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12)
        osc.start(startTime)
        osc.stop(startTime + 0.12)
      }

      beep(t, 660)
      beep(t + 0.14, 660)
    })
  }

  function playError() {
    // Tono descendente corto
    play((ctx) => {
      const t = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, t)
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.25)
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.50, t + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
      osc.start(t)
      osc.stop(t + 0.25)
    })
  }

  return { playSuccess, playWarning, playError }
}
