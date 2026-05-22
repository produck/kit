import assert from 'node:assert/strict';
import { it } from 'node:test';
import * as Kit from '@produck/kit';
import { chainToRoot } from '../../index.mjs';

const root = Kit.global;
const foo = root('foo');
const bar = foo('bar');

it('should make chain-to-root diagram', () => {
  assert.equal(chainToRoot(bar), '[bar] --|> [foo] --|> [Kit::Global]');
});

it('should reflect raw behavior for invalid kit context', () => {
  assert.equal(chainToRoot({}), '[]');
});
