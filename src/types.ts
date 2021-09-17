export interface SignalHandler<T> {
	(event: T): void;
}

export interface SignalHandlerOptions {
	once?: boolean;
}

/** @internal */
export interface WrappedHandler<T> extends SignalHandler<T> {
	readonly inner?: SignalHandler<T>;
}

/** @internal */
export type Handlers<T> = readonly WrappedHandler<T>[];

interface SignalMixin<T> {
	/** @internal */
	readonly handlers: Handlers<T>;
	/** @internal */
	readonly lock: (handlers?: Handlers<T>) => void;
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

/**
 * @deprecated This type is deprecated and will be removed in future major
 * version. Prefer using `SignalHandler<T>`.
 */
export type Handler<T> = SignalHandler<T>;

/**
 * @deprecated This type is deprecated and will be removed in future major
 * version. Prefer using `SignalHandlerOptions`.
 */
export type HandlerOptions = SignalHandlerOptions;
