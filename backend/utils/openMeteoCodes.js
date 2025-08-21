const WMO_TEXT = {
  0: "Clear", 
  1: "Mainly clear", 
  2: "Partly cloudy", 
  3: "Overcast",
  45: "Fog", 
  48: "Depositing rime fog",
  51: "Light drizzle", 
  53: "Moderate drizzle", 
  55: "Dense drizzle",
  56: "Freezing drizzle: light", 
  57: "Freezing drizzle: dense",
  61: "Slight rain", 
  63: "Moderate rain", 
  65: "Heavy rain",
  66: "Freezing rain: light", 
  67: "Freezing rain: heavy",
  71: "Slight snow", 
  73: "Moderate snow", 
  75: "Heavy snow", 
  77: "Snow grains",
  80: "Rain showers: slight", 
  81: "Rain showers: moderate", 
  82: "Rain showers: violent",
  85: "Snow showers: slight", 
  86: "Snow showers: heavy",
  95: "Thunderstorm: slight or moderate", 
  96: "Thunderstorm with slight hail", 
  99: "Thunderstorm with heavy hail"
};

const BUCKETS = {
  sunny: new Set([0, 1]),
  clear: new Set([0, 1]),
  cloudy: new Set([2, 3]),
  fog: new Set([45, 48]),
  rain: new Set([51, 53, 55, 61, 63, 65, 80, 81, 82]),
  snow: new Set([71, 73, 75, 77, 85, 86]),
  storm: new Set([95, 96, 99])
};

module.exports = { WMO_TEXT, BUCKETS };
