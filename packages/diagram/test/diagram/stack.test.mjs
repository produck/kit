import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as Kit from '@produck/kit';
import { stack } from '../../index.mjs';

const root = Kit.global;
const foo = root('foo');
const bar = foo('bar');

describe('stack()', () => {
  it('should render a 3-level stack from global to leaf.', () => {
    assert.equal(
      stack(bar),
      [
        '┌─────────────┐',
        '│ Kit::Global │',
        '└─┬─────┬─────┘',
        '  │ foo │',
        '  └─┬───┴─┐',
        '    │ bar │',
        '    └─────┘',
      ].join('\n'),
    );
  });

  it('should render a 1-level stack for global itself.', () => {
    assert.equal(
      stack(Kit.global),
      ['┌─────────────┐', '│ Kit::Global │', '└─────────────┘'].join('\n'),
    );
  });

  it('should render a 2-level stack.', () => {
    assert.equal(
      stack(foo),
      [
        '┌─────────────┐',
        '│ Kit::Global │',
        '└─┬─────┬─────┘',
        '  │ foo │',
        '  └─────┘',
      ].join('\n'),
    );
  });

  it('should return empty string for invalid kit.', () => {
    assert.equal(stack({}), '');
  });
});
