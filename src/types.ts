export interface Handler<T> {
	(event: T): any;
}

export interface WrappedHandler<T> extends Handler<T> {
	inner?: Handler<T>;
}

export interface HandlerOptions {
	once?: boolean;
}

interface SignalMixin<T> {
	readonly handlers: WrappedHandler<T>[];
	readonly lock: (handlers?: WrappedHandler<T>[]) => void;
}

type Args<T> = T extends void ? [] : [ event: T ];

export interface SyncSignal<T = void> extends SignalMixin<T> {
	(...args: Args<T>): void;
}

export interface SyncSignalOptions {
	async?: false;
}

export interface AsyncSignal<T = void> extends SignalMixin<T> {
	(...args: Args<T>): Promise<void>;
}

export interface AsyncSignalOptions {
	async?: true;
	parallel?: boolean;
}

export type Signal<T = void> =
	| SyncSignal<T>
	| AsyncSignal<T>;

export type SignalOptions =
	| SyncSignalOptions
	| AsyncSignalOptions;
