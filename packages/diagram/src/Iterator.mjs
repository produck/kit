import { getName, getParent, isKit } from '@produck/kit';

export function* chainOf(kit) {
  let current = kit;

  while (current != null) {
    if (!isKit(current)) {
      break;
    }

    yield getName(current);
    current = getParent(current);
  }
}
