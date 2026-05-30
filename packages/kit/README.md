# @produck/kit

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/produck/kit/node.js.yml)](https://github.com/produck/kit/actions/workflows/node.js.yml)
[![Coveralls](https://img.shields.io/coveralls/github/produck/kit)](https://coveralls.io/github/produck/kit)
[![npm (scoped)](https://img.shields.io/npm/v/@produck/kit)](https://www.npmjs.com/package/@produck/kit)
[![npm](https://img.shields.io/npm/dm/@produck/kit)](https://www.npmjs.com/package/@produck/kit)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![NPM](https://img.shields.io/npm/l/@produck/kit)](https://opensource.org/licenses/MIT)

A dependency injection module based on prototype-chain delegation. Each Kit
represents a scope. A child Kit can read dependencies registered on any
ancestor Kit.

## Installation

```sh
$ npm install @produck/kit
```

## Usage

### Dependency injection

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

### Prototype chain inheritance

Each `kit(name)` creates a child Kit that stores a reference to its parent.
Under the hood, Kit uses `Proxy` to intercept property access: it first looks
in the child's own registry, and if not found, it walks up the `parent` chain
recursively. This simulates prototype-chain semantics without using
JavaScript's native `[[Prototype]]`.

```js
import * as Kit from '@produck/kit';

// Create root scope, register a property.
const base = Kit.global('Base');
base.foo = 'defined on Base';

// Create child — [[Prototype]] points to base.
const child = base('Child');
child.bar = 'defined on Child';

// Create grandchild — [[Prototype]] points to child.
const grandchild = child('GrandChild');
grandchild.baz = 'defined on GrandChild';

// Access on grandchild: walks up the chain.
console.log(grandchild.foo); // => 'defined on Base'       ← inherited from base
console.log(grandchild.bar); // => 'defined on Child'      ← inherited from child
console.log(grandchild.baz); // => 'defined on GrandChild'  ← own property

// Shadow: set on child without mutating base.
child.foo = 'overridden on Child';
console.log(child.foo); // => 'overridden on Child'   ← own, shadows base.foo
console.log(base.foo); // => 'defined on Base'       ← unchanged

// Grandchild now sees child's value (nearest ancestor).
console.log(grandchild.foo); // => 'overridden on Child'   ← inherited from child
```

#### Blocking access via intermediate shadowing

An intermediate Kit can intentionally shadow a dependency to prevent
downstream Kits from reaching an ancestor's version. This is useful for
sandboxing, test mocking, or scoped overrides.

```js
import * as Kit from '@produck/kit';

const root = Kit.global('Root');
root.db = 'production-db';

const sandbox = root('Sandbox');
sandbox.db = 'sandbox-db'; // shadows root.db for all descendants

const query = sandbox('Query');
query.db; // => 'sandbox-db'  ← sees sandbox's version, never reaches root
```

The delegation chain:

```text
[Query] --|> [Sandbox] --|> [Root]
```

Here `Sandbox` intercepts `db` so that `Query` and any deeper descendant
cannot accidentally (or intentionally) reach `Root`'s original `db`.
The override is scoped — `Root` itself and other branches remain unaffected.

The delegation chain:

```text
[GrandChild] --|> [Child] --|> [Base] --|> [Kit::Global]
```

## Design concepts

### Limited mutability

Kit is a **write-once, append-only** container. Dependencies can be registered
once and never modified or removed:

- A dependency **can be added** if the key does not exist.
- **Overwriting** an existing dependency throws `Error`.
- **Deleting** any property throws `Error`.

```js
const kit = Kit.global('Shop');

kit.db = myDatabase; // ✅ first write succeeds
kit.db = anotherDatabase; // ❌ Error: "Dependence 'db' exists."
delete kit.db; // ❌ Error: "Delete operation is not allowed."
```

This guarantees stability: once a dependency is visible to child scopes, it
will not be replaced or removed without creating a new scope.

### No enumeration, no probing

Kit is designed as a **black-box** container. Consumers must know the
dependency name they need and access it directly via property read (`get`).
Introspection and probing are explicitly prevented:

| Operation                             | Behaviour                  |
| ------------------------------------- | -------------------------- |
| `'key' in kit`                        | ❌ throws `Error`          |
| `Object.keys(kit)`                    | ❌ throws `Error`          |
| `for...in`, spread, `Reflect.ownKeys` | ❌ throws `Error`          |
| `kit.key` (property exists)           | ✅ returns the dependency  |
| `kit.key` (property missing)          | ❌ throws `ReferenceError` |

```js
const kit = Kit.global('App');
kit.config = { port: 3000 };

'config' in kit; // ❌ Error: "\"in\" operator is not allowed on a Kit."
Object.keys(kit); // ❌ Error: "Enumeration is not allowed on a Kit."
kit.config; // ✅ { port: 3000 }
```

The rationale: a scope should only expose the dependencies that collaborating
modules explicitly agree on. Querying "what is available" encourages
implicit coupling and defeats the purpose of explicit DI.

To list all registered keys for debugging, use the explicit API:

```js
Kit.getDependencePropertyList(kit);
```

### Trade-off: mental burden vs. flexibility

These restrictions are a deliberate trade-off that favours **predictability**
over **convenience**.

**What you give up:**

- No runtime inspection — you cannot write generic utilities that iterate
  "all deps on a Kit". This makes debugging slightly less convenient and
  rules out patterns like auto-wiring or convention-based DI.

**What you gain:**

- **Explicit contracts.** Every dependency access is a deliberate read at a
  known key. There is no "magic" that resolves dependencies based on naming
  conventions or type hints — what you see (`kit.foo`) is exactly what
  happens.
- **Stable scope graph.** Because deps cannot be deleted or overwritten, you
  can reason about a Kit's state at any point in its lifetime: once a
  dependency is set, it stays set. This eliminates an entire class of bugs
  around mutable shared state.
- **Clear failure boundary.** If a dependency is missing, you get an
  immediate `ReferenceError` with a stack trace pointing to the exact access
  site — no silent `undefined`, no late failure in a downstream consumer.
- **Simplified child-scope reasoning.** A child Kit inherits from its parent,
  but since neither can delete or overwrite inherited deps, there is no risk
  of a sibling or unrelated scope corrupting the dependency graph. The
  delegation chain is append-only from root to leaf.

```js
// Without restrictions — fragile, implicit.
function startServer(kit) {
  const config = kit.config || {}; // silent fallback, hides errors
  const db = kit['db-' + config.env]; // computed key, hard to track
  delete kit.cache; // mutates shared state
}

// With Kit restrictions — explicit, stable.
function startServer(kit) {
  const db = kit.db; // ✅ clear dependency, fails fast if missing
  const logger = Getter('logger').touch(kit) ?? console; // ✅ explicit optional dep
}
```

These restrictions make Kit a poor fit for scenarios that require dynamic
discovery or convention-based wiring (e.g., automatic controller scanning).
They excel when you want a **simple, predictable, and auditable** DI container
where every dependency is explicitly declared and the scope graph is immutable
once built.

### Public introspection API

For cases where enumeration is genuinely needed (tooling, serialisation,
inspection), Kit provides an explicit opt-in API:

- [`getDependencePropertyList(kit)`](#getdependencepropertylistkit-propertykey)
  returns all own dependency keys.

## API

### `global`

The root Kit instance. All user Kits are descendants of this.

### `global.version`

Version string of `@produck/kit`.

### `kit(name?: string): KitProvider`

Create a named child Kit from the current Kit instance.

### `setDiagram(kit, diagram?)`

Set a per-Kit error-message diagram renderer. When a property access throws
`ReferenceError`, the diagram is appended to the error message. Pass no
`diagram` to reset the given Kit to default (outputs nothing).

```js
import * as Kit from '@produck/kit';

const kit = Kit.global('Scope');

Kit.setDiagram(kit, (k) => `[${Kit.getName(k)}]`);
```

Use [`@produck/kit-diagram`](https://www.npmjs.com/package/@produck/kit-diagram)
for pre-built renderers.

### `isKit(value): boolean`

Returns `true` if `value` is a Kit proxy instance.

### `getName(kit): string`

Returns the debug name of the given Kit.

### `getParent(kit): KitProvider | null`

Returns the parent Kit, or `null` if `kit` is the global root.

### `getDependencePropertyList(kit): PropertyKey[]`

Returns an array of all registered property keys (own properties only,
including symbols) on the given Kit.

### `Getter(property)`

Creates a typed accessor for a kit property. `property` must be
a valid `PropertyKey` (`string | number | symbol`). Designed for downstream
libraries to destructure and re-export the individual `use`/`touch` functions.

```js
import { Getter, global } from '@produck/kit';

// --- @my-lib/config.mjs ---
// Destructure and export the raw accessor functions.
export const { use, touch } = Getter('config');

// --- @my-lib/logger.mjs ---
export const { use } = Getter('logger');

// --- app.mjs ---
import * as Config from '@my-lib/config.mjs';
import * as Logger from '@my-lib/logger.mjs';

const kit = global('App');
kit.config = { port: 3000 };
kit.logger = console;

Config.use(kit); // => { port: 3000 }
Config.touch(kit); // => { port: 3000 }  (exists, same as use)
Logger.use(kit); // => console

Getter('absent').use(kit); // throws ReferenceError
Getter('absent').touch(kit); // => undefined
```

#### `getter.use(kit)`

Returns `kit[property]`. Throws if the property is not found.

#### `getter.touch(kit)`

Returns `kit[property]` if available, or `undefined` if the property is missing.

### `Injector(kit = global, required = [])`

Creates a `KitInjector` that validates `required` dependencies exist on `kit`
at construction time.

`required` is an array of valid `PropertyKey` values
(`string | number | symbol`).

```js
import * as Kit from '@produck/kit';

async function createOrder(kit, [payload]) {
  const order = await kit.db.insert(payload);

  kit.logger.info(`Order ${order.id} created`);

  return order;
}

const kit = Kit.global('OrderScope');

kit.db = myDatabase;
kit.logger = myLogger;

// Validates that 'db' and 'logger' exist on kit immediately
const injector = Kit.Injector(kit, ['db', 'logger']);

// Pre-inject kit as first argument; call-site args are passed as an array
const handler = injector.bind(createOrder);

app.post('/orders', (req, res) => handler(req.body).then((o) => res.json(o)));
```

### `defineRecipe(recipe)`

Helper for downstream (non-TS) consumers to declare recipe functions with
typed call-site argument tuples. Recipes receive the pre-injected `kit` as the
first argument and an `args` tuple (array-like) containing call-site values as
the second argument.

```js
import * as Kit from '@produck/kit';

// recipe receives kit and an args tuple
function createUser(kit, [payload]) {
  return kit.db.insert(payload);
}

const recipe = Kit.defineRecipe(createUser);

const kit = Kit.global('App');
kit.db = myDatabase;

// injector.bind will pre-inject kit and pass call-site args as an array
const handler = Kit.Injector(kit, ['db']).bind(recipe);

handler({ name: 'alice' }).then((u) => console.log(u));
```

#### `injector.bind(recipe)`

Returns a new function with `kit` pre-injected as the first argument.
Additional call-site arguments are passed as an array
(second argument of the recipe).

## License

[MIT](https://github.com/produck/kit/blob/main/LICENSE)
