import { ArrayBackendFactory } from './backend/ArrayBackend';
import { SetBackendFactory } from './backend/SetBackend';
import { createAsyncDispatcher } from './dispatcher/asyncDispatcher';
import { createSyncDispatcher } from './dispatcher/syncDispatcher';
import type {
	AsyncSignal,
	AsyncSignalOptions,
	Signal,
	SignalBackendFactory,
	SignalBackendType,
	SignalHandler,
	SignalHandlerOptions,
	SignalOptions,
	SyncSignal,
	SyncSignalOptions
} from './types';

const BACKEND_MAP: Record<SignalBackendType, SignalBackendFactory | undefined> = {
	array: ArrayBackendFactory,
	set: SetBackendFactory
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
	const backend = (BACKEND_MAP[options.backend!] ?? ArrayBackendFactory).$create();
	const isAsync = options.async === true;
	const dispatcher: any = isAsync
		? createAsyncDispatcher(backend, options)
		: createSyncDispatcher(backend);

	dispatcher.$backend = backend;
	dispatcher.isAsync = isAsync;

	return dispatcher;
}

/**
 * Removes all handlers from the Signal.
 *
 * Returns a boolean indicating whether any handlers have been removed.
 */
export function off<T>(signal: Signal<T>): boolean;

/**
 * Attempts to remove the given handler from the Signal.
 *
 * Returns a boolean indicating whether the handler has been removed.
 */
export function off<T>(signal: Signal<T>, handler: SignalHandler<T>): boolean;
export function off<T>(signal: Signal<T>, handler?: SignalHandler<T>): boolean {
	return handler
		? signal.$backend.$factory.$delete(signal.$backend, handler)
		: signal.$backend.$factory.$clear(signal.$backend);
}

/**
 * Attaches a handler to a Signal that is automatically removed after its first
 * invocation.
 */
export function once<T>(signal: Signal<T>, handler: SignalHandler<T>, options?: SignalHandlerOptions): void {
	let wasTriggered = false;
	const wrapped = function (this: any, event?: T) {
		if (wasTriggered) {
			return undefined;
		}

		signal.$backend.$factory.$deleteWrapped(signal.$backend, wrapped);
		wasTriggered = true;

		return handler.call(this, event!);
	};

	wrapped.$once = handler;
	signal.$backend.$factory.$add(signal.$backend, wrapped, options?.prepend);
}

/**
 * Attaches a handler to a Signal.
 */
export function on<T>(signal: Signal<T>, handler: SignalHandler<T>, options?: SignalHandlerOptions): void {
	if (options?.once) {
		once(signal, handler);
	}
	else {
		signal.$backend.$factory.$add(signal.$backend, handler, options?.prepend);
	}
}

/**
 * Attaches a handler to a Signal and returns a function that detaches it when
 * called.
 */
export function subscribe<T>(signal: Signal<T>, handler: SignalHandler<T>, options?: SignalHandlerOptions): () => void {
	on(signal, handler, options);
	return () => off(signal, handler);
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
	if (signal.$backend.$factory.$size(signal.$backend) > 0) {
		const call = (signal as any).call(this, lazyEvent());
		return signal.isAsync
			? (call as Promise<void>).then(() => true)
			: true;
	}

	return signal.isAsync
		? Promise.resolve(false)
		: false;
}
