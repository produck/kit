import assert from 'node:assert/strict';
import { it } from 'node:test';
import * as Kit from '@produck/kit';
import { vertical } from '../../index.mjs';

const root = Kit.global;
const foo = root('foo');
const bar = foo('bar');

it('should make vertical diagram', () => {
  assert.equal(
    vertical(bar),
    '[bar]\n  |\n  v\n[foo]\n  |\n  v\n[Kit::Global]',
  );
});

it('should reflect raw behavior for invalid kit context', () => {
  assert.equal(vertical({}), '');
});
