import React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { Search } from './Search';
import { Spinner } from './Spinner';
import { BASE_CITY_API_URL, REVERSE_GEOCODING_API_URL, BASE_WEATHER_API_URL, BDC_API_KEY, BDC_REVERSE_GEOCODING_API_URL } from '../api';
import { weatherIcons } from '../weatherIcons';
import { weatherDescriptions } from '../weatherDescriptions';
import { useDebounce } from 'react-use';

export const WeatherData = () => {
    const [searchCity, setSearchCity] = useState('');
    const [weather, setWeather] = useState({});
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedSearchCity, setDebouncedSearchCity] = useState('');

    useDebounce(() => {
        setDebouncedSearchCity(searchCity);
    }, 1000, [searchCity]);


    //A. Get the user's location coordinates using the browser
    const getUserLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                }
            );
        });
    };

    //B. Get the city/location name and country from user's coordinates using reverse geocoding
    const getCityFromCoords = async (lat, lon) => {
        try {
            const bdc_endpoint = `${BDC_REVERSE_GEOCODING_API_URL}latitude=${lat}&longitude=${lon}&localityLanguage=en&key=${BDC_API_KEY}`; // Big Data Cloud reverse geocode API

            // Alternatives
            // const endpoint = `${REVERSE_GEOCODING_API_URL}lat=${lat}&lon=${lon}&format=json`;
            // const bdc_endpoint = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;

            let bdc_response = await fetch(bdc_endpoint);

            if (!bdc_response.ok) {
                console.log('Main API call failed, temporarily switching to free reverse-geocoding-client API');
                const free_bdc_endpoint = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
                bdc_response = await fetch(free_bdc_endpoint);
            }
            if (!bdc_response.ok) {
                throw new Error('Failed to fetch city from coordinates');
            }
    
            const bdc_data = await bdc_response.json();
            console.log(bdc_data);
            return {
                cityName: bdc_data.locality || bdc_data.city || bdc_data.principalSubdivision || 'Unknown Location',
                country: bdc_data.countryName || '',
            };
        } 
        catch (error) {
            console.error('Error fetching city from coordinates:', error);
            return { cityName: 'Unknown Location', country: '' };
        }
    };


    const fetchWeatherData = useCallback( async(query='', coords = null) => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            let latitude, longitude, name, country;

            // a. Get the user's location which will be displayed as the initial city/location
            if(coords) {
                //Use provided coordinates (from geolocation)
                latitude = coords.latitude;
                longitude = coords.longitude;

                // Get city name from coordinates via reverse geocoding
                const cityInfo = await getCityFromCoords(latitude, longitude);
                name = cityInfo.cityName;
                country = cityInfo.country;
            }
            //b. Get the city name from the search query
            else {
                //b(i). Use the search query to get location/city
                const endpoint = `${BASE_CITY_API_URL}name=${encodeURIComponent(query)}&count=2`;
    
                const cityResponse = await fetch(endpoint);
                if(!cityResponse.ok) {
                    throw new Error('Failed to fetch city data');
                }
    
                const cityData = await cityResponse.json();
                console.log(cityData);
    
                if(!cityData.results || cityData.results.length === 0) {
                    throw new Error('City not found');
                }
    
                const city = cityData.results[0];
                latitude = city.latitude;
                longitude = city.longitude;
                name = city.name;
                country = city.country;
            }

            //c. Get the weather data for the city
            const weatherDataEndpoint = `${BASE_WEATHER_API_URL}latitude=${latitude}&longitude=${longitude}&current=is_day,apparent_temperature,relative_humidity_2m,temperature_2m,snowfall,showers,rain,precipitation,wind_speed_10m,weather_code&timezone=auto`; //OR &current_weather=true

            const weatherResponse = await fetch(weatherDataEndpoint);
            if(!weatherResponse.ok) {
                throw new Error('Failed to fetch weather data');
            }

            const weatherData = await weatherResponse.json();
            console.log(weatherData);
            if (!weatherData.current) {
                setErrorMessage('No weather data found for this location.');
                setIsLoading(false);
                setWeather({});
                return;
            }

            setWeather({
                city: name,
                country: country,
                dateTime: weatherData.current.time,
                weatherCode: weatherData.current.weather_code,
                isDay: weatherData.current.is_day,
                temperature: weatherData.current.temperature_2m,
                feelsLike: weatherData.current.apparent_temperature,
                humidity: weatherData.current.relative_humidity_2m,
                windSpeed: weatherData.current.wind_speed_10m,
                precipitation: weatherData.current.precipitation,
                snowfall: weatherData.current.snowfall,
                rain: weatherData.current.rain,
                showers: weatherData.current.showers
            });
            
        }
        catch (error) {
            console.error(`Error fetching weather data: ${error}`);
            setErrorMessage(error.message);
        }
        finally {
            setIsLoading(false);
        }
    }, []);

    //d. Format for rendering time
    const formatDate = (timeString) => {
        const date = new Date(timeString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    useEffect(() => {
        const initialWeather = async () => {
            if (weather.city) return;
            try {
                const coords = await getUserLocation();
                fetchWeatherData('', coords);
            }
            catch(error) {
                console.log('Geolocation Failed, using fallback Location');
                // Show message to the User
                setErrorMessage('Could not access/understand your location. Showing weather for Houston');
                // Clear error after a few seconds
                setTimeout(() => setErrorMessage(''), 5000);
                console.error('Could not get user location:', error);
                //Fallback Location
                fetchWeatherData('Houston');
            }
        };
        initialWeather();
    }, [fetchWeatherData, weather.city]);


    useEffect(() => {
        // Only fetch if there's a search query
        if (debouncedSearchCity) {
            fetchWeatherData(debouncedSearchCity);
        }
    }, [fetchWeatherData, debouncedSearchCity]);


    return (
        <>
            <h1>How's the sky looking today?</h1>
            <Search searchCity={searchCity} setSearchCity={setSearchCity} isLoading={isLoading} fetchWeatherData={fetchWeatherData}/>

            {isLoading && <Spinner />}
            {errorMessage && <p className='text-red-500'>{errorMessage}</p>}
            
            <div className='weather-box'>
                <div className="weather-daily">
                    <div className="location-weather">
                        <div className="city-and-date">
                            <h5 className="location">
                                {/* Display user's location as fallback if search query is empty */}
                                {weather.city}, {weather.country}
                            </h5>
                            <p className="date">
                                {formatDate(weather.dateTime)}
                            </p>
                        </div>
                        <div className="condition-and-temperature">
                            <div className="condition">
                                {weather.weatherCode !== undefined && (
                                    <img 
                                        src={weatherIcons[weather.weatherCode] || 'icon-sunny.webp'} 
                                        alt={weatherDescriptions(weather.weatherCode)}
                                        className="weather-icon" 
                                    />
                                )} 
                            </div>
                            <div className="temperature">
                                {weather.temperature}°
                            </div>
                        </div>
                    </div>
                    <div className="location-weather-details">
                        <div className="feels-like">
                        </div>
                        <div className="humidity">
                        </div>
                        <div className="wind-speed">
                        </div>
                        <div className="precipitation">
                        </div>
                    </div>
                    <div className="location-daily-forecast">
                        <p>Daily Forecast</p>
                        <div className="days-forecast">
                            <div className="days-data">
                            </div>
                        </div>
                    </div>
                </div>
                <div className="weather-hourly">
                    <div className="location-hourly-forecast">
                    </div>
                </div>
            </div>
        </>
    )
}


// {isLoading ? 
//                 (<Spinner />) : 
//                     errorMessage ? 
//                 (<p className='text-red-500'>{errorMessage}</p>) :
//                 (
//                     <div className='weather-box'>
//                         <div className="weather-daily">
//                             <div className="location-weather">
                    
//                             </div>
//                             <div className="location-weather-details">
//                                 <div className="feels-like">
//                                 </div>
//                                 <div className="humidity">
//                                 </div>
//                                 <div className="wind-speed">
//                                 </div>
//                                 <div className="precipitation">
//                                 </div>
//                             </div>
//                             <div className="location-daily-forecast">
//                                 <p>Daily Forecast</p>
//                                 <div className="days-forecast">
//                                     <div className="days-data">
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="weather-hourly">
//                             <div className="location-hourly-forecast">
//                             </div>
//                         </div>
//                     </div>
//                 )}



// const response = await fetch(endpoint, {
//     headers: {
//         'User-Agent': 'Weather App'
//     }
// });
// if (!response.ok) {
//     throw new Error('Failed to fetch city from coordinates');
// }

// const data = await response.json();
// if (data.address) {
//     const userLocation = data.address;
//     return {
//         cityName: userLocation.city || userLocation.town || userLocation.village || userLocation.county,
//         country: data.address.country
//     }
// };
