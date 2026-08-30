import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { encodeSse } from '../gateway/shop-stream.ts';
import { parseSseBuffer } from './parse-sse.ts';

describe('parseSseBuffer', () => {
  it('parses one complete gateway frame', () => {
    const { events, rest } = parseSseBuffer(encodeSse({ type: 'start', runId: 'r1' }));
    assert.equal(rest, '');
    assert.deepEqual(events, [{ type: 'start', runId: 'r1' }]);
  });

  it('holds a truncated frame in rest', () => {
    const { events, rest } = parseSseBuffer('data: {"type":"text-delta","text":"He');
    assert.equal(events.length, 0);
    assert.equal(rest.startsWith('data:'), true);
  });

  it('parses multiple frames then a remainder', () => {
    const buffer =
      encodeSse({ type: 'text-delta', text: 'A' }) +
      encodeSse({ type: 'text-delta', text: 'B' }) +
      'data: {"type":"done"';
    const { events, rest } = parseSseBuffer(buffer);
    assert.equal(events.length, 2);
    assert.equal(events[0]?.type, 'text-delta');
    assert.equal(rest, 'data: {"type":"done"');
  });
});
