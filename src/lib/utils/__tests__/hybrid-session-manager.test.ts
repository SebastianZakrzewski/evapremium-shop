import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HybridSessionManager } from '../hybrid-session-manager'

vi.mock('@/config/env', () => ({
  env: {
    nodeEnv: 'test',
  },
}))

describe('HybridSessionManager session cookie deferral', () => {
  beforeEach(() => {
    document.cookie = 'eva-session-id=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    sessionStorage.clear()
  })

  it('stores new session id in sessionStorage without setting cookie', () => {
    const sessionId = HybridSessionManager.getSessionId()

    expect(sessionId).toMatch(/^session-/)
    expect(sessionStorage.getItem('eva-session-id')).toBe(sessionId)
    expect(document.cookie.includes('eva-session-id=')).toBe(false)
  })

  it('persists session cookie after explicit persist call', () => {
    const sessionId = HybridSessionManager.getSessionId()

    HybridSessionManager.persistSessionCookie()

    expect(document.cookie.includes(`eva-session-id=${encodeURIComponent(sessionId)}`)).toBe(true)
  })

  it('persists session cookie when cart data is saved', () => {
    const sessionId = HybridSessionManager.getSessionId()

    HybridSessionManager.saveOrderData(sessionId, { cart: [] })

    expect(document.cookie.includes('eva-session-id=')).toBe(true)
  })
})
