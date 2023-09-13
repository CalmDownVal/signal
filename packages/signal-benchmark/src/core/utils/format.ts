export function formatLargeInt(n: number) {
	let str = Math.round(n).toString();
	for (let i = str.length - 3; i > 0; i -= 3) {
		str = str.slice(0, i) + ' ' + str.slice(i);
	}

	return str;
}

export function formatPercentage(n: number) {
	return `${n.toFixed(2)}%`;
}
