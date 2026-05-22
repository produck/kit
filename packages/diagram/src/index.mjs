import { getName, getParent, isKit } from '@produck/kit';

const chainOf = (kit) => {
  const chain = [];
  let current = kit;

  while (current != null) {
    if (!isKit(current)) {
      break;
    }

    chain.push(getName(current));
    current = getParent(current);
  }

  return chain;
};

export function chainToRoot(kit) {
  return `[${chainOf(kit).join('] --|> [')}]`;
}

export function chainToSite(kit) {
  return `[${chainOf(kit).reverse().join('] <|-- [')}]`;
}

export function vertical(kit) {
  return chainOf(kit)
    .map((name) => `[${name}]`)
    .join('\n  |\n  v\n');
}

export function overview(kit) {
  const chain = chainOf(kit);

  return [
    `[Site::${chain[0]}]`,
    `[${chain.join('] --|> [')}]`,
    `[Root::${chain[chain.length - 1]}]`,
  ].join('\n');
}

export function cascade(kit) {
  const chain = chainOf(kit).reverse();
  const maxLen = Math.max(...chain.map((n) => n.length), 0);
  const inner = maxLen + 2;
  const bar = '─'.repeat(inner);
  const half = Math.floor((inner - 1) / 2);
  const right = inner - 1 - half;
  const connectorTop = `┌${'─'.repeat(half)}┴${'─'.repeat(right)}┐`;
  const connectorBot = `└${'─'.repeat(half)}┬${'─'.repeat(right)}┘`;
  const spacer = `${' '.repeat(half + 1)}│`;
  const lines = [];

  for (let i = 0; i < chain.length; i++) {
    const name = chain[i];
    const pad = Math.max(0, Math.floor((inner - name.length) / 2));
    const padded =
      ' '.repeat(pad) + name + ' '.repeat(inner - pad - name.length);

    if (i === 0) {
      lines.push(`┌${bar}┐`, `│${padded}│`);

      if (chain.length === 1) {
        lines.push(`└${bar}┘`);
      } else {
        lines.push(connectorBot, spacer);
      }
    } else if (i === chain.length - 1) {
      lines.push(connectorTop, `│${padded}│`, `└${bar}┘`);
    } else {
      lines.push(connectorTop, `│${padded}│`, connectorBot, spacer);
    }
  }

  return lines.join('\n');
}

export function stack(kit) {
  const chain = chainOf(kit).reverse();
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
    if (a === ' ' || b === ' ') return a === ' ' ? b : a;
    if (a === '─' && (b === '┌' || b === '┐')) return '┬';
    if (b === '─' && (a === '┌' || a === '┐')) return '┬';
    if ((a === '┘' || a === '└') && b === '─') return '┴';
    if ((b === '┘' || b === '└') && a === '─') return '┴';
    return b;
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

export function branch(kit) {
  const chain = chainOf(kit).reverse();

  return chain
    .map((name, i) => {
      if (i === 0) return name;

      const indent = 4 * (i - 1);

      return `${' '.repeat(indent)}└── ${name}`;
    })
    .join('\n');
}
