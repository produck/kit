import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '../src/index.mjs';

describe('Injector::', function () {
  describe('constructor', function () {
    it('should throw if kit is not a Kit.', function () {
      assert.throws(() => Kit.Injector({}), {
        name: 'TypeError',
        message: 'Invalid "args[0] as kit", one "Kit" expected.',
      });
    });

    it('should throw if required is not an array.', function () {
      assert.throws(() => Kit.Injector(Kit.global, 'foo'), {
        name: 'TypeError',
        message:
          'Invalid "args[1] as required", one "number | string | symbol[]" expected.',
      });
    });

    it('should throw if a required element is not a valid property type.', function () {
      assert.throws(() => Kit.Injector(Kit.global, [true]), {
        name: 'TypeError',
        message:
          'Invalid "args[1][0]", one "number | string | symbol" expected.',
      });
    });

    it('should throw if a required dep is missing on kit.', function () {
      assert.throws(() => Kit.Injector(Kit.global, ['missing']), {
        name: 'ReferenceError',
      });
    });

    it('should create an injector with default args.', function () {
      assert.ok(Kit.Injector());
    });

    it('should create an injector with explicit kit and empty required.', function () {
      const kit = Kit.global('InjectorTest');

      assert.ok(Kit.Injector(kit, []));
    });

    it('should create an injector with all valid property types in required.', function () {
      const kit = Kit.global('PropTypeTest');
      const sym = Symbol('s');

      kit['strKey'] = 1;
      kit[42] = 2;
      kit[sym] = 3;

      assert.ok(Kit.Injector(kit, ['strKey', 42, sym]));
    });
  });

  describe('bind()', function () {
    it('should throw if fn is not a function.', function () {
      const injector = Kit.Injector(Kit.global);

      assert.throws(() => injector.bind('not a function'), {
        name: 'TypeError',
        message: 'Invalid "args[0] as fn", one "function" expected.',
      });
    });

    it('should return a function that passes kit as first argument.', function () {
      const kit = Kit.global('BindTest');
      const injector = Kit.Injector(kit);
      let received;

      const bound = injector.bind((k) => {
        received = k;
      });

      bound();
      assert.strictEqual(received, kit);
    });

    it('should bind thisArg correctly.', function () {
      const kit = Kit.global('BindThisTest');
      const injector = Kit.Injector(kit);
      const ctx = { x: 42 };

      injector.bind(function () {
        assert.strictEqual(this, ctx);
      }, ctx)();
    });

    it('should pass extra call-site arguments after the kit.', function () {
      const kit = Kit.global('BindArgsTest');
      const injector = Kit.Injector(kit);
      let args;

      const bound = injector.bind((...a) => {
        args = a;
      });

      bound('a', 'b');
      assert.deepEqual(args, [kit, 'a', 'b']);
    });
  });
});
