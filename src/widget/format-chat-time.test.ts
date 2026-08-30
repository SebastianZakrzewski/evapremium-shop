import { describe, expect, it } from 'vitest'
import { formatChatTime } from './format-chat-time'

describe('formatChatTime', () => {
  it('formats a valid ISO timestamp in Polish 24h clock', () => {
    expect(formatChatTime('2026-08-30T12:07:00.000Z')).toMatch(/^\d{2}:\d{2}$/)
  })

  it('returns empty string for invalid dates', () => {
    expect(formatChatTime('not-a-date')).toBe('')
  })
})
