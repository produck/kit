import { chainOf } from './Iterator.mjs';

export default function DiagramChainToSite(kit) {
  const chain = [...chainOf(kit)];

  return `[${chain.reverse().join('] <|-- [')}]`;
}
