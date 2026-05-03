import { ThrowTypeError } from '@produck/type-error';
import { isKit } from './Global.mjs';

const PROPERTY_TYPE_LIST = ['number', 'string', 'symbol'];
const PROPERTY_TYPE_DESCRIPTION = PROPERTY_TYPE_LIST.join(' | ');

function isPropertyType(value) {
	return PROPERTY_TYPE_LIST.includes(typeof value);
}

const I_KIT = Symbol('#kit');

export class KitInjector {
	constructor(kit, required) {
		if (!isKit(kit)) {
			ThrowTypeError('args[0] as kit', 'Kit');
		}

		if (!Array.isArray(required)) {
			ThrowTypeError('args[1] as required', `${PROPERTY_TYPE_DESCRIPTION}[]`);
		}

		for (const index in required) {
			if (!isPropertyType(required[index])) {
				ThrowTypeError(`args[1][${index}]`, PROPERTY_TYPE_DESCRIPTION);
			}

			void kit[required[index]];
		}

		this[I_KIT] = kit;
	}

	bind(fn, thisArg = undefined) {
		if (typeof fn !== 'function') {
			ThrowTypeError('args[0] as fn', 'function');
		}

		return fn.bind(thisArg, this[I_KIT]);
	}
}
