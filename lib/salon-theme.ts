type ThemeStyle = Record<string, string>;

const DEFAULT_ACCENT = "#b42323";

export function getSalonThemeStyle(primaryColor?: string | null): ThemeStyle {
  const accent = normalizeHexColor(primaryColor) ?? DEFAULT_ACCENT;

  return {
    "--accent": accent,
    "--accent-donker": darkenHex(accent, 0.28),
    "--accent-zacht": mixHex(accent, "#ffffff", 0.86)
  };
}

function normalizeHexColor(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return /^#[0-9A-Fa-f]{6}$/.test(trimmed) ? trimmed.toLowerCase() : null;
}

function darkenHex(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex({
    r: Math.round(r * (1 - amount)),
    g: Math.round(g * (1 - amount)),
    b: Math.round(b * (1 - amount))
  });
}

function mixHex(baseHex: string, mixHexValue: string, mixRatio: number) {
  const base = hexToRgb(baseHex);
  const mix = hexToRgb(mixHexValue);

  return rgbToHex({
    r: Math.round(base.r * (1 - mixRatio) + mix.r * mixRatio),
    g: Math.round(base.g * (1 - mixRatio) + mix.g * mixRatio),
    b: Math.round(base.b * (1 - mixRatio) + mix.b * mixRatio)
  });
}

function hexToRgb(hex: string) {
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16)
  };
}

function rgbToHex(rgb: { r: number; g: number; b: number }) {
  return `#${[rgb.r, rgb.g, rgb.b]
    .map((value) => Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0"))
    .join("")}`;
}
