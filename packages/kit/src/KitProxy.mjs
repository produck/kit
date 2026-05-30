import * as Ow from '@produck/ow';
import { ThrowTypeError } from '@produck/type-error';

export const internals = new WeakMap();

const throws = (kit, message, Constructor = Error) => {
  const messages = [message];
  const { diagram } = internals.get(kit).context;

  if (diagram !== null) {
    messages.push(diagram(kit));
  }

  Ow.throw(new Constructor(messages.join('\n')));
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
      throws(Kit, `Dependence "${property}" is undefined.`, ReferenceError);
    }
  },
  set: (_Kit, property, dependence, Kit) => {
    const { dependencies } = _Kit.context;

    if (property in dependencies) {
      throws(Kit, `Dependence "${property}" exists.`);
    }

    dependencies[property] = dependence;

    return true;
  },
  deleteProperty: () => Ow.Error.Common('Delete operation is not allowed.'),
  has: () => Ow.Error.Common('"in" operator is not allowed on a Kit.'),
  ownKeys: () => Ow.Error.Common('Enumeration is not allowed on a Kit.'),
};

export const KitProxy = (name = '<Anonymous>', parent) => {
  if (typeof name !== 'string') {
    ThrowTypeError('args[0] as name', 'string');
  }

  const _Kit = (childName) => KitProxy(childName, Kit);
  const Kit = new Proxy(_Kit, PROXY_HANDLER);
  const dependencies = Object.create(null);

  dependencies.Kit = Kit;

  _Kit.context = { name, parent, dependencies, diagram: null };
  internals.set(Kit, _Kit);

  return Kit;
};

export const isKit = (value) => internals.has(value);
