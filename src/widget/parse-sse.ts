import type { ShopStreamEvent } from '../gateway/types'

function isShopStreamEvent(value: unknown): value is ShopStreamEvent {
  if (typeof value !== 'object' || value === null || !('type' in value)) {
    return false;
  }
  const type = (value as { type: unknown }).type;
  return type === 'start' || type === 'text-delta' || type === 'done' || type === 'error';
}

/**
 * Parses `data: {...}\n\n` frames from a growing SSE buffer (gateway `encodeSse`).
 */
export function parseSseBuffer(buffer: string): { events: ShopStreamEvent[]; rest: string } {
  const events: ShopStreamEvent[] = [];
  let rest = buffer;

  for (;;) {
    const separator = rest.indexOf('\n\n');
    if (separator === -1) {
      break;
    }

    const block = rest.slice(0, separator);
    rest = rest.slice(separator + 2);

    for (const rawLine of block.split('\n')) {
      const line = rawLine.replace(/\r$/, '');
      if (!line.startsWith('data:')) {
        continue;
      }
      const payload = line.slice(5).trimStart();
      if (payload.length === 0 || payload === '[DONE]') {
        continue;
      }
      try {
        const parsed: unknown = JSON.parse(payload);
        if (isShopStreamEvent(parsed)) {
          events.push(parsed);
        }
      } catch {
        // Ignore a truncated or non-JSON data line; it stays dropped with this frame.
      }
    }
  }

  return { events, rest };
}
