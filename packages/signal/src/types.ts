/**
 * Represents any function attached as a handler of a Signal.
 */
export interface SignalHandler<TEvent = void> {
	(event: TEvent): any;
}

/**
 * Represents any function attached as a handler of a Signal, or potentially a wrapper around
 * a SignalHandler containing logic to remove the handler after first invocation. Used for the
 * 'once' mechanic.
 */
export interface WrappedSignalHandler<TEvent = void> extends SignalHandler<TEvent> {
	/**
	 * When set, holds a ref to the original function wrapped as oneshot.
	 */
	$once?: SignalHandler<TEvent>;
}

export interface SignalBackendFactory<TBackend, TEvent = any> {
	/**
	 * Creates a new backend instance.
	 */
	$new(): TBackend;

	/**
	 * Adds a SignalHandler to the backend.
	 */
	$add(backend: TBackend, handler: WrappedSignalHandler<TEvent>, prepend?: boolean): void;

	/**
	 * Resets the backend, releasing all registered SignalHandlers.
	 */
	$reset(backend: TBackend): boolean;

	/**
	 * Gets the number of registered SignalHandlers.
	 */
	$count(backend: TBackend): number;

	/**
	 * Deletes a SignalHandler from the backend.
	 */
	$delete(backend: TBackend, handler: SignalHandler<TEvent>): boolean;

	/**
	 * Deletes a wrapped SignalHandler from the backend.
	 */
	$wrappedDelete(backend: TBackend, handler: WrappedSignalHandler<TEvent>): void;

	/**
	 * Gets snapshot of this backend.
	 */
	$snapshot(backend: TBackend): readonly WrappedSignalHandler<TEvent>[];
}

export type SignalArgs<TEvent> = TEvent extends void ? [] : [ event: TEvent ];

interface SignalBase<TBackend, TEvent, TAsync extends boolean> {
	/**
	 * The SignalBackend used by this signal.
	 */
	readonly $backend: TBackend;

	/**
	 * The SignalBackendFactory for this Signal's SignalBackend.
	 */
	readonly $factory: SignalBackendFactory<TBackend, TEvent>;

	/**
	 * Gets a boolean indicating whether this Signal is asynchronous.
	 */
	readonly isAsync: TAsync;
}

/**
 * Represents a synchronous Signal. When triggered, all attached handlers are presumed to be
 * synchronous and any returned Promises will be ignored.
 */
export interface SyncSignal<TEvent = void> extends SignalBase<any, TEvent, false> {
	(...args: SignalArgs<TEvent>): boolean;
}

/**
 * Represents an asynchronous Signal. When triggered, the return value of all attached handlers is
 * checked and any "thenable" results are properly awaited.
 */
export interface AsyncSignal<TEvent = void> extends SignalBase<any, TEvent, true> {
	(...args: SignalArgs<TEvent>): Promise<boolean>;
}

/**
 * Represents any Signal (synchronous or asynchronous).
 */
export type Signal<TEvent = void> = SyncSignal<TEvent> | AsyncSignal<TEvent>;

/**
 * Represents factory function responsible for creating Signal instances with specific, optionally
 * configurable, dispatch logic.
 */
export interface SignalDispatcherFactory<TBackend, TEvent, TOptions extends {}> {
	(backendFactory: SignalBackendFactory<TBackend>, dispatcherOptions?: TOptions): Signal<TEvent>;
}




interface SignalOptionsBase<TBackend, TAsync extends boolean> {
	/**
	 * Sets the SignalDispatcherFactory used to create the Signal's dispatcher. This ultimately
	 * controls the behavior of calling individual handlers and error propagation.
	 *
	 * Defaults to `SyncDispatcherFactory`.
	 */
	dispatcher?: SignalDispatcherFactory<TBackend>;

	/**
	 * Sets the SignalBackendFactory used to create the backend for the new Signal. This ultimately
	 * controls the behavior of adding and removing signal handlers.
	 *
	 * Defaults to `DefaultSignalBackend`.
	 */
	backend?: SignalBackendFactory<TBackend>;
}

export interface SyncSignalOptions extends SignalOptionsBase<false> {}

export interface AsyncSignalOptions extends SignalOptionsBase<true> {
	/**
	 * Controls whether or not to run asynchronous handlers in parallel rather than in series.
	 *
	 * Defaults to `false`.
	 */
	parallel?: boolean;
}

export type SignalOptions = SyncSignalOptions | AsyncSignalOptions;

export interface SignalHandlerOptions {
	/**
	 * Controls whether the handler should automatically be removed after its first invocation.
	 * Defaults to `false`.
	 */
	once?: boolean;

	/**
	 * Controls whether the handler should be inserted at the start of the handler collection rather
	 * than at the end. Defaults to `false`.
	 */
	prepend?: boolean;
}
