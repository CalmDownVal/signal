import type { EventEmitter } from 'node:events';

export interface MessagePort extends EventEmitter {
	postMessage(value: any, transferList?: readonly any[]): void;
}

export function post<T>(port: MessagePort, message: T, transferList?: readonly any[]) {
	port.postMessage(message, transferList);
}

export function receive<T>(port: MessagePort, timeoutMs = 1_000) {
	return new Promise<T>((resolve, reject) => {
		let timeoutHandle: ReturnType<typeof setTimeout>;
		const callback = (message: T) => {
			resolve(message);
			clearTimeout(timeoutHandle);
		};

		timeoutHandle = setTimeout(() => {
			port.off('message', callback);
			reject(new Error('Operation timed out.'));
		}, timeoutMs);

		port.once('message', callback);
	});
}
