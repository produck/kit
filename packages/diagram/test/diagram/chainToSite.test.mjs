import assert from 'node:assert/strict';
import { it } from 'node:test';
import * as Kit from '@produck/kit';
import { chainToSite } from '../../index.mjs';

const root = Kit.global;
const foo = root('foo');
const bar = foo('bar');

it('should make chain-to-site diagram', () => {
  assert.equal(chainToSite(bar), '[Kit::Global] <|-- [foo] <|-- [bar]');
});

it('should reflect raw behavior for invalid kit context', () => {
  assert.equal(chainToSite({}), '[]');
});
