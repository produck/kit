# @produck/kit
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/produck/kit/node.js.yml)](https://github.com/produck/kit/actions/workflows/node.js.yml)
[![Coveralls](https://img.shields.io/coveralls/github/produck/kit)](https://coveralls.io/github/produck/kit)
[![npm (scoped)](https://img.shields.io/npm/v/@produck/kit)](https://www.npmjs.com/package/@produck/kit)
[![npm](https://img.shields.io/npm/dm/@produck/kit)](https://www.npmjs.com/package/@produck/kit)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![NPM](https://img.shields.io/npm/l/@produck/kit)](https://opensource.org/licenses/MIT)

A module to create a injection for implemention of DI, IoC. It can easily build injection prototype chain. Each injection represents a job space, a problem scope. Child injection can access dependencis of  its prototype injection.

It has been published as a "[Dual CommonJS/ES module](https://nodejs.org/dist/latest-v16.x/docs/api/packages.html#dual-commonjses-module-packages)" package but ESM first. It can work in "node.js" and browsers. It is also very friendly with "tree shaking", using "[Rollup](https://rollupjs.org/guide/en/)".

A Kit, the injection is ``IMMUTABLE``.

## Installation
```
$ npm install @produck/kit
```

## Usage
### Import / require
As esModule,
```js
import * as Kit from '@produck/kit';
```
As CommonJs,
```js
const Kit = require('@produck/kit');
```
### Prepare / Inject / Spread
The chain is like ``[Child] --|> [Base] --|> [Global]``.
* Inject ``[Child]`` to ``FooProvider()``.
* Inject ``[Base]`` to ``BarProvider()``.
```js
import * as Kit from '@produck/kit';

function BarProvider(Kit) {
	console.log(Kit.Kit); // => Child Kit
	console.log(Kit.version); // => @produck/kit version
	console.log(Kit.foo); // => 'bar'
	console.log(Kit.baz); // => 'qux'
}

function FooProvider({ Kit, version, foo }) {
	// Spread
	console.log(version); // => @produck/kit version.
	console.log(foo); // => 'bar'

	// Create a child Kit by `Base Kit`
	const child = Kit('Child');

	child.baz = 'qux';

	// Inject
	BarProvider(child);
}

// Prepare
const base = Kit.global('Base');

base.foo = 'bar';

// Inject
FooProvider(base);
```
## API
### .global

### .global.version

### .Kit([name: string]): Kit

## License
[MIT](https://github.com/produck/kit/blob/main/LICENSE)
