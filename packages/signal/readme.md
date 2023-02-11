# Signal

A lightweight event dispatcher.

- [Installation](#installation)
- [Comparison with EventEmitter](#comparison-with-eventemitter)
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

You can install this package using NPM or Yarn. It already contains its own
typings and needs no additional dependencies to use with TypeScript.

```sh
# using NPM
npm install @calmdownval/signal

# using Yarn
yarn add @calmdownval/signal
```

## Why Signal?

Signal is a somwehat niche alternative to the usual EventEmitter (Node) /
EventTarget (DOM) APIs. It looks and feels quite different and may involve a
slight learning curve, but here's why it may all be worth it:

- ✅ supports async handlers with serial or parallel invocation
- ✅ better equipped for high-performance applications
- ✅ tiny (~2.4 kB) and without any dependencies
- ✅ does not rely on class inheritance or mixins
- ✅ comes bundled with TypeScript typings
- ✅ smoothly integrates with standard event emitter APIs
- ✅ does not rely on event name strings, which are harder to use with
  autocompletion or type-checking and can be a source of silly bugs due to typos

## Usage Guide

The library provides everything as named exports. Usually the best approach for
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
- `backend: 'array' | 'set' = 'array'`  
  controls which data structure is used to hold the handler collection, see the
  [Signal Backend](#signal-backend) section for more information

```ts
// will invoke handlers synchronously in series
const syncSignal = Signal.create();

// will invoke handlers asynchronously, in series, one at a time
const serialAsyncSignal = Signal.create({ async: true });

// will invoke handlers asynchronously, all at once, in parallel
const parallelAsyncSignal = Signal.create({
  async: true,
  parallel: true
});

// will use an ES6 Set to hold its list of handlers
const uniqueHandlerSignal = Signal.create({ backend: 'set' });
```

### Signal Backend

Signals currently offer the choice between arrays and ES6 sets as the backing
data structure holding the collection of registered handlers. The key difference
is that sets only store unique handlers whereas arrays allow the same handler
to be added multiple times.

Array is the default backend as it is supported in every environment and offers
the best overall performance for almost all use cases.

Sets have a larger memory footprint and decrease the speed of creating new
Signal instances. Generally sets should be preferred when you want to enforce
unique handlers or when optimizing for *a lot* of `on` and `off` calls.

For a more in-depth performance analysis see
[latest benchmark results](../signal-benchmark/benchmark-results.md).

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

Another method to add handlers to a signal is the `Signal.subscribe` function.
It acts exactly the same as `Signal.on` except it additionally returns an
'unsubscriber' function which is often useful when working with libraries like
React etc.

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

A boolean is returned indicating whether the signal (and thus the callback) has
been triggered. This is useful for fallback behavior, e.g. logging when no
handlers are attached to an error signal.

```ts
try {
  // ...
}
catch (ex) {
  if (!Signal.lazy(errorSignal, () => ex)) {
    console.error(ex);
  }
}
```

The `lazy` function recognizes async signals and will return a promise in such
cases.

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
const mySignal = Signal.create({ async: true });

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
const mySignal = Signal.create({
  async: true,
  parallel: true
});

Signal.on(mySignal, () => sleep(100));
Signal.on(mySignal, () => sleep(100));

// will take ~100ms
await mySignal();
```

Keep in mind that if a handler rejects, other handlers continue their execution
and there is no way to await them anymore. Should any additional rejections
occur, they will be squelched to avoid unhandled rejections.

With parallel execution, it is a good practice to either make sure none of the
handlers ever reject or to pass an abort signal through the event object so that
you retain some control over the still-pending actions in case a rejection
occurs, e.g.:

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
`AbortSignal` browser APIs. However, you could use those for the same purpose,
too!

### Forwarding this

Signals forward `this` to all its handlers, however there are a few caveats to
using this feature. These stem from how JavaScript functions and the binding of
`this` work.

Any handler that relies on forwarded `this` has to be a regular function, not an
arrow function. Signals also need to be contained within the object that you
wish to forward as `this`.

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

When signals are not contained within an object (or you need to forward a
different object), it is necessary to trigger using the `.call` method and
manually pass the desired reference:

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
forwarding the `MouseEvent` object as well as `this` to all its handlers.

## Changelog

- 4.2.0
  - Added the `subscribe` method.
- 4.1.0
  - The `lazy` util now returns booleans indicating if the signal was triggered.
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
