export function generateColorMap(labels) {
    let colorMap = {};

    labels?.forEach((label, i) => { 
        colorMap[label] = generateColor(i, labels.length);
    });
    colorMap["-"] = "#f2f2f2";

    return colorMap;
}

function hexToRgb(hex: any) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(h => h + h).join('');
  }
  const bigint = parseInt(hex, 16);
  return [
    (bigint >> 16) & 255,  // R
    (bigint >> 8) & 255,   // G
    bigint & 255           // B
  ];
}

function rgbToHex([r, g, b]: any) {
  return (
    '#' +
    [r, g, b]
      .map(c => Math.round(c).toString(16).padStart(2, '0'))
      .join('')
  );
}

export function generateColorMetric(minVal, maxVal, val) {
  const startColor = hexToRgb('#F2F2F2'); // light grayish
  const endColor = hexToRgb('#3387CC');   // darker gray

  if (isNaN(val) || val == null) return "#f2f2f2";
  if (maxVal === minVal) return rgbToHex(startColor);

  const ratio = Math.max(0, Math.min(1, (val - minVal) / (maxVal - minVal)));

  const interpolated = startColor.map((start, i) => {
    const end = endColor[i];
    return start + (end - start) * ratio;
  });

  return rgbToHex(interpolated);
}


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
