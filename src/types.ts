export interface SignalHandler<T = void> {
	(event: T): any;
}

export interface SignalHandlerOptions {
	once?: boolean;
}

/** @internal */
export interface WrappedSignalHandler<T> extends SignalHandler<T> {
	$originalSignalHandler?: SignalHandler<T>;
	$skipRemove?: true;
}

/** @internal */
export type Handlers<T> = readonly WrappedSignalHandler<T>[];

/** @internal */
export interface SignalBackend<T> {
	add(handler: WrappedSignalHandler<T>): void;
	remove(handler: SignalHandler<T>): boolean;
	removeAll(): boolean;
	beginRead(): Handlers<T>;
	endRead(): void;
}

export type SignalBackendType = 'array' | 'es6map';

export type SignalArgs<T> = T extends void ? [] : [ event: T ];

interface SignalBase<T> {
	/** @internal */
	readonly backend: SignalBackend<T>;
}

interface SignalOptionsBase {
	backend?: SignalBackendType;
}

export interface AsyncSignal<T = void> extends SignalBase<T> {
	(...args: SignalArgs<T>): Promise<void>;
}

export interface AsyncSignalOptions extends SignalOptionsBase {
	async?: true;
	parallel?: boolean;
}

export interface SyncSignal<T = void> extends SignalBase<T> {
	(...args: SignalArgs<T>): void;
}

export interface SyncSignalOptions extends SignalOptionsBase {
	async?: false;
}

export type Signal<T = void> =
	| SyncSignal<T>
	| AsyncSignal<T>;

export type SignalOptions =
	| SyncSignalOptions
	| AsyncSignalOptions;
