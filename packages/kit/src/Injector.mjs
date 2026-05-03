import { ThrowTypeError } from '@produck/type-error';
import { isKit } from './Global.mjs';

const PROPERTY_TYPE_LIST = ['number', 'string', 'symbol'];
const PROPERTY_TYPE_DESCRIPTION = PROPERTY_TYPE_LIST.join(' | ');

function isPropertyType(value) {
	return PROPERTY_TYPE_LIST.includes(typeof value);
}

function normalizeRequired(value) {
	const _value = [];

	if (Array.isArray(value)) {
		for (const index in value) {
			if (isPropertyType(value[index])) {
				_value[index] = value[index];
			}

			ThrowTypeError(`options.required[${index}]`, PROPERTY_TYPE_DESCRIPTION);
		}
	} else {
		ThrowTypeError('options.required', `${PROPERTY_TYPE_DESCRIPTION}[]`);
	}

	return _value;
}

function accessPropertyOfKit(kit, list) {
	for (const key of list) {
		void kit[key];
	}
}

function assertIsKit(value, position) {
	if (!isKit(value)) {
		ThrowTypeError(`${position} as kit`, 'Kit');
	}
}

export function apply(kit, fn, args = [], required = []) {
	assertIsKit(kit, 'args[0]');
	accessPropertyOfKit(kit, normalizeRequired(required));

	const [thisArg, ...restArgs] = args;

	return fn.call(thisArg, kit, ...restArgs);
}

export function bind(kit, fn, args = [], required = []) {
	assertIsKit(kit, 'args[0]');
	accessPropertyOfKit(kit, normalizeRequired(required));

	const [thisArg, ...restArgs] = args;

	return fn.bind(thisArg, kit, ...restArgs);
}
