# Signal

A lightweight event dispatcher.

- [Installation](#installation)
- [Comparison with EventEmitter](#comparison-with-eventemitter)
- [Usage Guide](#usage-guide)
  - [Creating a Signal](#creating-a-signal)
  - [Adding Handlers](#adding-handlers)
  - [Removing Handlers](#removing-handlers)
  - [Triggering a Signal](#triggering-a-signal)
  - [Async Signals](#async-signals)
    - [Serial Execution](#serial-execution)
    - [Parallel Execution](#parallel-execution)
  - [Forwarding this](#forwarding-this)
  - [Wrapping an EventEmitter](#wrapping-an-eventemitter)
  - [Signal Backend](#signal-backend)
- [Changelog](#changelog)

## Installation

You can install this package using NPM or Yarn. It already contains its own
typings and needs no additional dependencies to use with TypeScript.

```sh
# using NPM
npm install @calmdownval/signal

# using Yarn
yarn add @calmdownval/signal
```

## Comparison with EventEmitter

### Pros

- ✅ supports async handlers with serial and parallel invocation strategies
- ✅ does not rely on class inheritance or mixins
- ✅ written and compatible with TypeScript
- ✅ tiny, without any dependencies (~2 kB)
- ✅ smoothly integrates with standard event emitters
- ✅ does not rely on event name strings, which are harder to use with
  autocompletion or type-checking and can be a source of silly bugs due to typos

### Cons

- ❌ is non-standard and will involve some learning curve
- ❌ not suitable for event bubbling

## Usage Guide

The library provides everything as named exports. The best approach to preserve
good code readability is to import the entire namespace as `Signal`.

```ts
import * as Signal from '@calmdownval/signal';
```

### Creating a Signal

To create a signal call the `Signal.create` function. You can pass an options
object with the following properties:

- `async: boolean = false`  
  controls whether the signal should act with respect to promises returned by
  event handlers
- `parallel: boolean = false`  
  controls whether asynchronous handlers will run in parallel or in series, only
  has effect if async is set to true
- `backend: 'array' | 'es6map' = 'array'`  
  controls which data structure is used to hold the handler collection, see the
  [Signal Backend](#signal-backend) section for more information

Internally this function only checks the async option and delegates execution
to either `Signal.createSync` or `Signal.createAsync`.

```ts
// will invoke handlers synchronously in series
const syncSignal1 = Signal.createSync();
const syncSignal2 = Signal.create();

// will invoke handlers asynchronously, in series, one at a time
const asyncSignal1 = Signal.createAsync();
const asyncSignal2 = Signal.create({ async: true });

// will invoke handlers asynchronously, all at once, in parallel
const asyncSignal3 = Signal.createAsync({ parallel: true });
const asyncSignal4 = Signal.create({
  async: true,
  parallel: true
});

// will use ES6 Map to hold its list of handlers
const mapSignal = Signal.createSync({ backend: 'es6map' });
```

### Adding Handlers

To add a handler use the `Signal.on` function. The first argument is always a
signal instance, the second is the handler to add.

```ts
Signal.on(mySignal, () => console.log('foo'));
```

Handlers will be invoked every time the signal is triggered. You can also set
the `once` flag to only invoke a handler once and then have it automatically
removed from the handler list.

```ts
Signal.on(mySignal, myHandler, { once: true });

// shorter version using the .once util
Signal.once(mySignal, myHandler);
```

When a handler is first added with the `once` flag set and later added again
normally, assuming the signal wasn't triggered between these operation, the
`once` flag will be unset.

```ts
const mySignal = Signal.create();
const onTrigger = () => console.log('bar');

Signal.once(mySignal, onTrigger);
Signal.on(mySignal, onTrigger);

// will print 'bar'
mySignal();

// will print 'bar' again
mySignal();
```

Without involving the `once` flag, calling `on` multiple times with the same
handler has no effect. Handlers are kept in a set (i.e. there are never any
duplicates in the handler list).

### Removing Handlers

To remove a handler (regardless of the once option), use the `Signal.off`
function.

If no specific handler is provided as the second argument the `.off` function
will remove *all* handlers registered for the signal.

```ts
// will remove the first found occurrence of myHandler
Signal.off(s1, myHandler);

// will remove all registered handlers
Signal.off(s1);
```

The `.off` function will return a boolean indicating whether the operation
removed any handlers.

### Triggering a Signal

Each signal instance is actually a function. Triggering it is as simple as
adding a pair of brackets! You can pass any data as the first argument to a
signal, it will be forwarded to each handler. Typically this will be an event
object with additional information.

Synchronous signals do not return any value (void), asynchronous return a
`Promise<void>`.

```ts
mySignal(123);
```

Synchronous signals will always invoke handlers in series. If any one of them
throws the execution immediately stops. It is the caller's responsibility to
handle thrown exceptions:

```ts
try {
  mySignal();
}
catch (ex) {
  console.error('one of the handlers threw an exception', ex);
}
```

You can add async handlers to synchronous signals, but they will be executed in
a fire-and-forget fashion. This may be desirable in some cases, but keep in mind
that *any potential promise rejections will not be handled!*

### Async Signals

Asynchronous signal interface is almost identical to its synchronous
counterpart. The key difference is that an async signal will check the return
type of every handler and handle all promises it receives.

When using async signals all promise rejections are guaranteed to be handled
regardless of execution strategy used, errors may however get suppressed. See
below for details.

The execution strategy of async handlers is configurable via the `parallel`
option (see [Creating a Signal](#creating-a-signal)).

#### Serial Execution

The default strategy is serial execution. Execution will await each handler
before moving onto the next one.

This is the default strategy as it's the same one synchronous signals use.
A promise rejection will immediately propagate upwards and terminate the
execution. Handlers further down the list will not execute in such case.

```ts
const mySignal = Signal.createAsync();

Signal.on(mySignal, () => sleep(100));
Signal.on(mySignal, () => sleep(100));

// will take ~200ms
await mySignal();
```

#### Parallel Execution

When enabled, the signal will invoke all handlers simultaneously and resolve
once *all* have resolved. If a handler rejects the wrapping promise returned by
the signal will immediately reject as well. This is similar to the behavior of
`Promise.all`.

```ts
const mySignal = Signal.createAsync({ parallel: true });

Signal.on(mySignal, () => sleep(100));
Signal.on(mySignal, () => sleep(100));

// will take ~100ms
await mySignal();
```

Note that if a handler rejects other handlers continue their execution and there
is no way to await them. If additional rejections occur, they will be suppressed
as the wrapping promise was already rejected with the first error.

It is a good practice to either make sure none of the handlers ever reject or
to pass an abort signal through the event object so that you have some control
over the still-pending actions if a rejection occurs, e.g.:

```ts
const abort = Signal.createSync();
try {
  await mySignal({ abort });
}
catch (ex) {
  console.error(ex);
  abort();
}
```

Note that the above example has nothing to do with browser `AbortController` or
`AbortSignal`. However, you could use those for the same purpose too!

### Forwarding this

Signals forward `this` to all its handlers, however there are several caveats to
keep in mind when using this feature. These stem from how JavaScript functions
and the binding of `this` work.

Any handler that needs to use the forwarded `this` has to be a regular function,
not an arrow function. Signals also need to be triggered using `.call` instead
of a regular call.

```ts
const context = { value: 123 };
const mySignal = Signal.create();

Signal.on(mySignal, function () {
  console.log(this);
});

// will print '123'
mySignal.call(context);
```

### Wrapping an EventEmitter

If you have an EventEmitter (Node) or an EventTarget (browser) that you wish to
'signalify' you can do so by passing a signal instance to the `addEventListener`
method:

```ts
const confirmed = Signal.create<MouseEvent>();
const button = document.getElementById('ok-button');

button.addEventListener('click', confirmed);
```

Now every time the button is clicked the `confirmed` signal will trigger
forwarding the `MouseEvent` object to all its handlers.

### Signal Backend

Signals offer the choice between arrays and ES6 Maps as the backing data
structure holding the list of registered handlers.

Array is the default structure as it is supported in every environment and
offers the best performance for almost all use cases.

ES6 Map is only available in newer JS environments. Maps should only be
preferred when dealing with *a lot* of `on` and `off` calls and infrequent
invocations, as they provide a significant boost in such cases. Otherwise maps
have have a larger memory footprint, significantly decrease the performance of
creating new signal instances and slightly reduce the performance of triggering
them.

```diff
 create a signal instance
+  array   1,500,364,906 ops/sec ±0.15% (98 runs sampled)
-  es6map     28,398,882 ops/sec ±2.45% (89 runs sampled)
 
 trigger a signal with 1000 handlers
+  array         199,536 ops/sec ±0.41% (92 runs sampled)
-  es6map        152,932 ops/sec ±1.56% (93 runs sampled)
 
 add 1000 handlers, then clear
-  array           2,446 ops/sec ±0.99% (97 runs sampled)
+  es6map          9,105 ops/sec ±6.49% (76 runs sampled)
 
 attempt to remove an unknown handler from a signal with 1000 handlers
-  array       1,706,999 ops/sec ±0.12% (99 runs sampled)
+  es6map    153,392,090 ops/sec ±1.49% (92 runs sampled)
```

The above benchmark was generated with NodeJS v16.2.0 (V8 version: 9.0.257.25)
on an AMD Ryzen 9 5950X CPU. You can run it on your machine using
`yarn benchmark`.

## Changelog

A list of breaking changes for every major version:

- 3.0.0
  - Handlers are now kept as unique refs, i.e. adding the same handler multiple
    times has no effect anymore.
  - Renamed type `Handler` to `SignalHandler`.
  - Renamed type `HandlerOptions` to `SignalHandlerOptions`.
- 2.0.0
  - Signals now only pass the first argument to handlers.
