import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ensureVisitorId, randomVisitorId } from './visitor.ts';

describe('visitor id', () => {
  it('accepts an explicit alphanumeric id', () => {
    assert.equal(ensureVisitorId('Guest01'), 'Guest01');
  });

  it('rejects ids that gateway would treat as anon', () => {
    const generated = ensureVisitorId('bad id!');
    assert.match(generated, /^[a-zA-Z0-9]{24}$/);
    assert.notEqual(generated, 'bad id!');
  });

  it('randomVisitorId matches gateway visitor pattern', () => {
    assert.match(randomVisitorId(), /^[a-zA-Z0-9]{24}$/);
  });
});
