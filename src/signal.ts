type Wrap<T> = T extends void ? [] : T extends unknown[] ? T : [ T ];

export interface Handler<TArgs = void> {
	(...args: Wrap<TArgs>): Promise<unknown> | void;
	inner?: Handler<TArgs>;
}

export interface SyncSignal<TArgs = void> {
	(...args: Wrap<TArgs>): void;
	readonly list: Handler<TArgs>[];
	readonly lock: () => void;
}

export interface SyncSignalOptions {
	async?: false;
}

export function createSync<TArgs = void>(): SyncSignal<TArgs> {
	let isUsingList = false;
	const signal = function () {
		isUsingList = true;
		try {
			const snapshot = signal.list;
			const length = snapshot.length;
			for (let i = 0; i < length; ++i) {
				snapshot[i].apply(null, arguments as never);
			}
		}
		finally {
			isUsingList = false;
		}
	};

	signal.list = [] as Handler<TArgs>[];
	signal.lock = () => {
		if (isUsingList) {
			signal.list = signal.list.slice();
			isUsingList = false;
		}
	};

	return signal;
}


export interface AsyncSignal<TArgs = void> {
	(...args: Wrap<TArgs>): Promise<void>;
	readonly list: Handler<TArgs>[];
	readonly lock: () => void;
}

export interface AsyncSignalOptions {
	async?: true;
	parallel?: boolean;
}

function isPromise(obj: any): obj is Promise<any> {
	return obj && typeof obj.then === 'function';
}

function parallel(handlers: Handler<any>[], args: any[]) {
	return new Promise<void>((resolve, reject) => {
		let pending = 0;
		const fulfill = () => {
			if (--pending === 0) {
				resolve();
			}
		};

		const length = handlers.length;
		for (let index = 0; index < length; ++index) {
			const result = handlers[index].apply(null, args);
			if (isPromise(result)) {
				++pending;
				result.then(fulfill, reject);
			}
		}
	});
}

function serial(handlers: Handler<any>[], args: any[]) {
	return new Promise<void>((resolve, reject) => {
		const length = handlers.length;
		let index = 0;

		const next = () => {
			if (index >= length) {
				resolve();
				return;
			}

			const result = handlers[index++].apply(null, args);
			if (isPromise(result)) {
				result.then(next, reject);
			}
			else {
				next();
			}
		};

		next();
	});
}

export function createAsync<TArgs = void>(options?: AsyncSignalOptions): AsyncSignal<TArgs> {
	let isUsingList = false;
	const strategy = options && options.parallel ? parallel : serial;
	const signal = function () {
		isUsingList = true;
		return strategy(signal.list, arguments as never).finally(() => {
			isUsingList = false;
		});
	};

	signal.list = [] as Handler<TArgs>[];
	signal.lock = () => {
		if (isUsingList) {
			signal.list = signal.list.slice();
			isUsingList = false;
		}
	};

	return signal;
}


export type Signal<TArgs = void> =
	SyncSignal<TArgs> | AsyncSignal<TArgs>;

export type SignalOptions =
	SyncSignalOptions | AsyncSignalOptions;

export function create<TArgs = void>(options?: SyncSignalOptions): SyncSignal<TArgs>;
export function create<TArgs = void>(options?: AsyncSignalOptions): AsyncSignal<TArgs>;
export function create(options: SignalOptions = {}) {
	return options.async
		? createAsync(options)
		: createSync();
}

export function off<TArgs>(signal: Signal<TArgs>, handler?: Handler<TArgs>) {
	const { list } = signal;
	if (handler === undefined) {
		signal.lock();
		list.splice(0, list.length);
		return true;
	}

	let index = list.length - 1;
	while (index >= 0) {
		const wrapped = list[index];
		if (wrapped === handler || wrapped.inner === handler) {
			break;
		}
		--index;
	}

	if (index !== -1) {
		signal.lock();
		signal.list.splice(index, 1);
		return true;
	}

	return false;
}

export function on<TArgs>(signal: Signal<TArgs>, handler: Handler<TArgs>, options: { once?: boolean } = {}) {
	let wrapped = handler;
	if (options && options.once) {
		wrapped = function () {
			off(signal, handler);
			return handler.apply(null, arguments as never);
		};
		wrapped.inner = handler;
	}

	signal.lock();
	signal.list.push(wrapped);
}

export function once<TArgs>(signal: Signal<TArgs>, handler: Handler<TArgs>) {
	on(signal, handler, { once: true });
}
