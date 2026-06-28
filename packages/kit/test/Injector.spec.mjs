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
          'Invalid "args[1] as required", one "string | symbol[]" expected.',
      });
    });

    it('should throw if a required element is not a valid dependence name.', function () {
      assert.throws(() => Kit.Injector(Kit.global, [true]), {
        name: 'TypeError',
        message: 'Invalid "args[1][0]", one "string | symbol" expected.',
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

    it('should create an injector with all valid dependence names in required.', function () {
      const kit = Kit.global('DepNameTest');
      const sym = Symbol('s');

      kit['strKey'] = 1;
      kit[sym] = 3;

      assert.ok(Kit.Injector(kit, ['strKey', sym]));
    });
  });

  describe('bind()', function () {
    it('should throw if recipe is not a function.', function () {
      const injector = Kit.Injector(Kit.global);

      assert.throws(() => injector.bind('not a function'), {
        name: 'TypeError',
        message: 'Invalid "args[0] as recipe", one "function" expected.',
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

    it('should pass extra call-site arguments as an array.', function () {
      const kit = Kit.global('BindArgsTest');
      const injector = Kit.Injector(kit);
      let receivedKit, receivedArgs;

      const bound = injector.bind((k, callArgs) => {
        receivedKit = k;
        receivedArgs = callArgs;
      });

      bound('a', 'b');
      assert.strictEqual(receivedKit, kit);
      assert.deepEqual(receivedArgs, ['a', 'b']);
    });

    it('should be used like', () => {
      const mock = Kit.global('for injector sample');

      mock.a = 10;

      const bound = Kit.Injector(mock).bind((kit, [x, y]) => {
        return kit.a * x + y;
      });

      assert.equal(bound(7, 9), 79);
    });

    it('should name the bound function as KitInject_<recipeName>', function () {
      const kit = Kit.global('BindNameTest');
      const injector = Kit.Injector(kit);
      const bound = injector.bind(function myRecipe() {});

      assert.strictEqual(bound.name, 'KitInject_myRecipe');
    });
  });
});
