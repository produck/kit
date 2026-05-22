import { chainOf } from './Iterator.mjs';

export default function DiagramCascade(kit) {
  const chain = [...chainOf(kit)].reverse();
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
