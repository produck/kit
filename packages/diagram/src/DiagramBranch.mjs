import { chainOf } from './Iterator.mjs';

export default function DiagramBranch(kit) {
  const chain = [...chainOf(kit)].reverse();

  return chain
    .map((name, i) => {
      if (i === 0) return name;

      const indent = 4 * (i - 1);

      return `${' '.repeat(indent)}└── ${name}`;
    })
    .join('\n');
}
