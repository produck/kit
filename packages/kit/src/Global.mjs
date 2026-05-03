import * as Ow from '@produck/ow';
import * as TypeError from '@produck/type-error';

const map = new WeakMap();

const throwError = (currentKit, message, Constructor = Error) => {
	const chain = [];

	while (currentKit !== null) {
		const { name, prototype } = map.get(currentKit).context;

		chain.push(name);
		currentKit = prototype;
	}

	Ow.throw(new Constructor(`${message}\n[${chain.join('] --|> [')}]`));
};

const isString = any => typeof any === 'string';

const PROXY_HANDLER = {
	get: (_Kit, name, Kit) =>  {
		const { dependencies, prototype } = _Kit.context;

		if (name in dependencies) {
			return dependencies[name];
		}

		if (prototype === null) {
			throw null;
		}

		try {
			return prototype[name];
		} catch {
			throwError(Kit, `No dependence named "${name}" is defined.`, ReferenceError);
		}
	},
	set: (_Kit, name, dependence, Kit) => {
		const { dependencies } = _Kit.context;

		if (name in dependencies) {
			throwError(Kit, `There has been a dependence named "${name}".`);
		}

		dependencies[name] = dependence;

		return true;
	},
};

const KitProxy = (name = '<Anonymous>', prototype) => {
	if (!isString(name)) {
		throwError(prototype, TypeError.ErrorMessage('name', 'string'), TypeError);
	}

	const _Kit = name => KitProxy(name, Kit);
	const Kit = new Proxy(_Kit, PROXY_HANDLER);

	_Kit.context = { name, prototype, dependencies: { Kit } };
	map.set(Kit, _Kit);

	return Kit;
};

import version from './version.gen.mjs';

export const global = KitProxy('Kit::Global', null);
export const isKit = value => map.has(value);

global.version = version;
