import * as Ow from '@produck/ow';
import * as TE from '@produck/type-error';

const KitInternals = new WeakMap();

const throwError = (currentKit, message, Constructor = Error) => {
	const chain = [];

	while (currentKit !== null) {
		const { name, parent } = KitInternals.get(currentKit).context;

		chain.push(name);
		currentKit = parent;
	}

	Ow.throw(new Constructor(`${message}\n[${chain.join('] --|> [')}]`));
};

const isString = (any) => typeof any === 'string';

const PROXY_HANDLER = {
	get: (_Kit, name, Kit) => {
		const { dependencies, parent } = _Kit.context;

		if (name in dependencies) {
			return dependencies[name];
		}

		try {
			if (parent === null) {
				Ow.Error.Range('KIT_PARENT_CHAIN_END');
			}

			return parent[name];
		} catch {
			throwError(Kit, `Dependence "${name}" is undefined.`, ReferenceError);
		}
	},
	set: (_Kit, name, dependence, Kit) => {
		const { dependencies } = _Kit.context;

		if (name in dependencies) {
			throwError(Kit, `There has been a dependence "${name}".`);
		}

		dependencies[name] = dependence;

		return true;
	},
};

export const KitProxy = (name = '<Anonymous>', parent) => {
	if (!isString(name)) {
		throwError(parent, TE.ErrorMessage('name', 'string'), TypeError);
	}

	const _Kit = (childName) => KitProxy(childName, Kit);
	const Kit = new Proxy(_Kit, PROXY_HANDLER);
	const dependencies = Object.assign(Object.create(null), { Kit });

	_Kit.context = { name, parent, dependencies };
	KitInternals.set(Kit, _Kit);

	return Kit;
};

export const isKit = (value) => KitInternals.has(value);
