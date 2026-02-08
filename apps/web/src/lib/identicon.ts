const hashString = (value: string) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

export const buildIdenticonSvg = (seed: string, size = 120) => {
  const hash = hashString(seed || "sx");
  const hue = hash % 360;
  const bg = `hsl(${hue}, 35%, 90%)`;
  const fg = `hsl(${hue}, 70%, 45%)`;

  const cells: boolean[] = [];
  let bits = hash;
  for (let i = 0; i < 15; i += 1) {
    bits = (bits * 1664525 + 1013904223) >>> 0;
    cells.push(Boolean(bits & 1));
  }

  const cellSize = size / 5;
  const squares: string[] = [];
  let idx = 0;
  for (let y = 0; y < 5; y += 1) {
    for (let x = 0; x < 3; x += 1) {
      const on = cells[idx++];
      if (on) {
        const px = x * cellSize;
        const py = y * cellSize;
        squares.push(
          `<rect x="${px}" y="${py}" width="${cellSize}" height="${cellSize}" />`,
          `<rect x="${(4 - x) * cellSize}" y="${py}" width="${cellSize}" height="${cellSize}" />`
        );
      }
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" rx="${size / 2}" fill="${bg}" />
      <g fill="${fg}">${squares.join("")}</g>
    </svg>
  `;
};

export const buildIdenticonDataUrl = (seed: string, size = 120) => {
  const svg = buildIdenticonSvg(seed, size).trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const buildProfileCoverGradient = (seed: string) => {
  const hash = hashString(seed || "sx");
  const hue = hash % 360;
  const hue2 = (hue + 48) % 360;
  return `linear-gradient(120deg, hsl(${hue}, 55%, 82%), hsl(${hue2}, 60%, 72%))`;
};
