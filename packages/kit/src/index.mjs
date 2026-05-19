import { KitProxy, isKit, setDiagram } from './KitProxy.mjs';
import { KitInjector } from './Injector.mjs';
import { Getter } from './Getter.mjs';
import version from './version.gen.mjs';

const global = KitProxy('Kit::Global', null);

global.version = version;

export { global, global as default, Getter, isKit, setDiagram };

export function Injector(kit = global, required = []) {
  return new KitInjector(kit, required);
}
