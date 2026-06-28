import { ThrowTypeError } from '@produck/type-error';

const TYPE_LIST = ['string', 'symbol'];

export const DESCRIPTION = TYPE_LIST.join(' | ');

export function isName(value) {
  return TYPE_LIST.includes(typeof value);
}

export function assertName(value, role) {
  if (!isName(value)) {
    ThrowTypeError(role, DESCRIPTION);
  }
}
