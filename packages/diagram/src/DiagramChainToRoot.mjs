import { chainOf } from './Iterator.mjs';

export default function DiagramChainToRoot(kit) {
  return `[${[...chainOf(kit)].join('] --|> [')}]`;
}
