const SHOP_TIME_ZONE = 'Europe/Warsaw'
const HAS_ZONE = /(?:z|[+-]\d{2}:?\d{2})$/i
const WALL_TIME =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?$/

const readPart = (
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes
): number => Number(parts.find((part) => part.type === type)?.value ?? '0')

/** Offset of `timeZone` at `instant`, in milliseconds. Positive means east of UTC. */
const zoneOffsetMs = (instant: Date, timeZone: string): number => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant)
  let hour = readPart(parts, 'hour')
  if (hour === 24) hour = 0
  const wallAsUtc = Date.UTC(
    readPart(parts, 'year'),
    readPart(parts, 'month') - 1,
    readPart(parts, 'day'),
    hour,
    readPart(parts, 'minute'),
    readPart(parts, 'second')
  )
  return wallAsUtc - Math.floor(instant.getTime() / 1000) * 1000
}

/**
 * Paynow `modifiedAt` is documented as `2018-12-12T13:24:52` with no offset.
 * That wall clock is Europe/Warsaw. A UTC server otherwise reads it as UTC,
 * which is one hour ahead in winter and two hours ahead in summer.
 */
const warsawWallTimeToUtc = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  millisecond: number
): Date => {
  const wallAsUtc = Date.UTC(year, month - 1, day, hour, minute, second, millisecond)
  const first = wallAsUtc - zoneOffsetMs(new Date(wallAsUtc), SHOP_TIME_ZONE)
  return new Date(wallAsUtc - zoneOffsetMs(new Date(first), SHOP_TIME_ZONE))
}

/**
 * Absolute instant for a Paynow timestamp. Zone-less values are Europe/Warsaw.
 * A result later than `now` is clamped to `now` so Data Manager never receives
 * an event in the future.
 */
export const parsePaynowModifiedAt = (value: string, now: Date = new Date()): Date => {
  const trimmed = value.trim()
  const wall = HAS_ZONE.test(trimmed) ? null : WALL_TIME.exec(trimmed)
  let parsed: Date
  if (wall) {
    const fraction = wall[7] ? wall[7].slice(0, 3).padEnd(3, '0') : '0'
    parsed = warsawWallTimeToUtc(
      Number(wall[1]),
      Number(wall[2]),
      Number(wall[3]),
      Number(wall[4]),
      Number(wall[5]),
      Number(wall[6]),
      Number(fraction)
    )
  } else {
    parsed = new Date(trimmed)
  }
  if (Number.isNaN(parsed.getTime()) || parsed.getTime() > now.getTime()) return now
  return parsed
}
