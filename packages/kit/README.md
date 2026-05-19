# @produck/kit

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/produck/kit/node.js.yml)](https://github.com/produck/kit/actions/workflows/node.js.yml)
[![Coveralls](https://img.shields.io/coveralls/github/produck/kit)](https://coveralls.io/github/produck/kit)
[![npm (scoped)](https://img.shields.io/npm/v/@produck/kit)](https://www.npmjs.com/package/@produck/kit)
[![npm](https://img.shields.io/npm/dm/@produck/kit)](https://www.npmjs.com/package/@produck/kit)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![NPM](https://img.shields.io/npm/l/@produck/kit)](https://opensource.org/licenses/MIT)

A dependency injection module based on prototype-chain delegation. Each Kit represents a scope. A child Kit can read dependencies registered on any ancestor Kit.

## Installation

```sh
$ npm install @produck/kit
```

## Usage

```js
import * as Kit from '@produck/kit';

function BarProvider(kit) {
  console.log(kit.version); // => @produck/kit version (inherited from global)
  console.log(kit.foo); // => 'bar' (inherited from base)
  console.log(kit.baz); // => 'qux' (own)
}

function FooProvider(kit) {
  console.log(kit.foo); // => 'bar'

  const child = kit('Child'); // create a child Kit

  child.baz = 'qux'; // register dependency on child

  BarProvider(child);
}

const base = Kit.global('Base');

base.foo = 'bar';

FooProvider(base);
```

The delegation chain for the example above:

```text
[Child] --|> [Base] --|> [Kit::Global]
```

## API

### `global`

The root Kit instance. All user Kits are descendants of this.

### `global.version`

Version string of `@produck/kit`.

### `kit(name?: string): Kit`

Create a named child Kit from the current Kit instance.

### `setDiagram(diagram?: (kit) => string)`

Set a global error-message diagram renderer. Called with no argument resets to the default (outputs nothing). Use [`@produck/kit-diagram`](https://www.npmjs.com/package/@produck/kit-diagram) for pre-built renderers.

```js
import * as Kit from '@produck/kit';
import { chainToRoot } from '@produck/kit-diagram';

Kit.setDiagram(chainToRoot);
```

### `isKit(value): boolean`

Returns `true` if `value` is a Kit proxy instance.

### `Injector(kit = global, required = [])`

Creates a `KitInjector` that validates `required` dependencies exist on `kit` at construction time.

`required` is an array of `string | number | symbol` property keys.

```js
import * as Kit from '@produck/kit';

async function createOrder(kit, payload) {
  const order = await kit.db.insert(payload);

  kit.logger.info(`Order ${order.id} created`);

  return order;
}

const kit = Kit.global('OrderScope');

kit.db = myDatabase;
kit.logger = myLogger;

// Validates that 'db' and 'logger' exist on kit immediately
const injector = Kit.Injector(kit, ['db', 'logger']);

// Pre-inject kit as first argument; call-site args follow
const handler = injector.bind(createOrder);

app.post('/orders', (req, res) => handler(req.body).then((o) => res.json(o)));
```

#### `injector.bind(fn, thisArg?)`

Returns a new function with `kit` pre-injected as the first argument. Additional call-site arguments are appended after it.

## License

[MIT](https://github.com/produck/kit/blob/main/LICENSE)
