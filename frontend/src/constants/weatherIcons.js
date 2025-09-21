// Map weather codes/labels to an icon key.
// Works with WMO/Open-Meteo style codes (0..99) or a text label.
const WMO_GROUPS = [
    { match: c => c === 0,               key: "clear" },
    { match: c => c === 1 || c === 2,    key: "partly-cloudy" },
    { match: c => c === 3,               key: "overcast" },
    { match: c => c === 45 || c === 48,  key: "fog" },
    { match: c => c >= 51 && c <= 57,    key: "drizzle" },
    { match: c => c >= 61 && c <= 67,    key: "rain" },
    { match: c => c >= 71 && c <= 77,    key: "snow" },
    { match: c => c >= 80 && c <= 82,    key: "rain" },       // showers
    { match: c => c >= 85 && c <= 86,    key: "snow" },       // snow showers
    { match: c => c === 95,              key: "thunder" },
    { match: c => c === 96 || c === 99,  key: "thunder-rain" },
  ];
  
  function keyFromCode(code) {
    const n = Number(code);
    const hit = WMO_GROUPS.find(g => g.match(n));
    return hit?.key || "unknown";
  }
  function keyFromLabel(label = "") {
    const s = label.toLowerCase();
    if (s.includes("thunder")) return "thunder";
    if (s.includes("rain") || s.includes("shower")) return "rain";
    if (s.includes("drizzle")) return "drizzle";
    if (s.includes("snow")) return "snow";
    if (s.includes("fog") || s.includes("mist")) return "fog";
    if (s.includes("overcast")) return "overcast";
    if (s.includes("cloud")) return "partly-cloudy";
    if (s.includes("clear") || s.includes("sun")) return "clear";
    return "unknown";
  }
  
  // Simple emoji set 
  const EMOJI = {
    "clear": "☀️",
    "partly-cloudy": "⛅️",
    "overcast": "☁️",
    "rain": "🌧️",
    "drizzle": "🌦️",
    "snow": "🌨️",
    "fog": "🌫️",
    "thunder": "⛈️",
    "thunder-rain": "⛈️",
    "unknown": "❓",
  };
  
  export function weatherIconHTML(weather) {
    const key = weather?.code != null ? keyFromCode(weather.code) : keyFromLabel(weather?.label);
    const emoji = EMOJI[key] || EMOJI.unknown;
    const title = weather?.label || key.replace("-", " ");
    return `<span class="wx-ico" title="${title}">${emoji}</span>`;
  }
  