export function formatTempC(value, { digits = 1 } = {}) {
    if (value == null || Number.isNaN(Number(value))) return "—";
    const n = Number(value);
    return `${n.toFixed(digits)}°C`;
  }
  