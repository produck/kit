import { ThrowTypeError } from '@produck/type-error';

const TYPE_LIST = ['number', 'string', 'symbol'];

export const DESCRIPTION = TYPE_LIST.join(' | ');

export function isPropertyType(value) {
	return TYPE_LIST.includes(typeof value);
}

export function assertProperty(value, role) {
	if (!isPropertyType(value)) {
		ThrowTypeError(role, DESCRIPTION);
	}
}
