import { createArrayBackend } from './backend/arrayBackend';
import { createES6MapBackend } from './backend/es6mapBackend';
import { createAsyncRunner } from './runner/asyncRunner';
import { createSyncRunner } from './runner/syncRunner';
import type {
	AsyncSignal,
	AsyncSignalOptions,
	Signal,
	SignalBackend,
	SignalBackendType,
	SignalHandler,
	SignalHandlerOptions,
	SignalOptions,
	SyncSignal,
	SyncSignalOptions,
	WrappedSignalHandler
} from './types';

const EMPTY_OBJ: any = {};
const ONCE_HANDLER_OPTIONS: SignalHandlerOptions = {
	once: true
};

const BACKEND_MAP: Record<SignalBackendType, (<T>() => SignalBackend<T>) | undefined> = {
	array: createArrayBackend,
	es6map: createES6MapBackend
};

/**
 * Creates a new synchronous Signal instance.
 */
export function create<T = void>(options?: SyncSignalOptions): SyncSignal<T>;

/**
 * Creates a new asynchronous Signal instance.
 */
export function create<T = void>(options?: AsyncSignalOptions): AsyncSignal<T>;

/**
 * Creates a new Signal instance.
 */
export function create<T = void>(options?: SignalOptions): Signal<T>;
export function create<T = void>(options: SignalOptions = EMPTY_OBJ): Signal<T> {
	const backend = (BACKEND_MAP[options.backend!] ?? createArrayBackend)<T>();
	const isAsync = options.async === true;
	const runner: any = isAsync
		? createAsyncRunner(backend, options)
		: createSyncRunner(backend, options as SyncSignalOptions);

	runner.backend = backend;
	runner.isAsync = isAsync;
	runner.hasHandlers = false;

	return runner;
}

/**
 * Creates a new synchronous Signal instance.
 *
 * This is a convenience function that internally calls `create` with the
 * `async` option always set to `false`.
 */
export function createSync<T = void>(options?: Omit<SyncSignalOptions, 'async'>) {
	return create<T>({
		...options,
		async: false
	});
}

/**
 * Creates a new asynchronous Signal instance.
 *
 * This is a convenience function that internally calls `create` with the
 * `async` option always set to `true`.
 */
export function createAsync<T = void>(options?: Omit<AsyncSignalOptions, 'async'>) {
	return create<T>({
		...options,
		async: true
	});
}

/**
 * Attempts to remove the given handler from a Signal or removes all its
 * handlers if no specific handler is provided.
 *
 * Returns a boolean indicating whether any handlers have been removed.
 */
export function off<T>(signal: Signal<T>, handler?: SignalHandler<T>): boolean {
	if (!handler) {
		// @ts-expect-error intentional mutation
		signal.hasHandlers = false;
		return signal.backend.removeAll();
	}

	const result = signal.backend.remove(handler);

	// @ts-expect-error intentional mutation
	signal.hasHandlers = signal.backend.hasHandlers();
	return result;
}

/**
 * Attaches a handler to a Signal. Has no effect if the handler has already been
 * attached to this Signal.
 */
export function on<T>(signal: Signal<T>, handler: SignalHandler<T>, options: SignalHandlerOptions = EMPTY_OBJ): void {
	let wrapped: WrappedSignalHandler<T> = handler;
	if (options.once) {
		wrapped = function (this: any, event?: T) {
			try {
				return handler.call(this, event!);
			}
			finally {
				if (wrapped.$skip !== true) {
					off(signal, handler);
				}
			}
		};

		wrapped.$wrapped = handler;
	}

	// @ts-expect-error intentional mutation
	signal.hasHandlers = true;
	signal.backend.add(wrapped);
}

/**
 * Attaches a handler to a Signal that is automatically removed after its first
 * invocation.
 *
 * This is a convenience function that internally calls `on` with the `once`
 * option always set to `true`.
 */
export function once<T>(signal: Signal<T>, handler: SignalHandler<T>): void {
	on(signal, handler, ONCE_HANDLER_OPTIONS);
}

/**
 * Checks whether a signal has any handlers attached and triggers it providing
 * return value of the `lazyEvent` callback as the event data.
 *
 * This is a no-op if the signal has no handlers attached.
 */
export function lazy<T>(signal: SyncSignal<T>, lazyEvent: () => T): void;
export function lazy<T>(signal: AsyncSignal<T>, lazyEvent: () => T): Promise<void>;
export function lazy<T>(this: any, signal: Signal<T>, lazyEvent: () => T) {
	if (signal.hasHandlers) {
		return (signal as any).call(this, lazyEvent());
	}

	return signal.isAsync
		? Promise.resolve()
		: undefined;
}
