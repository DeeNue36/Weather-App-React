const BASE_WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast?';

const BASE_CITY_API_URL = 'https://geocoding-api.open-meteo.com/v1/search?';

const REVERSE_GEOCODING_API_URL = 'https://nominatim.openstreetmap.org/reverse?';

// BDC API endpoints
const BDC_REVERSE_GEOCODING_API_URL = 'https://api-bdc.net/data/reverse-geocode?';

const BDC_API_KEY = import.meta.env.VITE_BDC_API_KEY;


export { BASE_WEATHER_API_URL, BASE_CITY_API_URL, REVERSE_GEOCODING_API_URL,  BDC_REVERSE_GEOCODING_API_URL, BDC_API_KEY };


// Alternative API endpoints

// const BASE_CITY_API_URL = https://geocoding-api.open-meteo.com/v1/search?name=

// const REVERSE_GEOCODING_API_URL = 'https://nominatim.openstreetmap.org/reverse?';