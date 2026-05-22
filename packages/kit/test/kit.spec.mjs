import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '../src/index.mjs';

describe('Kit::', function () {
  it('should create a Kit from global Kit', function () {
    const newKit = Kit.global('new');

    assert.strictEqual(newKit.Kit, newKit);
  });

  it('should throw if bad name.', function () {
    assert.throws(() => Kit.global(1), {
      name: 'TypeError',
      message: 'Invalid "args[0] as name", one "string" expected.',
    });
  });

  it('should throw if accessing bad dep.', function () {
    assert.throws(() => Kit.global().foo, {
      name: 'ReferenceError',
      message: 'Dependence "foo" is undefined.\n',
    });
  });

  it('should throw if set a duplicated dep.', function () {
    const kit = Kit.global('foo');

    kit.bar = {};

    assert.throws(() => (kit.bar = 'baz'), {
      name: 'Error',
      message: 'Dependence "bar" exists.\n',
    });
  });

  it('should throw if accessing by symbol key.', function () {
    assert.throws(() => Kit.global()[Symbol()], {
      name: 'TypeError',
      message: 'Cannot convert a Symbol value to a string',
    });
  });

  it('should throw if setDiagram receives non-function.', function () {
    assert.throws(() => Kit.setDiagram(Kit.global, 42), {
      name: 'TypeError',
      message: 'Invalid "args[1] as diagram", one "function | null" expected.',
    });
  });

  it('should support per-kit setDiagram.', function () {
    const kit = Kit.global('scope');

    function chainToRoot(k) {
      const names = [];
      let current = k;

      while (current != null) {
        names.push(Kit.getName(current));
        current = Kit.getParent(current);
      }

      return `[${names.join('] --|> [')}]`;
    }

    Kit.setDiagram(kit, chainToRoot);

    assert.throws(() => kit.foo, {
      name: 'ReferenceError',
      message: 'Dependence "foo" is undefined.\n[scope] --|> [Kit::Global]',
    });

    Kit.setDiagram(kit);

    assert.throws(() => kit.foo, {
      name: 'ReferenceError',
      message: 'Dependence "foo" is undefined.\n',
    });
  });

  describe('getName()', function () {
    it('should return the name of the kit.', function () {
      assert.strictEqual(Kit.getName(Kit.global), 'Kit::Global');
    });

    it('should return the child kit name.', function () {
      const kit = Kit.global('named');

      assert.strictEqual(Kit.getName(kit), 'named');
    });

    it('should throw if argument is not a Kit.', function () {
      assert.throws(() => Kit.getName({}), {
        name: 'TypeError',
        message: 'Invalid "args[0] as kit", one "Kit" expected.',
      });
    });
  });

  describe('getParent()', function () {
    it('should return null for root kit.', function () {
      assert.strictEqual(Kit.getParent(Kit.global), null);
    });

    it('should return the parent of a child kit.', function () {
      const kit = Kit.global('child');

      assert.strictEqual(Kit.getParent(kit), Kit.global);
    });

    it('should return the grandparent.', function () {
      const kit = Kit.global('parent');
      const child = kit('child');

      assert.strictEqual(Kit.getParent(child), kit);
      assert.strictEqual(Kit.getParent(kit), Kit.global);
    });

    it('should throw if argument is not a Kit.', function () {
      assert.throws(() => Kit.getParent({}), {
        name: 'TypeError',
        message: 'Invalid "args[0] as kit", one "Kit" expected.',
      });
    });
  });

  describe('getDependencePropertyList()', function () {
    it('should return Kit and version as the default dependencies.', function () {
      assert.deepStrictEqual(Kit.getDependencePropertyList(Kit.global), [
        'Kit',
        'version',
      ]);
    });

    it('should return custom dependencies.', function () {
      const kit = Kit.global('withDeps');

      kit.foo = 1;
      kit.bar = 2;

      assert.deepStrictEqual(Kit.getDependencePropertyList(kit), [
        'Kit',
        'foo',
        'bar',
      ]);
    });

    it('should include symbol keys.', function () {
      const kit = Kit.global('withSym');
      const sym = Symbol('secret');

      kit[sym] = 'hidden';

      const list = Kit.getDependencePropertyList(kit);

      assert.ok(list.includes('Kit'));
      assert.ok(list.includes(sym));
    });

    it('should throw if argument is not a Kit.', function () {
      assert.throws(() => Kit.getDependencePropertyList({}), {
        name: 'TypeError',
        message: 'Invalid "args[0] as kit", one "Kit" expected.',
      });
    });
  });
});
