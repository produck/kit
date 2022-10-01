const map = new WeakMap();

const throwError = (currentKit, message, Constructor = Error) => {
	const chain = [];

	while (currentKit !== null) {
		const { name, prototype } = map.get(currentKit).context;

		chain.push(name);
		currentKit = prototype;
	}

	throw new Constructor(`${message}\n[${chain.join('] --|> [')}]`);
};

const assertProperty = (any, Kit) => {
	if (typeof any !== 'string') {
		throwError(Kit, 'Invalid "property", one "string" expected.', TypeError);
	}
};

const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const NO_DEPENDENCE_SIGNAL = null;

const PROXY_HANDLER = {
	get: (_Kit, name, Kit) =>  {
		assertProperty(name, Kit);

		const { dependencies, prototype } = _Kit.context;

		if (has(dependencies, name)) {
			return dependencies[name];
		}

		if (prototype === null) {
			throw NO_DEPENDENCE_SIGNAL;
		}

		try {
			return prototype[name];
		} catch (error) {
			throwError(Kit, `No dependence named "${name}" is defined.`, ReferenceError);
		}
	},
	set: (_Kit, name, dependence, Kit) => {
		assertProperty(name, Kit);

		const { dependencies } = _Kit.context;

		if (has(dependencies, name)) {
			throwError(Kit, `There has been a dependence named "${name}".`);
		}

		dependencies[name] = dependence;

		return true;
	}
};

const KitProxy = (name = '<Anonymous>', prototype) => {
	if (typeof name !== 'string') {
		throwError(prototype, 'Invalid "name", one "string" expected.', TypeError);
	}

	const _Kit = name => KitProxy(name, Kit);
	const Kit = new Proxy(_Kit, PROXY_HANDLER);

	_Kit.context = { name, prototype, dependencies: { Kit } };
	map.set(Kit, _Kit);

	return Kit;
};

import version from './version.mjs';

export const global = KitProxy('Kit::Global', null);

global.version = version;
