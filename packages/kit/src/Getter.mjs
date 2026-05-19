import { assertProperty } from './Property.mjs';

export function Getter(property) {
  assertProperty(property, 'args[0] as property');

  return Object.freeze({
    use(kit) {
      return kit[this.#property];
    },
    touch(kit) {
      try {
        return this.use(kit);
      } catch {
        return undefined;
      }
    },
  });
}
