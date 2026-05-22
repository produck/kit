import { chainOf } from './Iterator.mjs';

export default function DiagramOverview(kit) {
  const chain = [...chainOf(kit)];

  return [
    `[Site::${chain[0]}]`,
    `[${chain.join('] --|> [')}]`,
    `[Root::${chain[chain.length - 1]}]`,
  ].join('\n');
}
