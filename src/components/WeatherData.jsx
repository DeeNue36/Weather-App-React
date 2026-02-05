import React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { Search } from './Search';
import { Spinner } from './Spinner';
import { BASE_CITY_API_URL, BASE_WEATHER_API_URL, BDC_API_KEY, BDC_REVERSE_GEOCODING_API_URL } from '../api';
import { weatherIcons } from '../weatherIcons';
import { weatherDescriptions } from '../weatherDescriptions';
import { DailyForecasts } from './DailyForecasts';
import { DaysDropdown } from './DaysDropdown';
import { useDebounce } from 'react-use';


//e. Conversion functions
//e(i) Temperature Conversion
const convertTemperature = (temp, unit) => {
    if (unit === 'fahrenheit') {
        return Math.round((temp * 9/5) + 32)
    }
    return Math.round(temp);
};

//e(ii) Wind Speed Conversion
const convertWindSpeed = (speed, unit) => {
    if (unit === 'mph') {
        return (speed * 0.621371).toFixed(1);
    }
    return speed;
};

//e(iii) Precipitation Conversion
const convertPrecipitation = (precipitation, unit) => {
    if (unit === 'in') {
        return (precipitation / 25.4).toFixed(2);
    }
    return precipitation;
};

export const WeatherData = ({ units }) => {
    const [searchCity, setSearchCity] = useState('');
    const [weather, setWeather] = useState({});
    const [dailyForecast, setDailyForecast] = useState([]);
    const [hourlyForecast, setHourlyForecast] = useState([]);
    const [selectedDay, setSelectedDay] = useState(dailyForecast[0]?.date || '');
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
            const weatherDataEndpoint = `${BASE_WEATHER_API_URL}latitude=${latitude}&longitude=${longitude}&forecast_days=7&daily=temperature_2m_min,temperature_2m_max,weather_code&hourly=,weather_code,temperature_2m&current=is_day,apparent_temperature,relative_humidity_2m,temperature_2m,snowfall,showers,rain,precipitation,wind_speed_10m,weather_code&timezone=auto`; //OR &current_weather=true

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

            // Set the weather data
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
                showers: weatherData.current.showers,
                // units
                temperatureUnit: weatherData.current_units.temperature_2m.slice(0, 1),
                windSpeedUnit: weatherData.current_units.wind_speed_10m,
                precipitationUnit: weatherData.current_units.precipitation,
                humidityUnit: weatherData.current_units.relative_humidity_2m
            });

            //d. Get daily and hourly forecasts
            //d(i). Get daily forecast from weatherData
            const getDailyForecast = weatherData.daily.time.map((time, index) => ({
                date: formatDailyForecastDate(time), // "Wed", "Thu" etc - displayed in the daily forecast section, also used for filtering the hourly forecast for the selected day
                longDate: formatWeekday(time), // "Wednesday" or "Thursday" etc - for displaying in the hourly section
                minTemp: weatherData.daily.temperature_2m_min[index],
                maxTemp: weatherData.daily.temperature_2m_max[index],
                weatherCode: weatherData.daily.weather_code[index]
            }));
            console.log(getDailyForecast);

            //d(ii). Get hourly forecast from weatherData
            const getHourlyForecast = weatherData.hourly.time.map((time, index) => ({
                day: formatWeekday(time), // "Wednesday" or "Thursday"
                shortDay: formatDailyForecastDate(time), // "Wed" or "Thu" etc - for matching with the daily forecast date to filter the hourly forecast for the selected day
                time: formatHourlyForecastTime(time),
                temperature: weatherData.hourly.temperature_2m[index],
                weatherCode: weatherData.hourly.weather_code[index]
            }));
            console.log(getHourlyForecast);

            setDailyForecast(getDailyForecast);
            setHourlyForecast(getHourlyForecast);

            // Auto select the first day for the hourly forecast when the weather data is fetched
            if (getHourlyForecast.length > 0) {
                setSelectedDay(getHourlyForecast[0].shortDay); // "Wed" 
            }
            
        }
        catch (error) {
            console.error(`Error fetching weather data: ${error}`);
            setErrorMessage(error.message);
        }
        finally {
            setIsLoading(false);
        }
    }, []);


    //f. Date and Time Formatting

    // f(i). Date Formatting for City/Location
    const formatDate = (timeString) => {
        const date = new Date(timeString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // f(ii). Date Formatting for Daily Forecast
    const formatDailyForecastDate = (timeString) => {
        const date = new Date(timeString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
        });
    };

    //f(iii). Date and Time Formatting for Hourly Forecast
    const formatWeekday = (timeString) => {
        const date = new Date(timeString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
        });
    };

    const formatHourlyForecastTime = (timeString) => {
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true,
            ampm: true
        });
    };

    //g. Final Render to get User Location and display weather data
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


    // h. Handle Day Selection - useEffect that sets hourlyForecast to also set selectedDay:
    useEffect(() => {
        if (hourlyForecast.length > 0 && !selectedDay) {
            setSelectedDay(hourlyForecast[0].day);
        }
    }, [hourlyForecast, selectedDay]);

    //i. Get filtered hourly forecast for selected day
    const getFilteredHourlyForecast = () => {
        if (!selectedDay || hourlyForecast.length === 0) return hourlyForecast;

        return hourlyForecast.filter(forecast => forecast.shortDay === selectedDay);
    }


    useEffect(() => {
        // Only fetch if there's a search query
        if (debouncedSearchCity) {
            fetchWeatherData(debouncedSearchCity);
        }
    }, [fetchWeatherData, debouncedSearchCity]);


    //j. Calculate display values using the conversion functions
    // Calculated on every render based on the units prop
    const displayTemperature = convertTemperature(weather.temperature || 0, units.temperature);
    const displayFeelsLike = convertTemperature(weather.feelsLike || 0, units.temperature);
    const displayWindSpeed = convertWindSpeed(weather.wind || 0, units.wind);
    const displayPrecipitation = convertPrecipitation(weather.precipitation || 0, units.precipitation);

    //k. Convert daily and hourly temperatures
    const convertDailyMinTemp = (temp) => convertTemperature(temp, units.temperature);
    const convertDailyMaxTemp = (temp) => convertTemperature(temp, units.temperature);
    const convertHourlyTemp = (temp) => convertTemperature(temp, units.temperature);


    return (
        <>
            <h1>How's the sky looking today?</h1>
            <Search searchCity={searchCity} setSearchCity={setSearchCity} isLoading={isLoading} fetchWeatherData={fetchWeatherData}/>

            {isLoading && <Spinner />}
            {errorMessage && <p className='text-red-500'>{errorMessage}</p>}
            
            <div className='weather-box'>
                <div className="weather-daily">

                    {/* TODO: Turn this into a component */}
                    <div className="location-weather">
                        <div className="city-and-date">
                            <h4 className="location">
                                {/* Display user's location as fallback if search query is empty */}
                                {weather.city || 'Loading City...'}, {weather.country || 'Loading Country...'}
                            </h4>
                            <span className="date">
                                {weather.dateTime ? formatDate(weather.dateTime) : 'Loading Date...'}
                            </span>
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
                                <h1>
                                    {displayTemperature}{weather.temperatureUnit}
                                </h1>
                            </div>
                        </div>
                    </div>

                    {/* TODO: Turn this into a component */}
                    <div className="location-weather-details">
                        <div className="feels-like">
                            <p>Feels Like</p>
                            <span>
                                {displayFeelsLike}{weather.temperatureUnit}
                            </span>
                        </div>
                        <div className="humidity">
                            <p>Humidity</p>
                            <span>
                                {weather.humidity}{weather.humidityUnit}
                            </span>
                        </div>
                        <div className="wind-speed">
                            <p>Wind Speed</p>
                            <span>
                                {displayWindSpeed} {weather.windSpeedUnit}
                            </span>
                        </div>
                        <div className="precipitation">
                            <p>Precipitation</p>
                            <span>
                                {displayPrecipitation} {weather.precipitationUnit}
                            </span>
                        </div>
                    </div>

                    <DailyForecasts 
                        dailyForecasts={dailyForecast}
                        weatherIcons={weatherIcons}
                        weatherDescriptions={weatherDescriptions}
                        weatherUnit={weather.temperatureUnit}
                        convertMinTemp={convertDailyMinTemp}
                        convertMaxTemp={convertDailyMaxTemp} 
                    />
                </div>

                <div className="weather-hourly">
                    <div className="location-hourly-forecast">
                        <div className="weekday-hourly-forecast">
                            <p>Hourly Forecast</p>
                            {/* <select 
                                value={selectedDay}
                                onChange={(e) => setSelectedDay(e.target.value)}
                                id='weekday-dropdown'
                                className="select-weekday"
                            >
                                {dailyForecast.map((day, index) => {
                                    return (
                                        <option key={index} value={day.date}>
                                            {day.longDate}
                                        </option>
                                    )
                                })}
                            </select> */}
                            <DaysDropdown 
                                // Display the selected day in long date format
                                selected={dailyForecast.find(day => day.date === selectedDay)?.longDate || 'Select day'} 
                                options={dailyForecast}
                                onChange={(day) => setSelectedDay(day.date)}
                            />
                        </div>
                        <div className="hourly-weather-forecast">
                            {getFilteredHourlyForecast().map((hour, index) => {
                                return (
                                    <div className="weather-hour-card" key={index}>
                                        <div className="hour">
                                            { hour.weatherCode !== undefined && (
                                                <img
                                                    src={weatherIcons[hour.weatherCode] || 'icon-sunny.webp'}
                                                    alt={weatherDescriptions(hour.weatherCode)}
                                                    className='hourly-weather-icon'
                                                />
                                            )}
                                            <span className="time">
                                                {hour.time}
                                            </span>
                                        </div>
                                        <span className="hour-temp">
                                            {convertHourlyTemp(hour.temperature)}{weather.temperatureUnit}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
