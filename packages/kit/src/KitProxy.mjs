import * as Ow from '@produck/ow';
import { ThrowTypeError } from '@produck/type-error';
import * as KitDiagram from '@produck/kit-diagram';

export const internals = new WeakMap();

let MakeDiagram = KitDiagram.empty;

export const setDiagram = (diagram = KitDiagram.empty) => {
  if (typeof diagram !== 'function') {
    Ow.throw(new TypeError('Invalid "diagram", one function expected.'));
  }

  MakeDiagram = diagram;
};

const throwError = (currentKit, message, Constructor = Error) => {
  Ow.throw(new Constructor(`${message}\n${MakeDiagram(currentKit)}`));
};

const PROXY_HANDLER = {
  get: (_Kit, property, Kit) => {
    const { dependencies, parent } = _Kit.context;

    if (property in dependencies) {
      return dependencies[property];
    }

    try {
      if (parent === null) {
        Ow.Error.Range('KIT_PARENT_CHAIN_END');
      }

      return parent[property];
    } catch {
      throwError(Kit, `Dependence "${property}" is undefined.`, ReferenceError);
    }
  },
  set: (_Kit, property, dependence, Kit) => {
    const { dependencies } = _Kit.context;

    if (property in dependencies) {
      throwError(Kit, `Dependence "${property}" exists.`);
    }

    dependencies[property] = dependence;

    return true;
  },
};

export const KitProxy = (name = '<Anonymous>', parent) => {
  if (typeof name !== 'string') {
    ThrowTypeError('args[0] as name', 'string');
  }

  const _Kit = (childName) => KitProxy(childName, Kit);
  const Kit = new Proxy(_Kit, PROXY_HANDLER);
  const dependencies = Object.create(null);

  dependencies.Kit = Kit;

  _Kit.context = { name, parent, dependencies };
  internals.set(Kit, _Kit);

  return Kit;
};

export const isKit = (value) => internals.has(value);
