import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as Kit from '@produck/kit';

import {
  empty,
  chainToRoot,
  chainToSite,
  vertical,
  overview,
} from '../index.mjs';

describe('@produck/kit-diagram', () => {
  const root = Kit.global;
  const foo = root('foo');
  const bar = foo('bar');

  it('should make empty diagram', () => {
    assert.equal(empty(bar), '');
  });

  it('should make chain-to-root diagram', () => {
    assert.equal(chainToRoot(bar), '[bar] --|> [foo] --|> [Kit::Global]');
  });

  it('should make chain-to-site diagram', () => {
    assert.equal(chainToSite(bar), '[Kit::Global] <|-- [foo] <|-- [bar]');
  });

  it('should make vertical diagram', () => {
    assert.equal(
      vertical(bar),
      '[bar]\n  |\n  v\n[foo]\n  |\n  v\n[Kit::Global]',
    );
  });

  it('should make overview diagram', () => {
    assert.equal(
      overview(bar),
      '[Site::bar]\n[bar] --|> [foo] --|> [Kit::Global]\n[Root::Kit::Global]',
    );
  });

  it('should reflect raw behavior for invalid kit context', () => {
    assert.equal(chainToRoot({}), '[]');
    assert.equal(chainToSite({}), '[]');
    assert.equal(vertical({}), '');
    assert.equal(overview({}), '[Site::undefined]\n[]\n[Root::undefined]');
  });
});
