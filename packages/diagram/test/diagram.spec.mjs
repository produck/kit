import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  empty,
  chainToRoot,
  chainToSite,
  vertical,
  overview,
} from '../index.mjs';

describe('@produck/kit-diagram', () => {
  const SYM_KIT = Symbol.for('@produck/kit/internals');
  const root = { [SYM_KIT]: { name: 'Root', parent: null } };
  const parent = { [SYM_KIT]: { name: 'Parent', parent: root } };
  const leaf = { [SYM_KIT]: { name: 'Leaf', parent } };

  it('should make empty diagram', () => {
    assert.equal(empty(leaf), '');
  });

  it('should make chain-to-root diagram', () => {
    assert.equal(chainToRoot(leaf), '[Leaf] --|> [Parent] --|> [Root]');
  });

  it('should make chain-to-site diagram', () => {
    assert.equal(chainToSite(leaf), '[Root] <|-- [Parent] <|-- [Leaf]');
  });

  it('should make vertical diagram', () => {
    assert.equal(
      vertical(leaf),
      '[Leaf]\n  |\n  v\n[Parent]\n  |\n  v\n[Root]',
    );
  });

  it('should make overview diagram', () => {
    assert.equal(
      overview(leaf),
      '[Site::Leaf]\n[Leaf] --|> [Parent] --|> [Root]\n[Root::Root]',
    );
  });

  it('should reflect raw behavior for invalid kit context', () => {
    assert.equal(chainToRoot({}), '[]');
    assert.equal(chainToSite({}), '[]'); // single node, no arrow rendered
    assert.equal(vertical({}), '');
    assert.equal(overview({}), '[Site::undefined]\n[]\n[Root::undefined]');
  });
});
