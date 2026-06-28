import * as Dependence from './Dependence.mjs';

export function Getter(name) {
  Dependence.assertName(name, 'args[0] as name');

  return Object.freeze({
    use(kit) {
      return kit[name];
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
