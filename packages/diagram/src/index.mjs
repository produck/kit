import version from './version.gen.mjs';

const SYM_KIT = Symbol.for('@produck/kit/internals');

const chainOf = (kit) => {
	const chain = [];
	let current = kit;

	while (current != null) {
		const context = current[SYM_KIT];

		if (context === undefined) {
			break;
		}

		chain.push(context.name);
		current = context.parent;
	}

	return chain;
};

export function empty() {
	return '';
}

export function chainToRoot(kit) {
	return `[${chainOf(kit).join('] --|> [')}]`;
}

export function chainToSite(kit) {
	return `[${chainOf(kit).reverse().join('] --|> [')}]`;
}

export function vertical(kit) {
	return chainOf(kit).map((name) => `[${name}]`).join('\n  |\n  v\n');
}

export function overview(kit) {
	const chain = chainOf(kit);

	return [
		`[Site::${chain[0]}]`,
		`[${chain.join('] --|> [')}]`,
		`[Root::${chain[chain.length - 1]}]`,
	].join('\n');
}

export { version };
