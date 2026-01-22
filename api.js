const API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m,precipitation,rain,relative_humidity_2m,apparent_temperature,snowfall,is_day,wind_speed_10m&models=best_match,gfs_seamless&current=temperature_2m,is_day,apparent_temperature,relative_humidity_2m,snowfall,showers,rain,wind_speed_10m,precipitation&minutely_15=is_day,wind_speed_10m,temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,snowfall&timezone=auto';

const BASE_CITY_API_URL = 'https://geocoding-api.open-meteo.com/v1/search?';
// https://geocoding-api.open-meteo.com/v1/search?name=

const BASE_WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast?';


export { BASE_CITY_API_URL, BASE_WEATHER_API_URL };