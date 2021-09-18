import { createAsync } from './asyncSignal';
import { createSync } from './syncSignal';
import type {
	AsyncSignal,
	AsyncSignalOptions,
	Signal,
	SignalHandler,
	SignalHandlerOptions,
	SignalOptions,
	SyncSignal,
	SyncSignalOptions,
	WrappedSignalHandler
} from './types';

export function create<T = void>(options?: SyncSignalOptions): SyncSignal<T>;
export function create<T = void>(options?: AsyncSignalOptions): AsyncSignal<T>;
export function create<T = void>(options?: SignalOptions): Signal<T> {
	return options?.async
		? createAsync(options)
		: createSync(options as SyncSignalOptions | undefined);
}

export function off<T>(signal: Signal<T>, handler?: SignalHandler<T>): boolean {
	return handler
		? signal.backend.remove(handler)
		: signal.backend.removeAll();
}

export function on<T>(signal: Signal<T>, handler: SignalHandler<T>, options?: SignalHandlerOptions): void {
	let wrapped: WrappedSignalHandler<T> = handler;
	if (options?.once) {
		wrapped = function (this: any, event?: T) {
			try {
				return handler.call(this, event!);
			}
			finally {
				if (wrapped.$skipRemove !== true) {
					off(signal, handler);
				}
			}
		};

		// mutation here is okay
		wrapped.$originalSignalHandler = handler;
	}

	signal.backend.add(wrapped);
}

export function once<T>(signal: Signal<T>, handler: SignalHandler<T>): void {
	on(signal, handler, { once: true });
}
