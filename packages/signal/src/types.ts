/**
 * Represents any function attached as a handler of a signal.
 */
export interface SignalHandler<T = void> {
	(event: T): any;
}

export interface SignalHandlerOptions {
	/**
	 * Controls whether the handler should automatically be removed after its
	 * first invocation.
	 */
	once?: boolean;
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
	$add(handler: WrappedSignalHandler<T>): void;
	$clear(): boolean;
	$count(): number;
	$delete(handler: SignalHandler<T>): boolean;
	$deleteWrapped(handler: WrappedSignalHandler<T>): void;
	$getSnapshot(): readonly WrappedSignalHandler<T>[];
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
	(...args: SignalArgs<T>): void;
}

/**
 * Represents an asynchronous Signal. When triggered, the return value of all
 * attached handlers is checked and any "thenable" results are properly awaited.
 */
export interface AsyncSignal<T = void> extends SignalBase<T, true> {
	(...args: SignalArgs<T>): Promise<void>;
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
