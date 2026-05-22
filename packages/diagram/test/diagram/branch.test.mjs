import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as Kit from '@produck/kit';
import { branch } from '../../index.mjs';

const root = Kit.global;
const foo = root('foo');
const bar = foo('bar');

describe('branch()', () => {
  it('should render a 3-level branch from global to leaf.', () => {
    assert.equal(branch(bar), 'Kit::Global\n└── foo\n    └── bar');
  });

  it('should render a 1-level branch for global itself.', () => {
    assert.equal(branch(Kit.global), 'Kit::Global');
  });

  it('should render a 2-level branch.', () => {
    assert.equal(branch(foo), 'Kit::Global\n└── foo');
  });

  it('should return empty string for invalid kit.', () => {
    assert.equal(branch({}), '');
  });
});
