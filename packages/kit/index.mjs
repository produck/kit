const map = new WeakMap();
const NO_DEPENDENCE_SIGNAL = null;

const throwError = (currentKit, message, Constructor = Error) => {
	const chain = [];

	while (currentKit !== null) {
		const { name, prototype } = map.get(currentKit).context;

		chain.push(name);
		currentKit = prototype;
	}

	throw new Constructor(`${message}\n[${chain.join('] --|> [')}]`);
};

const isString = any => typeof any === 'string';

const TypeErrorMessage = (role, expected) => {
	return `Invalid "${role}", one "${expected}" expected.`;
};

const assertProperty = (any, Kit) => {
	if (!isString(any)) {
		throwError(Kit, TypeErrorMessage('property', 'string'), TypeError);
	}
};

const PROXY_HANDLER = {
	get: (_Kit, name, Kit) =>  {
		assertProperty(name, Kit);

		const { dependencies, prototype } = _Kit.context;

		if (name in dependencies) {
			return dependencies[name];
		}

		if (prototype === null) {
			throw NO_DEPENDENCE_SIGNAL;
		}

		try {
			return prototype[name];
		} catch {
			throwError(Kit, `No dependence named "${name}" is defined.`, ReferenceError);
		}
	},
	set: (_Kit, name, dependence, Kit) => {
		assertProperty(name, Kit);

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
		throwError(prototype, TypeErrorMessage('name', 'string'), TypeError);
	}

	const _Kit = name => KitProxy(name, Kit);
	const Kit = new Proxy(_Kit, PROXY_HANDLER);

	_Kit.context = { name, prototype, dependencies: { Kit } };
	map.set(Kit, _Kit);

	return Kit;
};

import version from './version.gen.mjs';

export const global = KitProxy('Kit::Global', null);

global.version = version;
