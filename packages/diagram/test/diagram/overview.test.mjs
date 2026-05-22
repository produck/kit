import assert from 'node:assert/strict';
import { it } from 'node:test';
import * as Kit from '@produck/kit';
import { overview } from '../../index.mjs';

const root = Kit.global;
const foo = root('foo');
const bar = foo('bar');

it('should make overview diagram', () => {
  assert.equal(
    overview(bar),
    '[Site::bar]\n[bar] --|> [foo] --|> [Kit::Global]\n[Root::Kit::Global]',
  );
});

it('should reflect raw behavior for invalid kit context', () => {
  assert.equal(overview({}), '[Site::undefined]\n[]\n[Root::undefined]');
});
