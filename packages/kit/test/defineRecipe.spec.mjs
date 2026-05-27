import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '../src/index.mjs';

describe('defineRecipe', function () {
  it('should exist and be a function', function () {
    assert.strictEqual(typeof Kit.defineRecipe, 'function');
  });

  it('should return the same function when used', function () {
    function recipe(kit, args) {
      return { kitName: Kit.getName(kit), args };
    }

    const wrapped = Kit.defineRecipe(recipe);

    // behaviour: calling wrapped directly should behave like original
    const k = Kit.global('defineRecipeTest');
    const out = wrapped(k, ['x', 2]);

    assert.deepEqual(out, { kitName: Kit.getName(k), args: ['x', 2] });
  });

  it('works with Injector.bind and passes args as array', function () {
    const k = Kit.global('defineRecipeBind');
    k.db = { insert: (p) => ({ id: 1, ...p }) };

    const recipe = Kit.defineRecipe((kit, [payload]) => kit.db.insert(payload));
    const handler = Kit.Injector(k, ['db']).bind(recipe);

    const res = handler({ name: 'bob' });
    assert.deepEqual(res, { id: 1, name: 'bob' });
  });

  it('should throw if recipe is not a function', function () {
    assert.throws(() => Kit.defineRecipe('not a function'), {
      name: 'TypeError',
      message: 'Invalid "args[0] as recipe", one "function" expected.',
    });
  });
});
