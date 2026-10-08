export interface WeatherLocation {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  condition: string;
  weatherCode: number;
  isDay: boolean;
  humidity: number;
  windSpeed: number;
  windGusts: number;
  pressure: number;
  visibilityKm: number;
  uvIndex: number;
  dewPoint: number;
  airQualityAqi?: number;
  highTemp: number;
  lowTemp: number;
}

export interface HourlyForecastItem {
  time: string;
  temperature: number;
  weatherCode: number;
  condition: string;
  precipitationProbability: number;
  isDay: boolean;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  weatherCode: number;
  condition: string;
  highTemp: number;
  lowTemp: number;
}

export interface WeatherData {
  location: WeatherLocation;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  sunrise: string;
  sunset: string;
  lastUpdated: string;
}
