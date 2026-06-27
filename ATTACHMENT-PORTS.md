# Attachment Port

This document describes a composition pattern for large-scale program
construction, grounded in the concrete mechanisms of `@produck/kit`. The
pattern organizes code around a tree of Scopes, each with a Port that
serves as a control surface for attaching and consuming Capabilities.

The core insight is that lexical scoping in JavaScript — where inner
functions read from enclosing scopes but write only to their own — can
serve as a mental model for dependency composition at the program level.
The Port tree mirrors this structure: a child Scope reads Capabilities
from its ancestor chain through its Port, and writes (Attaches) are
local to its own Port.

## Problem Background

JavaScript provides lexical scoping at the function level: an inner
function reads variables from its enclosing scopes, and variable
declarations are local to the declaring function. This is a highly
effective composition mechanism — but it stops at the function boundary.

When building large-scale programs, we need to compose not just
functions but modules, services, plugins, and long-lived subsystems.
The native options are limited:

- **Global state / singletons** — no isolation, implicit coupling.
- **Parameter threading** — every intermediate layer must declare and
  forward dependencies; the call chain becomes brittle plumbing.
- **Module imports** — statically bound at compile time; no way to
  decide at runtime which subtree gets which dependency.

DI frameworks solve the "no manual threading" problem, but mainstream
DI (Angular, `tsyringe`, `awilix`) uses a flat registry: once a
dependency is registered, it is reachable from everywhere. There is no
notion that "a child scope can read from its parent, but writes are
local."

The Port pattern fills this gap: it lifts lexical scoping from the
function level to the program composition level.

## Comparison with Alternatives

### The Compiler Dependency Problem

Several frontend frameworks provide composition mechanisms that
superficially resemble Port — React hooks, Vue Composition API,
Solid signals. They all solve the "prop drilling" problem by
introducing reactive effect propagation across a component tree.

But each of these depends on a **custom compiler** (JSX transform,
Vue SFC compiler, etc.) to wire up the reactive graph. They
effectively extend JavaScript with new semantics that only work
inside their component boundary. You cannot use a React hook or a
Vue `inject` outside a component render function.

Port needs no compiler. It works in any JS environment — server,
CLI, browser, Web Worker — because it is just lexical scoping
applied to objects.

### The ALS Gap

JavaScript has no built-in, reliable mechanism for implicit context
propagation across async boundaries. Node.js provides
`AsyncLocalStorage`, but it is runtime-specific, has edge cases
(loss after certain async operations), and is unavailable in the
browser.

Port does not need ALS. The Port tree is an explicit, persistent
object graph. Context is not carried by the call stack — it is
carried by the Port reference. Any code that has a Port can read
from it, synchronously or asynchronously, without depending on
execution context magic.

### Comparison Matrix

| Approach               | Domain           | Compiler-free   | Scope model           | Runtime mutable     | ALS needed     |
| ---------------------- | ---------------- | --------------- | --------------------- | ------------------- | -------------- |
| **Angular DI**         | frontend/backend | ❌ (decorators) | hierarchical injector | ❌ bootstrap-time   | ❌             |
| **React hooks**        | frontend UI      | ❌ JSX          | component tree        | ✅ live value       | ❌ (sync only) |
| **Vue inject/provide** | frontend UI      | ❌ SFC          | component tree        | ✅ reactive         | ❌ (sync only) |
| **Effect-TS**          | general          | ✅              | Layer graph (flat)    | ❌ immutable        | ✅ internally  |
| **Koa middleware**     | backend HTTP     | ✅              | flat `ctx` mutation   | ✅ per-request      | ❌             |
| **Awilix**             | backend          | ✅              | child scope → parent  | ❌ scope = snapshot | ✅ opt-in      |
| **Port**               | **general**      | **✅**          | **lexical tree**      | **✅ live object**  | **❌**         |

### Key Insight

Port is not a "frontend pattern" or a "backend pattern." It is a
**language-level composition primitive** built from plain JavaScript
objects. It does not need a compiler, does not depend on a specific
runtime, and does not require ALS. The only mechanism it relies on is
the Proxy — a standard ES2015 feature available in all modern
environments.

## Scope

A Scope is a node in the composition tree. It is the entity that owns
awareness of its position in the tree and the ability to interact with
its Port.

Every Scope has exactly one Port. The Port is the only way the Scope
interacts with the composition system — it reads Capabilities from it,
and it Attaches Capabilities to it.

Scopes are arranged in a tree that mirrors JavaScript lexical scopes:
a Scope can read Capabilities from its ancestors, but its writes are
local to its own Port.

The term **Provider** refers to a Scope acting in the role of attaching
Capabilities. It is not a separate entity — it is the same Scope,
viewed from the perspective of the Attach action.

## Port

A Port is the control surface of a Scope. It holds the Capabilities
attached by its own Scope and exposes, through inheritance, the
Capabilities attached by ancestor Scopes.

Reading a Capability from a Port follows lexical inheritance: if the
Capability is not found on the current Port, the lookup proceeds to the
parent Port, then its parent, and so on. This is analogous to how a
JavaScript function resolves a variable through the enclosing scope
chain.

A Port is created as a child of another Port. The parent Port is the
control surface of the parent Scope. This establishes the tree: each
Port belongs to exactly one Scope, and its parent Port belongs to the
parent Scope.

Ports are **persistent live objects**, not immutable values or
per-request snapshots. A Capability attached to a Port lives until it
is overwritten or the Port is garbage collected. This means
reconfiguring a Capability on a persistent Port affects all future
reads through that subtree — no restart or rebuild is required.

## Capability

A Capability is a thing attached to a Port. It can be any program
entity: a value, a function, a service object, a configuration object,
or even another Port's write interface (see Composite Patterns below).

A Capability is always written to a specific Port. Once written, it
becomes readable by the owning Scope and all descendant Scopes through
the inheritance chain.

Reading a Capability that does not exist on the chain is an error — the
Port cannot resolve an unknown name, just as a JavaScript function
cannot reference an undefined variable.

## Attach

Attach is the act of writing a Capability into a Port. The Provider (a
Scope acting in its capacity as a capability provider) performs this
write through its Port.

The write is local: it affects only the Port's own Capability set,
never the parent Port or any sibling Port. This mirrors how variable
declaration in a JavaScript function does not leak to the enclosing
scope.

In `@produck/kit`, Attach corresponds to `Kit[key] = value` — a
property write on the Kit proxy. The write is governed by the Kit's
own proxy handler: it rejects overwriting an existing key.

## Attacher

Attacher is the mechanism by which a Scope attaches a Capability to its
Port. An Attacher is itself a Scope — it is just the same Scope acting
in the role of performing an Attach.

This means there is no separate entity called "Attacher". The Attacher
is the Scope, viewed from the perspective of the Attach action. The
term exists to name the action side of the relationship, not to
introduce a new component.

## Use

Use is the act of reading a Capability from a Port. Any code running
within a Scope can Use its Port to obtain the Capabilities it needs.

The lookup follows the Port inheritance chain: the Port checks its own
Capabilities first, then its parent Port, then grandparent, and so on
until the Capability is found or the chain ends.

In `@produck/kit`, Use corresponds to `Getter.use(kit)` — reading a
property from a Kit through its inheritance chain.

## Kit (as Implementation)

In `@produck/kit`, a Port is realized as a Kit instance created by
`KitProxy`. The Kit provides:

- An inheritance chain via the `parent` reference.
- Property read (`get`) that walks the parent chain.
- Property write (`set`) that is local to the current Kit.
- Child Kit creation via `Kit(childName)`.

The Kit proxy handler enforces that a property can only be set once —
an attempt to overwrite causes an error. This is a concrete guard that
supports the Attach semantics: a Capability, once attached, is stable
on that Port.

The global Kit (`@produck/kit`'s default export) is the root of the
tree. All Ports descend from it, directly or indirectly.

## Composite Patterns

The Port model enables several compositional patterns that are awkward
or impossible in flat-registry or compile-time systems.

### Upward Registration

A parent Scope can expose its own Port's write interface as a
Capability. Child Scopes read this Capability through inheritance and
use it to register features upward.

```js
// Parent Scope attaches a controlled register interface
export function install(port) {
  port.REGISTER = {
    add(key, capability) {
      port[key] = capability;
    },
  };
}

// Child Scope uses the inherited register
export function handler(port) {
  const register = port.REGISTER;
  register.add('K_PLUGIN', createPlugin());
}
```

This does not violate the "writes are local" rule. The child Scope does
not write to its parent's Port — it **reads a Capability** (the
register interface) from its own Port via inheritance, and calls it.
The register interface, in turn, writes to the parent's Port on the
parent's behalf.

The parent retains full control: it can revoke the Capability
(overwrite `REGISTER` with a rejecting implementation), and descendant
Scopes will immediately lose the ability to register.

### Port as Identity

A Port is an object, which makes it a first-class WeakMap key. A
Provider can retain arbitrary state keyed by the Port itself, without
inventing external identifiers or querying a registry (see WeakMap
Retention below for a detailed example).

### Runtime Reconfiguration

Because a Port is a live object, a Provider can maintain mutable state
privately and expose it through the Port. Reconfiguration updates the
private state; all descendant Scopes immediately see the new values
through the Capability — no restart, no rebuild.

Note that `@produck/kit` enforces write-once: a property key cannot be
overwritten. The correct pattern is to keep mutable state separate from
the Port key. The Port key holds the accessor (a function or object
that delegates to the mutable state), and reconfiguration updates the
state, not the Port key.

```js
const stateByPort = new WeakMap();

export function install(port) {
  const state = { limit: '1mb' };
  stateByPort.set(port, state);
  // Attach a getter that reads from mutable state
  port.K_LIMIT = () => state.limit;
}

export function reconfigure(port, { limit }) {
  const state = stateByPort.get(port);
  if (state === undefined) {
    throw new Error('Feature is not attached to this Port.');
  }
  state.limit = limit;
}
```

This is especially useful in long-running processes (web servers,
daemons) where adjusting a subsystem's behavior should not require a
full restart.

## Developer Experience Gradient

The Port model creates a natural experience gradient across the tree.

**Engineers working at upper scopes** (closer to the root) face the
more abstract concerns: they design what Capabilities to expose, how
to guard them, and how the Port tree is structured. Their work defines
the composition contract that everyone downstream depends on.

**Engineers working at lower scopes** (deeper leaves) have a markedly
simpler experience. They receive a Port that already inherits all the
Capabilities attached by upstream Scopes. Their job is to `use` what
they need:

```js
export function handle(port) {
  const db = port.K_DATABASE;
  const config = port.K_CONFIG;
  // work with inherited capabilities
}
```

If a required Capability is missing from the inheritance chain, the
Port cannot resolve the name, and the error surfaces immediately —
just as referencing an undefined variable in a JavaScript function.
There is no silent `undefined`, no "why is this null?" debugging.
The Kit's proxy rejects it with a clear `ReferenceError`.

### Convention: Stable Use Functions

In practice, upstream Ports rarely expose raw property names as their
public API. Instead, they export `use*()` functions via `Getter`,
optionally backed by a `Symbol` property key to hide the internal name:

```js
// upstream exposes a stable use function
const _pool = Symbol('pool');

export const { use: usePool } = Getter(_pool);

export function initPool(port) {
  port[_pool] = new Pool();
}
```

Downstream does not reference the property key directly — it calls
`usePool(port)`. If the upstream later changes the internal key or
refactors the storage strategy, downstream code is unaffected. The
contract is the exported function, not the property name.

If the upstream stops exporting `usePool`, that is an explicit breaking
change — no different from removing any other exported API. The
downstream understands it must adapt.

**Port does not enforce this convention.** It is a practice that Port
users (upstream and downstream engineers) negotiate among themselves.
Port provides the underlying inheritance and access mechanism; the
stability contract is owned by the teams that share the tree.

## Non-invasive Boundary

A Port is just an object. It lives inside a Scope, and the Scope is a
conceptual boundary — it does not require the external world to adopt
any framework or runtime.

Code from outside the Port ecosystem — legacy modules, third-party
libraries, code written in a different paradigm — can interact with a
Port by simply Attaching to it or reading from it. There is no
abstraction to wrap into, no adapter class to implement, no type to
extend. The Port is a plain interface.

This means adopting the Port pattern does not require a big-bang
rewrite. You can introduce Ports at the boundaries of a legacy system,
let new code compose through Ports, and bridge old code by Attaching
its outputs as Capabilities:

```js
// legacy module, unchanged
import { calculate } from './legacy.mjs';

// new Port-based integration
export function attach(port) {
  port.K_CALCULATE = calculate; // legacy function as a Capability
}
```

Conversely, teams that prefer a different composition style are free
to stay outside the Port tree. The Port pattern does not demand
universal adoption. Its value is proportional to how much of the
composition surface it governs — but it does not try to own
everything.

## Downstream Safety

The lexical scoping model provides a structural guarantee: a
downstream Scope **can never corrupt an upstream Scope**. Writes are
local to the writing Scope's Port. A downstream Scope cannot
overwrite, delete, or shadow a Capability on any ancestor Port (the
Kit proxy's `set` handler rejects writes to unknown properties, and
a write on the child's own Port only affects that child).

This means:

- A rogue or buggy downstream component cannot break the tree for
  others. Its writes stay within its own Port.
- An upstream Provider can trust that the Capabilities it attached
  will remain available to descendant Scopes, unaltered by
  intermediaries.
- The safety is **structural**, not conventional — no discipline,
  no code review, no runtime policy can bypass it. The tree enforces
  it.

If a downstream Scope lacks a Capability it needs, the correct
response is to **negotiate** with the upstream Provider: request a
new Capability, or ask for an existing one to be exposed. The Port
model does not provide escape hatches for silent workarounds, and
it does not need to — the tree is flexible enough to accommodate
legitimate needs through explicit, cooperative extension.

## Design Philosophy

The `@produck` organization aims to build an infrastructure base that
adheres to the **SOLID principles** to their logical extreme, while
simultaneously making life simple for the engineers at the deepest
leaves of the tree.

The Pattern is not democratic — it is asymmetric by design:

- **Upstream framework/builders** (like the author of this document)
  propose the abstractions and implement the mechanisms — Port,
  Attacher, Capability inheritance. They own the difficulty of defining
  what "good composition" looks like.
- **Middle-layer engineers** are expected to be capable practitioners.
  They negotiate the conventions — which Capabilities to expose, how to
  name them, how to handle conflicts, what the stability contract is.
  They solve the abstract and complex problems of their domain.
- **Downstream consumers** receive a Port that already has everything
  they need. Their experience is declarative: `use` what is available,
  fail fast when it is not.

The result is that all Capabilities compose like building blocks.
There is no hierarchy fighting, no non-standard workarounds needed to
trim or decorate an upstream abstraction. A Capability arrives on the
Port, and it works. The composition surface is flat from the consumer's
perspective, even though the tree that delivers it is deep.

This document, and `@produck/kit` itself, are the first such building
block in that infrastructure.

## Tradeoffs

Every design choice has a cost. The following are intentional tradeoffs
of the Attachment Port model, not omissions.

### Definable Introspection

The Port pattern does not mandate a specific introspection mechanism.
`@produck/kit` provides `getDependencePropertyList(kit)` (own keys
only), `getParent(kit)`, and `getName(kit)` — enough to walk the
tree and inspect structure for debugging. Enumerating all inherited
Capabilities is a one-line traversal of the parent chain.

Day-to-day discoverability comes from module exports: the downstream
engineer chooses which modules to consume, and their `use*()` functions
are the documented API. Introspection is available but not required.

The tradeoff is that generic tooling (auto-wiring, convention-based
scanning) cannot rely on a universal "enumerate everything" primitive
that the pattern guarantees across implementations. Port supplies the
tree structure; the granularity of introspection is a per-implementation
choice.

### Write-Once, Not Write-Anywhere

The Kit proxy rejects overwriting an existing key. This means an
attached Capability is stable forever on that Port. Reconfiguration
requires an extra step (mutable state behind an accessor — see
Runtime Reconfiguration). This is deliberate: supply-side stability
reduces mental burden on the consumer side. The consumer reads a
Capability and knows it will not silently change type or shape.

The tradeoff is that ad-hoc mutation of a Capability is not a
single-line `port.X = Y` after the initial Attach. It must be
designed in from the start.

### No Built-in Lifecycle

Port has no `onAttach`, `onRemove`, or `onDispose` hooks. Lifecycle
is the responsibility of the Provider, implemented through ordinary
JavaScript patterns (`WeakRef`, `FinalizationRegistry`, or explicit
`dispose()` functions exported by the Provider).

The tradeoff is that coordinating startup and shutdown order across
many Providers requires convention and discipline. Port provides
the tree structure; the engineering team provides the orchestration.

### Tree Topology Is Append-Only

`kit(childName)` creates a child. There is no `reparent` or `move`.
The tree grows by appending leaves. If a subtree needs radical
restructuring, you build a new tree — just as you would build a new
closure in JavaScript rather than rewriting the enclosing scope.

The tradeoff is that deeply dynamic architectures (where a Scope's
parent must change at runtime) are not directly supported. They must
be modelled through Capability delegation rather than tree mutation.

### No Central Coordination

There is no central registry, no orchestrator, no "Port Manager."
Every Scope is autonomous. Upward registration, capability delegation,
and conflict resolution are negotiated by Providers, not enforced by
the system.

The tradeoff is that a new engineer joining a large Port-based codebase
must learn the conventions of that codebase — which Scopes exist, what
Capabilities they provide, how to request new ones. Port gives the
structure; the team gives the map.

### When to Choose Port

Attachment Port is a strong fit when:

- The system has a natural hierarchy of concerns (request handling,
  plugin systems, multi-layer architectures, CLI command trees,
  Electron service layers).
- Different teams own different layers of the tree and need
  guaranteed isolation from each other.
- You want to defer composition decisions to runtime without
  sacrificing structural safety.

The cost of introducing a Port is a single `kit(childName)` call. Its
benefit — structural isolation, no downstream corruption, inheritance
without plumbing — scales with the tree. A system with even two layers
of concern already gets value from that guarantee.

## WeakMap Retention

Because a Port is an object, it can serve directly as a WeakMap key. A
Provider that wishes to retain state after the initial Attach can store
it in a WeakMap keyed by the Port itself.

This is an ordinary JavaScript pattern, not specific to the Port model.
It is noted here because it appears frequently in practice: a Provider
Attaches a Capability, keeps mutable state privately, and later updates
the state (not the Port key) to reconfigure behavior.

```js
const stateByPort = new WeakMap();

export function install(port) {
  const state = { count: 0 };
  stateByPort.set(port, state);
  port.K_FEATURE = () => state.count;
}

export function reconfigure(port, patch) {
  const state = stateByPort.get(port);
  if (state === undefined) {
    throw new Error('Feature is not attached to this Port.');
  }
  Object.assign(state, patch);
}
```

## Summary

```text
Scopes form a lexical tree.
Each Scope has one Port.
Capabilities are Attached to Ports.
Capabilities are read via Use.
Use follows the inheritance chain: own, parent, ancestor.
Attach is local to the writing Scope.
Ports are live objects — reconfigure at runtime, no restart.
A Port can expose its write interface as a Capability (upward registration).
A Port is itself a WeakMap identity key.
A Port in @produck/kit is a Kit.
Attach = Kit[key] = value.
Use = Getter.use(kit).
```

## Appendix A: Glossary

### Scope

A node in the Port tree. An entity that owns awareness of its position in
the tree and the ability to attach capabilities. It mirrors the semantics of
JavaScript lexical scope defined by functions: a child Scope can read
capabilities from its ancestor chain, but writes are local to its own Port.

`Provider` and `Attacher` are role names of a Scope in different contexts —
they describe how a Scope uses the Port it already holds, not a separate
construct that must be mapped.

Scope has no direct counterpart in `@produck/kit`. It is a pattern-level
concept. In practice, any code that holds a reference to a Kit can act as a
Scope.

### Port

The control surface of a Scope. It tracks its own scope, receives attached
capabilities, and exposes them to child scopes through the inheritance chain,
analogous to how an inner function can read variables from enclosing scopes
in JavaScript. A Port is itself an object and can serve as a WeakMap key.

Each Scope has exactly one Port, and vice versa.

In `@produck/kit`, a Port is a Kit instance created by `KitProxy`.

### Capability

A thing attached to a Port. Child Scopes read and use it via `use`.

In `@produck/kit`, a Capability is a dependency property value on a Kit.

### Attacher

The action or mechanism by which a Scope attaches a Capability to its Port.

An Attacher is itself a Scope — there is no separate entity. The term
names the action role, not a distinct component.

In `@produck/kit`, the Attacher corresponds to the Scope writing through
the Kit proxy's `set` handler.

### Attach

The act of writing a Capability into a Port. The write is local to the
writing Scope's Port and does not affect ancestors or siblings.

In `@produck/kit`, corresponds to `Kit[key] = value`. The Kit proxy's
`set` handler rejects overwriting an existing key, enforcing write-once
semantics.

### Use

The act of reading a Capability from a Port. The lookup follows the Port
inheritance chain: own Port first, then parent, then ancestors.

In `@produck/kit`, corresponds to `Getter.use(kit)` — reading a property
from a Kit, which walks the `parent` chain via the proxy's `get` handler
when the property is not found locally.

### Kit

The realization of a Port in `@produck/kit`.

`KitProxy` provides the scope inheritance chain (`parent` reference),
property read/write via `Proxy` handlers, and child Kit creation via
`Kit(childName)`.
