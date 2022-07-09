import { ArrayBackend } from './backend/ArrayBackend';
import { SetBackend } from './backend/SetBackend';
import { createAsyncDispatcher } from './dispatcher/asyncDispatcher';
import { createSyncDispatcher } from './dispatcher/syncDispatcher';
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
	SyncSignalOptions
} from './types';

const BACKEND_MAP: Record<SignalBackendType, (new <T>() => SignalBackend<T>) | undefined> = {
	array: ArrayBackend,
	set: SetBackend
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
export function create<T = void>(options: SignalOptions = {}): Signal<T> {
	const backend = new (BACKEND_MAP[options.backend!] ?? ArrayBackend)<T>();
	const isAsync = options.async === true;
	const dispatcher: any = isAsync
		? createAsyncDispatcher(backend, options)
		: createSyncDispatcher(backend, options as SyncSignalOptions);

	dispatcher.$backend = backend;
	dispatcher.isAsync = isAsync;

	return dispatcher;
}

/**
 * Attempts to remove the given handler from a Signal or removes all its
 * handlers if no specific handler is provided.
 *
 * Returns a boolean indicating whether any handlers have been removed.
 */
export function off<T>(signal: Signal<T>, handler?: SignalHandler<T>): boolean {
	return handler
		? signal.$backend.$delete(handler)
		: signal.$backend.$clear();
}

/**
 * Attaches a handler to a Signal that is automatically removed after its first
 * invocation.
 */
export function once<T>(signal: Signal<T>, handler: SignalHandler<T>): void {
	let wasTriggered = false;
	const wrapped = function (this: any, event?: T) {
		if (wasTriggered) {
			return undefined;
		}

		signal.$backend.$deleteWrapped(wrapped);
		wasTriggered = true;

		return handler.call(this, event!);
	};

	wrapped.$once = handler;
	signal.$backend.$add(wrapped);
}

/**
 * Attaches a handler to a Signal. Has no effect if the handler has already been
 * attached to this Signal.
 */
export function on<T>(signal: Signal<T>, handler: SignalHandler<T>, options?: SignalHandlerOptions): void {
	if (options?.once) {
		once(signal, handler);
	}
	else {
		signal.$backend.$add(handler);
	}
}

/**
 * Checks whether a signal has any handlers attached and triggers it providing
 * return value of the `lazyEvent` callback as the event data. This is a no-op
 * when the signal has no handlers attached.
 *
 * Returns (sync signals) or resolves to (async signals) a boolean indicating
 * whether the signal was triggered.
 */
export function lazy<T>(signal: SyncSignal<T>, lazyEvent: () => T): boolean;
export function lazy<T>(signal: AsyncSignal<T>, lazyEvent: () => T): Promise<boolean>;
export function lazy<T>(this: any, signal: Signal<T>, lazyEvent: () => T) {
	if (signal.$backend.$count()) {
		const call = (signal as any).call(this, lazyEvent());
		return signal.isAsync
			? (call as Promise<void>).then(() => true)
			: true;
	}

	return signal.isAsync
		? Promise.resolve(false)
		: false;
}
