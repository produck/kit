import { ThrowTypeError } from '@produck/type-error';
import { KitProxy, isKit, setDiagram, internals } from './KitProxy.mjs';
import { KitInjector } from './Injector.mjs';
import { Getter } from './Getter.mjs';
import version from './version.gen.mjs';

const global = KitProxy('Kit::Global', null);

global.version = version;

export { global, global as default, Getter, isKit, setDiagram };

export function Injector(kit = global, required = []) {
  return new KitInjector(kit, required);
}

function assertKitAtArgsFirst(kit) {
  if (!isKit(kit)) {
    ThrowTypeError('args[0] as kit', 'Kit');
  }
}

export function getParent(kit) {
  assertKitAtArgsFirst(kit);

  return internals.get(kit).parent;
}

export function getName(kit) {
  assertKitAtArgsFirst(kit);

  return internals.get(kit).name;
}

export function getDependencePropertyList(kit) {
  assertKitAtArgsFirst(kit);

  const { dependencies } = internals.get(kit);

  return [
    ...Object.getOwnPropertyNames(dependencies),
    ...Object.getOwnPropertySymbols(dependencies),
  ];
}
