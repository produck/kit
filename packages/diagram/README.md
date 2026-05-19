# @produck/kit-diagram

ASCII diagram helpers for `@produck/kit` relation debugging.

## Installation

```bash
npm install @produck/kit-diagram
```

## Usage

Pass any `Kit` instance from `@produck/kit` directly. The diagram traverses the
chain through a well-known global `Symbol.for('@produck/kit/internals')`
protocol exposed by `Kit`. Nothing else needs to be wired up.

```js
import * as Kit from '@produck/kit';
import {
  empty,
  chainToRoot,
  chainToSite,
  vertical,
  overview,
} from '@produck/kit-diagram';

const payment = Kit.global('PaymentKit');
const order = payment('OrderKit');

console.log(empty(order));
// (empty string)

console.log(chainToRoot(order));
// [OrderKit] --|> [PaymentKit] --|> [Kit::Global]

console.log(chainToSite(order));
// [Kit::Global] <|-- [PaymentKit] <|-- [OrderKit]

console.log(vertical(order));
// [OrderKit]
//   |
//   v
// [PaymentKit]
//   |
//   v
// [Kit::Global]

console.log(overview(order));
// [Site::OrderKit]
// [OrderKit] --|> [PaymentKit] --|> [Kit::Global]
// [Root::Kit::Global]
```
