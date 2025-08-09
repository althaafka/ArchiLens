export function generateColorMap(labels) {
    let colorMap = {};

    labels?.forEach((label, i) => { 
        colorMap[label] = generateColor(i, labels.length);
    });
    colorMap["-"] = "#fafaf9";

    return colorMap;
}

function hexToRgb(hex: any) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(h => h + h).join('');
  }
  const bigint = parseInt(hex, 16);
  return [
    (bigint >> 16) & 255,
    (bigint >> 8) & 255,
    bigint & 255
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
  const startColor = hexToRgb('#Fafaf9');
  const endColor = hexToRgb('#3387CC');

  if (isNaN(val) || val == null) return "#fafaf9";
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
  if (!hsl) return;
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
      if (hsl === "#fafaf9") return "#e6e6e6";
      return lightenHSL(hsl, 15);
  })
}

export function interpolateHexColor(color1: string, color2: string, factor: number): string {
  let c1 = parseInt(color1.slice(1), 16);
  let c2 = parseInt(color2.slice(1), 16);

  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;

  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
