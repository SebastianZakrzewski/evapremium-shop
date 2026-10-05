import { useEffect, useState } from 'react'
import { EVA_CHAT_GREETING_BODY, EVA_CHAT_GREETING_TITLE } from '../lib/evaWidgetPlugin'

export const EVA_CHAT_GREETING_DELAY_MS = 800

export const EVA_CHAT_TYPING_MS = 1000

export const EVA_CHAT_TYPE_INTERVAL_MS = 40

export const EVA_CHAT_GREETING_TEXT = `${EVA_CHAT_GREETING_TITLE}\n${EVA_CHAT_GREETING_BODY}`

export type EvaChatGreetingPhase = 'idle' | 'typing' | 'writing'

const prefersReducedMotion = (): boolean => {
  if (typeof window.matchMedia !== 'function') {
    return false
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const useEvaChatGreeting = (enabled: boolean) => {
  const [phase, setPhase] = useState<EvaChatGreetingPhase>('idle')
  const [written, setWritten] = useState('')

  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    const delayId = window.setTimeout(() => {
      if (prefersReducedMotion()) {
        setPhase('writing')
        setWritten(EVA_CHAT_GREETING_TEXT)
        return
      }

      setPhase('typing')
    }, EVA_CHAT_GREETING_DELAY_MS)

    return () => {
      window.clearTimeout(delayId)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled || phase !== 'typing') {
      return undefined
    }

    const typingId = window.setTimeout(() => {
      setWritten('')
      setPhase('writing')
    }, EVA_CHAT_TYPING_MS)

    return () => {
      window.clearTimeout(typingId)
    }
  }, [enabled, phase])

  useEffect(() => {
    if (!enabled || phase !== 'writing' || written.length >= EVA_CHAT_GREETING_TEXT.length) {
      return undefined
    }

    const typeId = window.setTimeout(() => {
      setWritten(EVA_CHAT_GREETING_TEXT.slice(0, written.length + 1))
    }, EVA_CHAT_TYPE_INTERVAL_MS)

    return () => {
      window.clearTimeout(typeId)
    }
  }, [enabled, phase, written])

  return { phase, written }
}
