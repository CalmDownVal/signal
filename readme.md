# Signal

A lightweight event dispatcher.

- [Installation](#installation)
- [Key Benefits](#key-benefits)
- [Usage Guide](#usage-guide)
  - [Creating a Signal](#creating-a-signal)
  - [Signal Backend](#signal-backend)
  - [Adding Handlers](#adding-handlers)
  - [Removing Handlers](#removing-handlers)
  - [Triggering a Signal](#triggering-a-signal)
  - [Checking for Handlers](#checking-for-handlers)
  - [Async Signals](#async-signals)
    - [Serial Execution](#serial-execution)
    - [Parallel Execution](#parallel-execution)
  - [Forwarding this](#forwarding-this)
  - [Wrapping an EventEmitter](#wrapping-an-eventemitter)
- [Changelog](#changelog)

## Installation

The package is distributed via NPM and can be installed by any compatible
package manager. It already contains its own typings and needs no additional
dependencies to work with TypeScript.

```sh
# NPM
npm install @cdv/signal

# Yarn
yarn add @cdv/signal
```

## Key Benefits

Signal is a somewhat niche alternative to the usual EventEmitter (Node) /
EventTarget (DOM) APIs. It looks and feels quite different and may involve a
slight learning curve, but here's why it might be worth it:

- ✅ does not rely on class inheritance or mixins
- ✅ recognizes and awaits Promises (async handlers)
- ✅ avoids event name strings, making TypeScript integration effortless
- ✅ smoothly integrates with standard event emitter APIs
- ✅ comes bundled with TypeScript declarations
- ✅ tiny (<2 kB) and without any dependencies

## Usage Guide

The library provides everything as named exports. Usually the best approach with
regards to code readability is to import the entire namespace as `Signal`.

```ts
import * as Signal from '@cdv/signal';
```

### Creating a Signal

To create a signal call the `Signal.create` function. You can pass an options
object with the following properties:

- `async: boolean`  
  controls whether the signal should await promises to be returned by event
  handlers, defaults to `false`
- `parallel: boolean`  
  controls whether asynchronous handlers will run in parallel or in series, only
  has effect if `async` is set to `true`, defaults to `false` (i.e. serial
  execution)
- `backend: 'array' | 'set'`  
  controls which data structure is used to hold the handler collection, see the
  [Signal Backend](#signal-backend) section for more information, defaults to
  `'array'`

```ts
// will invoke handlers synchronously in series
const syncSignal = Signal.create();

// will invoke handlers asynchronously in series
const serialAsyncSignal = Signal.create({ async: true });

// will invoke handlers asynchronously in parallel
const parallelAsyncSignal = Signal.create({
  async: true,
  parallel: true
});

// will use a set to hold its handlers
const uniqueHandlerSignal = Signal.create({ backend: 'set' });
```

### Signal Backend

Signals offer the choice between arrays and sets as the backing data structure
holding the collection of registered handlers. The key difference is that sets
only store unique handlers whereas arrays allow the same handler to be added
multiple times.

Array is the default backend as it is supported in every environment and offers
the best overall performance for almost all use cases.

Sets have a larger memory footprint and decrease the speed of creating new
Signal instances. Generally sets should be preferred when you need to enforce
unique handlers or when optimizing for *a lot* of `on` and `off` calls.

For a more in-depth performance analysis see
[latest benchmark results](./packages/signal-benchmark/benchmark-results.md).

### Adding Handlers

To add a handler use the `Signal.on` function. The first argument is a signal
instance, the second is the handler to add. An optional third argument with an
options object can be provided.

```ts
Signal.on(mySignal, () => console.log('foo'));
```

Handlers will be invoked every time the signal is triggered. You can enable the
`once` option to only invoke a handler once and then have it automatically
removed from the handler collection.

```ts
Signal.on(mySignal, myHandler, { once: true });

// shorter version using the .once util
Signal.once(mySignal, myHandler);
```

By default handlers are added at the end of the handler collection and are
invoked in the same order when the signal is triggered. The `prepend` option can
be enabled to instead insert at the start of the handler collection. Note that
this option is only supported by the array backend.

```ts
Signal.on(mySignal, myHandler1);

// when mySignal is triggered, myHandler2 will be invoked before myHandler1
Signal.on(mySignal, myHandler2, { prepend: true });
```

An alternative way to add handlers to a signal is the `Signal.subscribe`
function. It has the same usage as `Signal.on` but in addition will return an
'unsubscriber' function. Often useful when working with libraries like React.

### Removing Handlers

To remove a handler (regardless of the once option), use the `Signal.off`
function.

If no specific handler is provided as the second argument, the `.off` function
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

Each signal instance is simultaneously a function. Triggering it is as simple as
adding a pair of brackets! You can pass any data as the first argument to a
signal, it will be forwarded to each handler. Typically this will be an event
object with additional information.

```ts
mySignal(123);
```

Signals return a boolean value (or for async signals, a Promise resolving to
one) indicating whether any handlers were present and invoked. This is often
useful for fallback behavior, e.g. logging when no handlers are attached to an
error signal:

```ts
try {
  // ...
}
catch (ex) {
  if (errorSignal(ex)) {
    console.error(ex);
  }
}
```

Synchronous signals will always invoke handlers in series. The execution stops
immediately if any one of them throws. It is the caller's responsibility to
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
that *it will become impossible to handle any potential promise rejections!*

### Checking for Handlers

When computationally expensive operations are needed for event data creation,
it may be worth checking whether there are any handlers beforehand to avoid such
operations when they're not necessary.

For this task, Signal provides the `lazy` utility function. It accepts a signal
instance and a factory callback to create event data. This callback will only be
invoked if the signal has any handlers.

```ts
Signal.lazy(mySignal, () => ({
  value: heavyFn()
}));
```

A boolean value (or for async signals, a Promise resolving to one) indicating
whether any handlers were present and invoked is returned.

### Async Signals

Asynchronous signal interface is almost identical to its synchronous
counterpart. The key difference is that an async signal will check the return
type of every handler and handle any promises it receives.

When using async signals all promise rejections are guaranteed to be handled
regardless of execution strategy used. In some cases errors may be suppressed,
see below for details.

The execution strategy of async handlers is configurable via the `parallel`
option (see [Creating a Signal](#creating-a-signal)).

#### Serial Execution

The default strategy is serial execution. Execution will await each handler
before moving onto the next one.

This is the default strategy as it's analogous to synchronous signals. A promise
rejection will immediately propagate upwards and terminate the execution.
Handlers further down the execution order will not run in such case.

```ts
const mySignal = Signal.create({ async: true });

Signal.on(mySignal, () => sleep(100));
Signal.on(mySignal, () => sleep(100));

// will take ~200ms
await mySignal();
```

#### Parallel Execution

When enabled, the signal will invoke all handlers simultaneously and resolve
once *all* have resolved. If a handler rejects, the wrapping promise returned by
the signal will immediately reject as well. This is similar to the behavior of
`Promise.all`.

```ts
const mySignal = Signal.create({
  async: true,
  parallel: true
});

Signal.on(mySignal, () => sleep(100));
Signal.on(mySignal, () => sleep(100));

// will take ~100ms
await mySignal();
```

Note that after the first rejection, other handlers continue their execution and
there is no way to await them anymore. Should any additional rejections occur,
they are suppressed as there is no longer a way to propagate upwards.

With parallel execution, it is a good practice to either make sure none of the
handlers ever reject, or pass an abort signal through the event object so that
you retain control over the still-pending actions in case of a rejection,
e.g.:

```ts
const abort = Signal.create();
try {
  await mySignal({ abort });
}
catch (ex) {
  console.error(ex);
  abort();
}
```

Note that the above example has nothing to do with the `AbortController` and
`AbortSignal` browser APIs. However, you could use those for this purpose too!

### Forwarding this

Signals forward `this` to all its handlers, however there are a few caveats to
using this feature. These stem from how JavaScript functions and the binding of
`this` work.

Any handler that relies on forwarded `this` has to be a regular function, not an
arrow function. When contained in an object and called as `obj.signal(...)`,
that object will be passed as `this` to the signal's handlers.

```ts
const obj = {
  value: 'foo',
  mySignal: Signal.create()
};

Signal.on(obj.mySignal, function () {
  console.log(this.value);
});

// will print 'foo'
obj.mySignal();
```

When signals are not contained within an object, or you wish to forward a
different one, it is necessary to instead trigger using the `.call` method and
explicitly pass the desired reference:

```ts
const obj = { value: 'bar' };
const mySignal = Signal.create();

Signal.on(mySignal, function () {
  console.log(this.value);
});

// will print 'bar'
mySignal.call(obj);
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
forwarding the `MouseEvent` object and `this` (in this example, the `<button>`
reference) to all its handlers.

## Changelog

- 4.5.0
  - Signals now return booleans indicating whether any handlers were invoked.
- 4.4.0
  - Added the `prepend` option to `on`, `once` and `subscribe`.
- 4.3.0
  - The package is now distributed under `@cdv/signal`.
  - Improved backend implementation.
- 4.2.0
  - Added the `subscribe` method.
- 4.1.0
  - The `lazy` util now returns booleans indicating whether any handlers were
    invoked.
- 4.0.0
  - Changed `es6map` backend to `set`.
  - Removed `hasHandlers` getter, use `lazy` instead.
  - Removed `createSync` util, use `create` instead.
  - Removed `createAsync` util, use `create` instead.
  - Improved performance and unit test coverage.
- 3.1.0
  - Added the `lazy` utility function.
  - Added the `isAsync` property to signals.
  - Added the `hasHandlers` property to signals.
  - Added JSDoc comments.
- 3.0.0
  - Added the option to choose between backends.
  - Renamed type `Handler` to `SignalHandler`.
  - Renamed type `HandlerOptions` to `SignalHandlerOptions`.
- 2.0.0
  - Signals now only pass the first argument to handlers.
- 1.0.0
  - Initial implementation.
