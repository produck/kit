import { chainOf } from './Iterator.mjs';

export default function DiagramVertical(kit) {
  return [...chainOf(kit)].map((name) => `[${name}]`).join('\n  |\n  v\n');
}
