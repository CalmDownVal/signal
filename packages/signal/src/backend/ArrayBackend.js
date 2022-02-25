export function ArrayBackend() {
	this.$handlers = [];
}

ArrayBackend.prototype.$snapshot = null;

ArrayBackend.prototype.$getSnapshot = function () {
	if (!this.$snapshot) {
		this.$snapshot = this.$handlers.slice();
	}

	return this.$snapshot;
};

ArrayBackend.prototype.$add = function (handler) {
	this.$handlers.push(handler);
	this.$snapshot = null;
};

ArrayBackend.prototype.$clear = function () {
	if (this.$handlers.length === 0) {
		return false;
	}

	this.$handlers = [];
	this.$snapshot = null;
	return true;
};

ArrayBackend.prototype.$count = function () {
	return this.$handlers.length;
};

ArrayBackend.prototype.$delete = function (handler) {
	const { $handlers } = this;

	let index = $handlers.length - 1;
	let current;

	while (index >= 0) {
		current = $handlers[index];
		if (current === handler || current.$once === handler) {
			break;
		}

		--index;
	}

	if (index === -1) {
		return false;
	}

	this.$handlers.splice(index, 1);
	this.$snapshot = null;
	return true;
};

ArrayBackend.prototype.$deleteWrapped = function (handler) {
	const index = this.$handlers.lastIndexOf(handler);
	if (index !== -1) {
		this.$handlers.splice(index, 1);
		this.$snapshot = null;
	}
};
