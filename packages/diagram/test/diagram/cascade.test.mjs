import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as Kit from '@produck/kit';
import { cascade } from '../../index.mjs';

const root = Kit.global;
const foo = root('foo');
const bar = foo('bar');

describe('cascade()', () => {
  it('should render a 3-level cascade from global to leaf.', () => {
    assert.equal(
      cascade(bar),
      [
        '┌─────────────┐',
        '│ Kit::Global │',
        '└──────┬──────┘',
        '       │',
        '┌──────┴──────┐',
        '│     foo     │',
        '└──────┬──────┘',
        '       │',
        '┌──────┴──────┐',
        '│     bar     │',
        '└─────────────┘',
      ].join('\n'),
    );
  });

  it('should render a 1-level cascade for global itself.', () => {
    assert.equal(
      cascade(Kit.global),
      ['┌─────────────┐', '│ Kit::Global │', '└─────────────┘'].join('\n'),
    );
  });

  it('should render a 2-level cascade.', () => {
    assert.equal(
      cascade(foo),
      [
        '┌─────────────┐',
        '│ Kit::Global │',
        '└──────┬──────┘',
        '       │',
        '┌──────┴──────┐',
        '│     foo     │',
        '└─────────────┘',
      ].join('\n'),
    );
  });

  it('should return empty string for invalid kit.', () => {
    assert.equal(cascade({}), '');
  });
});
