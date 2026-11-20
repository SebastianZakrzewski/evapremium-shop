import { describe, expect, it } from 'vitest'
import { formatDataManagerEventTimestamp } from '@/lib/tracking/server/plan'
import { parsePaynowModifiedAt } from '../paynowTimestamp'

const receivedAt = new Date('2026-11-12T09:11:20.216Z')

describe('parsePaynowModifiedAt', () => {
  it('reads a zone-less Paynow modifiedAt as Europe/Warsaw, not as UTC', () => {
    const paidAt = parsePaynowModifiedAt('2026-11-12T10:11:03', receivedAt)

    expect(paidAt.toISOString()).toBe('2026-11-12T09:11:03.000Z')
    expect(formatDataManagerEventTimestamp(paidAt)).toBe('2026-11-12T10:11:03+01:00')
  })

  it('uses the summer offset when Warsaw is on CEST', () => {
    const paidAt = parsePaynowModifiedAt('2018-07-12T13:24:52', new Date('2018-07-12T12:00:00.000Z'))

    expect(paidAt.toISOString()).toBe('2018-07-12T11:24:52.000Z')
    expect(formatDataManagerEventTimestamp(paidAt)).toBe('2018-07-12T13:24:52+02:00')
  })

  it('keeps an explicit offset or Z and does not shift it again', () => {
    expect(parsePaynowModifiedAt('2026-11-12T10:11:03+01:00', receivedAt).toISOString()).toBe(
      '2026-11-12T09:11:03.000Z'
    )
    expect(parsePaynowModifiedAt('2026-11-08T12:00:00.000Z', receivedAt).toISOString()).toBe(
      '2026-11-08T12:00:00.000Z'
    )
  })

  it('clamps a future timestamp to the moment the webhook is handled', () => {
    const now = new Date('2026-11-20T10:00:00.000Z')

    expect(parsePaynowModifiedAt('2026-11-20T12:30:00', now)).toEqual(now)
    expect(parsePaynowModifiedAt('not-a-date', now)).toEqual(now)
  })
})
