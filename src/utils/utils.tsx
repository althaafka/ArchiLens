export function generateColorMap(labels) {
    let colorMap = {};

    labels?.forEach((label, i) => { 
        if (label.data.id === "-") {
            colorMap[label.data.id] = "#F2F2F2";
        } else {
            colorMap[label.data.id] = generateColor(i, labels.length);
        }
    });

    return colorMap;
}

const generateColor = (index, total) => {
    const hue = (index * (360 / total)) % 360;
    return `hsl(${hue}, 80%, 75%)`;
};

const lightenHSL = (hsl, percent) => {
    const match = hsl.match(/hsl\((\d+), (\d+)%, (\d+)%\)/);
    if (!match) return hsl;
  
    let [_, h, s, l] = match.map(Number);
    l = Math.max(0, Math.min(100, l + percent))
  
    return `hsl(${h}, ${s}%, ${l}%)`;
  };
  
export const generateBgColors = (colorMap) => {
    const backgroundColors = {};
    Object.entries(colorMap).forEach(([key, bgColor]) => {
      backgroundColors[key] = lightenHSL(bgColor, 30);
    });
    return backgroundColors;
};
  

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

export function counterToPercentage(counter) {
	const total = Object.values(counter).reduce((sum, count) => sum + count, 0);
	const result = {};
	for (const key in counter) {
		result[key] = total ? counter[key] / total : 0;
	}
	return result;
}

export function camelCaseToWords(input) {
    return input.replace(/([a-z])([A-Z])/g, '$1 $2');
}