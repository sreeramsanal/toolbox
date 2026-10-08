import type { WeatherData, WeatherLocation } from '../types/weather';

const WEATHER_CACHE_KEY = 'toolbox_weather_last_cache';

const WMO_CODES: Record<number, { day: string; night: string }> = {
  0: { day: 'Clear Sky', night: 'Clear Night' },
  1: { day: 'Mainly Clear', night: 'Mainly Clear' },
  2: { day: 'Partly Cloudy', night: 'Partly Cloudy' },
  3: { day: 'Overcast', night: 'Overcast' },
  45: { day: 'Foggy', night: 'Foggy' },
  48: { day: 'Depositing Rime Fog', night: 'Depositing Rime Fog' },
  51: { day: 'Light Drizzle', night: 'Light Drizzle' },
  53: { day: 'Moderate Drizzle', night: 'Moderate Drizzle' },
  55: { day: 'Dense Drizzle', night: 'Dense Drizzle' },
  61: { day: 'Slight Rain', night: 'Slight Rain' },
  63: { day: 'Moderate Rain', night: 'Moderate Rain' },
  65: { day: 'Heavy Rain', night: 'Heavy Rain' },
  71: { day: 'Slight Snow', night: 'Slight Snow' },
  73: { day: 'Moderate Snow', night: 'Moderate Snow' },
  75: { day: 'Heavy Snow', night: 'Heavy Snow' },
  77: { day: 'Snow Grains', night: 'Snow Grains' },
  80: { day: 'Slight Showers', night: 'Slight Showers' },
  81: { day: 'Moderate Showers', night: 'Moderate Showers' },
  82: { day: 'Violent Showers', night: 'Violent Showers' },
  85: { day: 'Slight Snow Showers', night: 'Slight Snow Showers' },
  86: { day: 'Heavy Snow Showers', night: 'Heavy Snow Showers' },
  95: { day: 'Thunderstorm', night: 'Thunderstorm' },
  96: { day: 'Thunderstorm with Hail', night: 'Thunderstorm with Hail' },
  99: { day: 'Thunderstorm with Heavy Hail', night: 'Thunderstorm with Heavy Hail' },
};

export const getWeatherCondition = (code: number, isDay = true): string => {
  const item = WMO_CODES[code];
  if (!item) return 'Partly Cloudy';
  return isDay ? item.day : item.night;
};

export async function searchCities(query: string): Promise<WeatherLocation[]> {
  if (!query || query.trim().length < 2) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=6&language=en&format=json`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to search locations');
  }
  const data = await response.json();
  if (!data.results || !Array.isArray(data.results)) {
    return [];
  }
  return data.results.map((r: { name: string; country?: string; admin1?: string; latitude: number; longitude: number; timezone?: string }) => ({
    name: r.admin1 ? `${r.name}, ${r.admin1}` : r.name,
    country: r.country || '',
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone || 'auto',
  }));
}

export async function fetchWeather(location: WeatherLocation): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,surface_pressure,wind_speed_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Weather API request failed');
  }

  const data = await response.json();
  const current = data.current;
  const daily = data.daily;
  const hourly = data.hourly;

  const currentHourIdx = new Date().getHours();
  const hourlySlice: WeatherData['hourly'] = [];
  for (let i = currentHourIdx; i < currentHourIdx + 6; i++) {
    if (hourly?.time?.[i]) {
      const timeStr = new Date(hourly.time[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      hourlySlice.push({
        time: timeStr,
        temperature: Math.round(hourly.temperature_2m?.[i] ?? 0),
        weatherCode: hourly.weather_code?.[i] ?? 0,
        condition: getWeatherCondition(hourly.weather_code?.[i] ?? 0, hourly.is_day?.[i] === 1),
        precipitationProbability: hourly.precipitation_probability?.[i] ?? 0,
        isDay: hourly.is_day?.[i] === 1,
      });
    }
  }

  const dailySlice: WeatherData['daily'] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const totalDays = Math.min(5, daily?.time?.length || 0);

  for (let i = 0; i < totalDays; i++) {
    const dateObj = new Date(daily.time[i]);
    const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[dateObj.getDay()];
    dailySlice.push({
      date: daily.time[i],
      dayName: dayLabel,
      weatherCode: daily.weather_code?.[i] ?? 0,
      condition: getWeatherCondition(daily.weather_code?.[i] ?? 0, true),
      highTemp: Math.round(daily.temperature_2m_max?.[i] ?? 0),
      lowTemp: Math.round(daily.temperature_2m_min?.[i] ?? 0),
    });
  }

  const result: WeatherData = {
    location,
    current: {
      temperature: Math.round(current.temperature_2m ?? 0),
      feelsLike: Math.round(current.apparent_temperature ?? 0),
      condition: getWeatherCondition(current.weather_code ?? 0, current.is_day === 1),
      weatherCode: current.weather_code ?? 0,
      isDay: current.is_day === 1,
      humidity: Math.round(current.relative_humidity_2m ?? 0),
      windSpeed: Math.round(current.wind_speed_10m ?? 0),
      windGusts: Math.round(current.wind_gusts_10m ?? 0),
      pressure: Math.round(current.surface_pressure ?? 1013),
      visibilityKm: 10,
      uvIndex: Math.round(daily?.uv_index_max?.[0] ?? 5),
      dewPoint: Math.round((current.temperature_2m ?? 0) - ((100 - (current.relative_humidity_2m ?? 50)) / 5)),
      highTemp: Math.round(daily?.temperature_2m_max?.[0] ?? (current.temperature_2m + 4)),
      lowTemp: Math.round(daily?.temperature_2m_min?.[0] ?? (current.temperature_2m - 4)),
    },
    hourly: hourlySlice,
    daily: dailySlice,
    sunrise: daily?.sunrise?.[0] ? new Date(daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:30 AM',
    sunset: daily?.sunset?.[0] ? new Date(daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:30 PM',
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  try {
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(result));
  } catch {
    // ignore
  }

  return result;
}

export function getCachedWeather(): WeatherData | null {
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}
