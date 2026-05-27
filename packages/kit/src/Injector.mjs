import { ThrowTypeError } from '@produck/type-error';
import { isKit } from './KitProxy.mjs';
import * as Property from './Property.mjs';

const I_KIT = Symbol('#kit');

export class KitInjector {
  constructor(kit, required) {
    if (!isKit(kit)) {
      ThrowTypeError('args[0] as kit', 'Kit');
    }

    if (!Array.isArray(required)) {
      ThrowTypeError('args[1] as required', `${Property.DESCRIPTION}[]`);
    }

    for (const index in required) {
      Property.assertProperty(required[index], `args[1][${index}]`);
      void kit[required[index]];
    }

    this[I_KIT] = kit;
  }

  bind(recipe) {
    if (typeof recipe !== 'function') {
      ThrowTypeError('args[0] as recipe', 'function');
    }

    return (...args) => recipe(this[I_KIT], args);
  }
}

export function defineRecipe(recipe) {
  if (typeof recipe !== 'function') {
    ThrowTypeError('args[0] as recipe', 'function');
  }

  return recipe;
}
