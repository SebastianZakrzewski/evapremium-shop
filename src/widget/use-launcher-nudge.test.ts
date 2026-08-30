import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GREETING_DELAY_MS, GREETING_TEXT, HELP_INTERVAL_MS, HELP_PROMPTS, NUDGE_VISIBLE_MS } from './launcher-nudge'
import { useLauncherNudge } from './use-launcher-nudge'

describe('useLauncherNudge', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the greeting after the intro delay', () => {
    const { result } = renderHook(() => useLauncherNudge(false))

    expect(result.current).toBeNull()

    act(() => {
      vi.advanceTimersByTime(GREETING_DELAY_MS)
    })

    expect(result.current).toEqual({
      kind: 'greeting',
      text: GREETING_TEXT,
    })
  })

  it('hides the bubble when the chat opens', () => {
    const { result, rerender } = renderHook(({ open }) => useLauncherNudge(open), {
      initialProps: { open: false },
    })

    act(() => {
      vi.advanceTimersByTime(GREETING_DELAY_MS)
    })

    rerender({ open: true })
    expect(result.current).toBeNull()
  })

  it('hides the greeting after it has been visible', () => {
    const { result } = renderHook(() => useLauncherNudge(false))

    act(() => {
      vi.advanceTimersByTime(GREETING_DELAY_MS)
    })
    act(() => {
      vi.advanceTimersByTime(NUDGE_VISIBLE_MS)
    })

    expect(result.current).toBeNull()
  })

  it('asks if it can help after the greeting cycle', () => {
    const { result } = renderHook(() => useLauncherNudge(false))

    act(() => {
      vi.advanceTimersByTime(GREETING_DELAY_MS + NUDGE_VISIBLE_MS + HELP_INTERVAL_MS)
    })

    expect(result.current).toEqual({
      kind: 'help',
      text: HELP_PROMPTS[0],
    })
  })
})
