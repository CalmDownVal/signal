/**
 * Represents any function attached as a handler of a signal.
 */
export interface SignalHandler<T = void> {
	(event: T): any;
}

export interface SignalHandlerOptions {
	/**
	 * Controls whether the handler should automatically be removed after its
	 * first invocation. Defaults to `false`.
	 */
	once?: boolean;

	/**
	 * Controls whether the handler should be inserted at the start of the
	 * handler collection rather than at the end. Defaults to `false`.
	 */
	prepend?: boolean;
}

/** @internal */
export interface WrappedSignalHandler<T> extends SignalHandler<T> {
	/**
	 * When set, holds a ref to the original function wrapped as oneshot.
	 */
	$once?: SignalHandler<T>;
}

/** @internal */
export interface SignalBackend<T> {
	readonly $factory: SignalBackendFactory<this, T>;
}

/** @internal */
export interface SignalBackendFactory<TBackend extends SignalBackend<any> = SignalBackend<any>, TSignal = any> {
	$create(): TBackend;
	$add(backend: TBackend, handler: WrappedSignalHandler<TSignal>, prepend?: boolean): void;
	$clear(backend: TBackend): boolean;
	$size(backend: TBackend): number;
	$delete(backend: TBackend, handler: SignalHandler<TSignal>): boolean;
	$deleteWrapped(backend: TBackend, handler: WrappedSignalHandler<TSignal>): void;
	$getSnapshot(backend: TBackend): readonly WrappedSignalHandler<TSignal>[];
}

export type SignalBackendType = 'array' | 'set';

export type SignalArgs<T> = T extends void ? [] : [ event: T ];

interface SignalBase<T, TAsync extends boolean> {
	/** @internal */
	readonly $backend: SignalBackend<T>;

	/**
	 * Gets a boolean indicating whether this Signal is asynchronous.
	 */
	readonly isAsync: TAsync;
}

/**
 * Represents a synchronous Signal. When triggered, all attached handlers are
 * presumed to be synchronous and any returned Promises will be ignored.
 */
export interface SyncSignal<T = void> extends SignalBase<T, false> {
	(...args: SignalArgs<T>): boolean;
}

/**
 * Represents an asynchronous Signal. When triggered, the return value of all
 * attached handlers is checked and any "thenable" results are properly awaited.
 */
export interface AsyncSignal<T = void> extends SignalBase<T, true> {
	(...args: SignalArgs<T>): Promise<boolean>;
}

/**
 * Represents any Signal (synchronous or asynchronous).
 */
export type Signal<T = void> =
	| SyncSignal<T>
	| AsyncSignal<T>;

interface SignalOptionsBase<TAsync extends boolean> {
	/**
	 * Controls whether or not to create an asynchronous Signal.
	 *
	 * Defaults to `false`, i.e. synchronous signals.
	 */
	async?: TAsync;

	/**
	 * Allows to change the backing data structure used to store handlers
	 * attached to the created Signal.
	 *
	 * Defaults to `'array'`.
	 */
	backend?: SignalBackendType;
}

export interface SyncSignalOptions extends SignalOptionsBase<false> {}

export interface AsyncSignalOptions extends SignalOptionsBase<true> {
	/**
	 * Controls whether or not to run asynchronous handlers in parallel rather
	 * than in series.
	 *
	 * Defaults to `false`.
	 */
	parallel?: boolean;
}

export type SignalOptions =
	| SyncSignalOptions
	| AsyncSignalOptions;
