import { createAsync } from './asyncSignal';
import { createSync } from './syncSignal';
import type {
	AsyncSignal,
	AsyncSignalOptions,
	Handler,
	HandlerOptions,
	Signal,
	SignalOptions,
	SyncSignal,
	SyncSignalOptions,
	WrappedHandler
} from './types';

export function create<T = void>(options?: SyncSignalOptions): SyncSignal<T>;
export function create<T = void>(options?: AsyncSignalOptions): AsyncSignal<T>;
export function create<T = void>(options?: SignalOptions): Signal<T> {
	return options?.async
		? createAsync(options)
		: createSync();
}

export function off<T>(signal: Signal<T>, handler?: Handler<T>): boolean {
	const oldHandlers = signal.handlers;
	const length = oldHandlers.length;

	if (length === 0) {
		return false;
	}

	if (handler === undefined) {
		signal.lock([]);
		return true;
	}

	let searchIndex = length - 1;
	while (searchIndex >= 0) {
		const current = oldHandlers[searchIndex];
		if (current === handler || current.inner === handler) {
			break;
		}

		--searchIndex;
	}

	if (searchIndex === -1) {
		return false;
	}

	const newHandlers = new Array<WrappedHandler<T>>(length - 1);

	let oldIndex = 0;
	let newIndex = 0;
	while (oldIndex < length) {
		if (oldIndex !== searchIndex) {
			newHandlers[newIndex] = oldHandlers[oldIndex];
			++newIndex;
		}

		++oldIndex;
	}

	signal.lock(newHandlers);
	return true;
}

export function on<T>(signal: Signal<T>, handler: Handler<T>, options?: HandlerOptions): void {
	let callback: WrappedHandler<T> = handler;
	if (options?.once) {
		callback = function (this: any, event?: T) {
			off(signal, handler);
			return handler.call(this, event!);
		};

		callback.inner = handler;
	}

	signal.lock();
	signal.handlers.push(callback);
}

export function once<T>(signal: Signal<T>, handler: Handler<T>): void {
	on(signal, handler, { once: true });
}
