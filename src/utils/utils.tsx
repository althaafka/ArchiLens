export function addScratch(ele, key, value) {
	if (!ele.scratch('_archilens')) ele.scratch('_archilens', {});
	ele.scratch('_archilens')[key] = value;
}

export function getScratch(ele, key) {
	if (ele.scratch('_archilens') && key in ele.scratch('_archilens')) return ele.scratch('_archilens')[key];
	return null;
}

export const counter = (arr) => arr.reduce((acc, val) => {
	acc[val] = (acc[val] || 0) + 1;
	return acc;
}, {});

export const mergeCounters = (counters) => {
	return counters.reduce((acc, counter) => {
		Object.entries(counter).forEach(([key, val]) => {
			acc[key] = (acc[key] || 0) + val;
		});
		return acc;
	}, {});
};

export function counterToPercentage(counter: Record<string, number>) {
    const total = Object.values(counter).reduce((sum, count) => sum + count, 0);
    const result: Record<string, number> = {};
    for (const key in counter) {
        result[key] = total ? counter[key] / total : 0;
    }
    return result;
}

export function camelCaseToWords(input) {
    return input.replace(/([a-z])([A-Z])/g, '$1 $2');
}