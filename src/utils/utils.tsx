export function generateColorMap(labels) {
    let colorMap = {};

    labels?.forEach((label, i) => { 
        colorMap[label] = generateColor(i, labels.length);
    });
    colorMap["-"] = "#f2f2f2";

    return colorMap;
}

export function generateColorMetric(minVal, maxVal, val) {
    const startHue = 3;
    const endHue = 255;

    if (isNaN(val) || val == null) return "#f2f2f2";
    if (maxVal === minVal) return `hsl(${startHue}, 30%, 60%)`;

    const ratio = (val - minVal) / (maxVal - minVal);
    const clampedRatio = Math.max(0, Math.min(1, ratio)); // Ensure ratio is between 0 and 1

    const hue = startHue + (endHue - startHue) * clampedRatio;

    return `hsl(${hue}, 67%, 60%)`;
}

// export function generateColorMetric(minVal, maxVal, val) {
//     const startHue = 0;   // green-yellow
//     const endHue = 255;    // blue-purple

//     if (isNaN(val) || val == null) return "#f2f2f2";
//     if (maxVal === minVal) return `hsl(${startHue}, 100%, 5%)`;

//     const ratio = (val - minVal) / (maxVal - minVal);
//     const clampedRatio = Math.max(0, Math.min(1, ratio));

//     const hue = startHue + (endHue - startHue) * clampedRatio;
//     const saturation = 80 + 20 * Math.abs(0.5 - clampedRatio);  // from 80% to 100%
//     const lightness = 35 + 30 * (1 - clampedRatio);             // from 65% to 35%

//     return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
// }



const generateColor = (index, total) => {
    const hue = (index * (360 / total)) % 360;
    return `hsl(${hue}, 80%, 75%)`;
};

export const lightenHSL = (hsl, percent) => {
    const match = hsl.match(/hsl\((\d+(\.\d+)?), (\d+(\.\d+)?)%, (\d+(\.\d+)?)%\)/);
    if (!match) return hsl;

    let [_, h, , s, , l] = match.map((v, i) => (i === 0 ? v : Number(v))); // Parse values
    l = Math.max(0, Math.min(100, l + percent));

    return `hsl(${h}, ${s}%, ${l}%)`;
  };
  
export const generateBgColors = (colorMap) => {
    const backgroundColors = {};
    Object.entries(colorMap).forEach(([key, bgColor]) => {
      backgroundColors[key] = lightenHSL(bgColor, 20);
    });
    return backgroundColors;
};

export function lightenHSLArray(hslArray) {
    return hslArray.map(hsl => {
        if (hsl === "#f2f2f2") return "#e6e6e6";
        return lightenHSL(hsl, 15);
    })
}
  

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