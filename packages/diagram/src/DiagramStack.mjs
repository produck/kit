import { chainOf } from './Iterator.mjs';

export default function DiagramStack(kit) {
  const chain = [...chainOf(kit)].reverse();

  if (chain.length === 0) {
    return '';
  }

  const OFFSET = 2;
  const boxes = chain.map((name, i) => ({
    name,
    left: i * OFFSET,
    inner: name.length + 2,
  }));
  const cols = Math.max(...boxes.map((b) => b.left + b.inner + 2));
  const rows = 1 + 2 * chain.length;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(' '));

  function merge(a, b) {
    if (a === ' ') {
      return b;
    }

    const key = a + b;
    const map = { '─┌': '┬', '─┐': '┬', '┘─': '┴', '─┘': '┴' };

    return key in map ? map[key] : b;
  }

  for (let i = 0; i < boxes.length; i++) {
    const { left, inner, name } = boxes[i];
    const row = i * 2;
    const top = `┌${'─'.repeat(inner)}┐`;
    const mid = `│ ${name} │`;
    const bot = `└${'─'.repeat(inner)}┘`;

    for (let c = 0; c < top.length; c++) {
      grid[row][left + c] = merge(grid[row][left + c], top[c]);
      grid[row + 1][left + c] = merge(grid[row + 1][left + c], mid[c]);
      grid[row + 2][left + c] = merge(grid[row + 2][left + c], bot[c]);
    }
  }

  return grid.map((r) => r.join('').replace(/\s+$/, '')).join('\n');
}
