export function SetBackend() {
	// We use Set for all persistent handlers, but we must use an array for
	// 'once' handlers. We assume this array will be empty most of the time.
	this.$persistent = new Set();
	this.$oneshot = [];
}

SetBackend.prototype.$snapshot = null;

SetBackend.prototype.$getSnapshot = function () {
	if (!this.$snapshot) {
		this.$snapshot = Array.from(this.$persistent.values()).concat(this.$oneshot);
	}

	return this.$snapshot;
};

SetBackend.prototype.$add = function (handler) {
	if (handler.$once) {
		if (this.$persistent.has(handler.$once)) {
			return;
		}

		this.$oneshot.push(handler);
	}
	else {
		this.$persistent.add(handler);
		this.$deleteOneshot(handler);
	}

	this.$snapshot = null;
};

SetBackend.prototype.$clear = function () {
	if (this.$count()) {
		this.$persistent.clear();
		this.$oneshot = [];
		this.$snapshot = null;
		return true;
	}

	return false;
};

SetBackend.prototype.$count = function () {
	return this.$persistent.size + this.$oneshot.length;
};

SetBackend.prototype.$delete = function (handler) {
	if (this.$persistent.delete(handler)) {
		this.$snapshot = null;
		return true;
	}

	return this.$deleteOneshot(handler);
};

SetBackend.prototype.$deleteWrapped = function (handler) {
	const index = this.$oneshot.lastIndexOf(handler);
	if (index !== -1) {
		this.$oneshot.splice(index, 1);
		this.$snapshot = null;
	}
};

SetBackend.prototype.$deleteOneshot = function (handler) {
	let index = this.$oneshot.length - 1;
	while (index >= 0) {
		if (this.$oneshot[index].$once === handler) {
			this.$oneshot.splice(index, 1);
			this.$snapshot = null;
			return true;
		}

		--index;
	}

	return false;
};
