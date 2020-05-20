# Signal

A lightweight event dispatcher.

- [Comparison with EventEmitter](#comparison-with-eventemitter)
- [Usage Guide](#usage-guide)
  - [Creating a Signal](#creating-a-signal)
  - [Adding Handlers](#adding-handlers)
  - [Removing Handlers](#removing-handlers)
  - [Triggering a Signal](#triggering-a-signal)
  - [Async Signals](#async-signals)
    - [Serial Execution](#serial-execution)
    - [Parallel Execution](#parallel-execution)
  - [Wrapping an EventEmitter](#wrapping-an-eventemitter)

## Comparison with EventEmitter

### Pros

- ✅ does not rely on inheritance or mixins
- ✅ supports async handlers with serial and parallel invocation strategies
- ✅ provides concise and readable interface
- ✅ can be passed to standard event emitters
- ✅ does not rely on string event names, which are much harder to use with
  autocompletion and type-checking and therefore a frequent source of silly bugs
  caused by typos
- ✅ tiny, without any dependencies

### Cons

- ❌ is non-standard and will involve some learning curve and getting used to
- ❌ does not support event bubbling

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
// both will execute their handlers synchronously
const syncSignal1 = Signal.create();
const syncSignal2 = Signal.createSync();

// both will execute their handlers asynchronously, in series, one at a time
const asyncSignal1 = Signal.create({ async: true });
const asyncSignal2 = Signal.createAsync();

// both will execute their handlers asynchronously, all at once, in parallel
const asyncSignal3 = Signal.create({ async: true, parallel: true });
const asyncSignal4 = Signal.createAsync({ parallel: true });
```

### Adding Handlers

To add a handler use the `Signal.on` function. The first argument is always a
signal instance, the second is the handler to add.

```ts
Signal.on(mySignal, () => console.log('foo'));
```

Such handlers will be invoked every time the signal is triggered. You can also
specify the `once` option to only have a handler run once and then automatically
remove itself from the handler list.

```ts
// trigger once by passing the options object
Signal.on(mySignal, myHandler, { once: true });

// trigger once or by using the util function
Signal.once(mySignal, myHandler);
```

Adding the same handler multiple times will cause it to be invoked that amount
of times when the signal is triggered. This is intended behavior.

```ts
const test = Signal.create();
const onTrigger = () => console.log('bar');

Signal.on(test, onTrigger);
Signal.on(test, onTrigger);

test(); // will print 'bar' twice
```

### Removing Handlers

To remove a handler (regardless of the once option), use the `Signal.off`
function. It will search for the first occurrence of the callback and remove it
from the list if found. The function will return a boolean indicating whether
the handler was found and removed or not.

If the same handler was added multiple times (by calling .on repeatedly), to
remove it you must call .off the same amount of times.

```ts
// will remove the first found occurrence of myHandler
Signal.off(s1, myHandler);

// will remove all registered handlers
Signal.off(s1);
```

### Triggering a Signal

Each signal instance is actually a function and thus can be called directly. You
can pass any amount of arguments to a signal, they will be forwarded to each
handler. No data is returned by this function call (void).

```ts
mySignal('arg1', 123, /* ... */);
```

Synchronous signals will invoke handlers in series. If any one of them throws
the execution immediately stops. It is the caller's responsibility to handle any
such states:

```ts
try {
  mySignal('arg1');
}
catch (error) {
  console.error('one of the handlers threw an exception', error);
}
```

### Async Signals

Asynchronous signal interface is almost identical to their synchronous
counterpart. The key difference is that an async signal will check the return
type of every handler and properly await any promises returned.

Sync signals will also work with async handlers but *will ignore* the return
type of the handlers. This may be desirable in some cases, but keep in mind that
*any potential promise rejections will not be handled!*

The execution strategy of async handlers is configurable via the `parallel`
option (see [Creating a Signal](#creating-a-signal)).

#### Serial Execution

The default strategy is serial execution. Execution will await the first handler
before moving on to the next one.

This strategy was chosen as default because it best resembles the synchronous
signal execution. Any promise rejections will immediately propagate upwards and
terminate the execution.

The obvious disadvantage is that this strategy may sometimes take a very long
time to finish.

```ts
const mySignal = Signal.createAsync();

Signal.on(mySignal, () => delay(100));
Signal.on(mySignal, () => delay(100));

// will take ~200ms
await mySignal();
```

#### Parallel Execution

When enabled, the signal will invoke all handlers simultaneously and resolve
once *all* have resolved. If one or more handlers reject the wrapping promise
returned by the signal will also immediately. This is similar to the behavior of
`Promise.all`.

This strategy can often provide significant speedups as many async actions can
run simultaneously.

It is not suitable for situations when logic of one handler may affect the
outcome of others as it may introduce race conditions which generally result in
very nasty, hard to track bugs.

One more caveat of this strategy is that if a handler rejects, other handlers
still continue their execution and there is no longer any way to await or cancel
them. Moreover if additional rejections occur, they will not propagate upwards
either (the wrapping promise is already rejected) and will stay hidden from any
error handling efforts you might have set up.

```ts
const mySignal = Signal.createAsync({ parallel: true });

Signal.on(mySignal, () => delay(100));
Signal.on(mySignal, () => delay(100));

// will take ~100ms
await mySignal();
```

### Wrapping an EventEmitter

If you have an EventEmitter that you wish to 'signalify' you can do so by simply
passing the signal itself to the `addEventListener` function:

```ts
const confirmed = Signal.create();
const button = document.getElementById('ok-button');

button.addEventListener('click', confirmed);
```

Now every time the button is clicked the `confirmed` signal will trigger.
