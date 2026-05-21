import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Getter, global } from '../src/index.mjs';

describe('Getter::', function () {
  describe('constructor', function () {
    it('should throw if property is not a valid property type.', function () {
      assert.throws(() => Getter(true), {
        name: 'TypeError',
        message:
          'Invalid "args[0] as property", one "number | string | symbol" expected.',
      });
    });

    it('should throw if property is missing.', function () {
      assert.throws(() => Getter(), {
        name: 'TypeError',
        message:
          'Invalid "args[0] as property", one "number | string | symbol" expected.',
      });
    });

    it('should return a frozen object.', function () {
      const g = Getter('foo');

      assert.ok(Object.isFrozen(g));
    });
  });

  describe('.use()', function () {
    it('should return the value from kit for a string key.', function () {
      const kit = global('GetterUseString');
      kit.foo = 42;

      assert.strictEqual(Getter('foo').use(kit), 42);
    });

    it('should return the value from kit for a numeric key.', function () {
      const kit = global('GetterUseNum');
      kit[0] = 'zero';

      assert.strictEqual(Getter(0).use(kit), 'zero');
    });

    it('should return the value from kit for a symbol key.', function () {
      const kit = global('GetterUseSym');
      const sym = Symbol('g');
      kit[sym] = 'symbolic';

      assert.strictEqual(Getter(sym).use(kit), 'symbolic');
    });

    it('should throw if the property is missing on kit.', function () {
      const kit = global('GetterUseMissing');

      assert.throws(() => Getter('missing').use(kit), {
        name: 'ReferenceError',
      });
    });
  });

  describe('.touch()', function () {
    it('should return the value from kit when present.', function () {
      const kit = global('GetterTouchPresent');
      kit.bar = 'value';

      assert.strictEqual(Getter('bar').touch(kit), 'value');
    });

    it('should return undefined when the property is missing on kit.', function () {
      const kit = global('GetterTouchMissing');

      assert.strictEqual(Getter('nope').touch(kit), undefined);
    });
  });
});
