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
- ✅ tiny, without any dependencies (~1.5 kB)
- ✅ smoothly integrates with standard event emitters
- ✅ does not rely on string event names, which are much harder to use with
  autocompletion or type-checking and present a frequent source of silly bugs
  due to typos

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
object with the following fields:

- `async: boolean = false`  
  controls whether the signal should act with respect to promises returned by
  event handlers
- `parallel: boolean = false`  
  controls whether asynchronous handlers will run in parallel or in series, only
  has effect if async is set to true

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
```

### Adding Handlers

To add a handler use the `Signal.on` function. The first argument is always a
signal instance, the second is the handler to add.

```ts
Signal.on(mySignal, () => console.log('foo'));
```

Handlers will be invoked every time the signal is triggered. You can also set
the `once` flag to only invoke a handler once and then to automatically remove
it from the handler list.

```ts
Signal.on(mySignal, myHandler, { once: true });

// shorter version using the .once util
Signal.once(mySignal, myHandler);
```

Adding the same handler multiple times will cause it to be invoked that amount
of times when the signal is triggered. This is intended behavior.

```ts
const mySignal = Signal.create();
const onTrigger = () => console.log('bar');

Signal.on(mySignal, onTrigger);
Signal.on(mySignal, onTrigger);

// will print 'bar' twice
mySignal();
```

### Removing Handlers

To remove a handler (regardless of the once option), use the `Signal.off`
function. It will search for the first occurrence of the handler and remove it
from the list.

If the same handler was added multiple times (by calling `.on` repeatedly), to
fully remove it you must call `.off` the same amount of times.

If no specific handler is provided via the second argument the `.off` function
will remove all handlers registered for the given signal.

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
const controller = new AbortController();
try {
  await mySignal({ abortSignal: controller.signal });
}
catch (ex) {
  controller.abort();
  console.error(ex);
}
```

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
