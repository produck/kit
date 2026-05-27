import { ThrowTypeError } from '@produck/type-error';
import { KitProxy, isKit, internals } from './KitProxy.mjs';
import { KitInjector, defineRecipe } from './Injector.mjs';
import { Getter } from './Getter.mjs';
import * as META from './meta.gen.mjs';

const global = KitProxy('Kit::Global', null);

global.version = META.VERSION;

export function Injector(kit = global, required = []) {
  return new KitInjector(kit, required);
}

function useKitContextTo(fn) {
  return (kit, ...rest) => {
    if (!isKit(kit)) {
      ThrowTypeError('args[0] as kit', 'Kit');
    }

    return fn(internals.get(kit).context, ...rest);
  };
}

export const getParent = useKitContextTo(({ parent }) => parent);
export const getName = useKitContextTo(({ name }) => name);

export const getDependencePropertyList = useKitContextTo(({ dependencies }) => [
  ...Object.getOwnPropertyNames(dependencies),
  ...Object.getOwnPropertySymbols(dependencies),
]);

export const setDiagram = useKitContextTo((context, diagram = null) => {
  if (typeof diagram !== 'function' && diagram !== null) {
    ThrowTypeError('args[1] as diagram', 'function | null');
  }

  context.diagram = diagram;
});

export { global, global as default, Getter, isKit, defineRecipe };
