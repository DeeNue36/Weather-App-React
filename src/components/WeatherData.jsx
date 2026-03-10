import { useState, useEffect, useCallback } from 'react'
import { BASE_CITY_API_URL, BASE_WEATHER_API_URL, BDC_API_KEY, BDC_REVERSE_GEOCODING_API_URL } from '../api';
import { useUnits } from '../context/UnitsContext';
import { Search } from './Search';
import { Skeleton } from './Skeleton';
import { weatherIcons } from '../weatherIcons';
import { weatherDescriptions } from '../weatherDescriptions';
import { DailyForecasts } from './DailyForecasts';
import { DaysDropdown } from './DaysDropdown';
import { ApiError } from './ApiError';
import { formatDate, 
        formatDailyForecastDate, 
        formatWeekday, 
        formatHourlyForecastTime } 
from '../utilities/dateFormatting';
import { convertTemperature, 
        convertWindSpeed, 
        convertPrecipitation } 
from '../utilities/unitConversions';


export const WeatherData = () => {
    const { units } = useUnits(); // Get the user's preferred units from context

    //* State for tracking the city name entered in the search input
    const [searchCity, setSearchCity] = useState('');

    //* State for weather data
    const [weather, setWeather] = useState({});

    //* State for daily and hourly forecasts
    const [dailyForecast, setDailyForecast] = useState([]);
    const [hourlyForecast, setHourlyForecast] = useState([]);

    //* State for selected day in the hourly forecast section, default to the first day of the daily forecast if available
    const [selectedDay, setSelectedDay] = useState(dailyForecast[0]?.date || '');

    //* State for error handling
    const [errorMessage, setErrorMessage] = useState('');

    //* State to track loading status of the weather data
    const [isLoading, setIsLoading] = useState(false);

    //* State to track if there was an API error to conditionally render the API error component
    const [apiError, setApiError] = useState(false);

    //* State to track the last query and coordinates used for fetching weather data, to allow retrying the same query in case of an API error
    const [lastQuery, setLastQuery] = useState('');
    const [lastCoords, setLastCoords] = useState(null);

    //* State to track if the app is waiting for the user to select a city from the suggestions dropdown
    const [awaitingSelection, setAwaitingSelection] = useState(false); 


    //? A. Get the user's location coordinates using the browser
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


    //? B. Get the city/location name and country from user's coordinates using reverse geocoding
    const getCityFromCoords = async (lat, lon) => {
        try {
            //* Big Data Cloud reverse geocode API
            const bdc_endpoint = `${BDC_REVERSE_GEOCODING_API_URL}latitude=${lat}&longitude=${lon}&localityLanguage=en&key=${BDC_API_KEY}`; 

            //* Alternatives
            // const endpoint = `${REVERSE_GEOCODING_API_URL}lat=${lat}&lon=${lon}&format=json`;
            // const bdc_endpoint = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;

            const FALLBACK_GEOCODING_ENDPOINT = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;

            let bdc_response = await fetch(bdc_endpoint);

            //* If the main API call fails, try the fallback
            if (!bdc_response.ok) {
                console.log('Main API call failed, temporarily switching to free reverse-geocoding-client API');
                bdc_response = await fetch(FALLBACK_GEOCODING_ENDPOINT);
            }

            //* If the fallback API call also fails, throw an error
            if (!bdc_response.ok) {
                throw new Error('Failed to fetch city from coordinates');
            }
    
            const bdc_data = await bdc_response.json();
            console.log(bdc_data);
            return {
                // culprit for different city name when a city is selected from the dropdown -- locality
                cityName: bdc_data.city || bdc_data.locality || bdc_data.principalSubdivision || 'Unknown Location',
                country: bdc_data.countryName || '',
            };
        } 
        catch (error) {
            console.error('Error fetching city from coordinates:', error);
            return { cityName: 'Unknown Location', country: '' };
        }
    };


    // ? C. Fetch weather data
    const fetchWeatherData = useCallback( async(query='', coords = null) => {
        setAwaitingSelection(false); // Reset awaitingSelection state whenever a new search is initiated
        setIsLoading(true);
        setErrorMessage('');
        setApiError(false);
        setLastQuery(query);
        setLastCoords(coords);

        try {
            //* Make the latitude, longitude, name, and country variables globally available to the rest of the try function block
            let latitude, longitude, name, country;

            //? a. Get the user's location which will be displayed as the initial city/location
            if(coords) {
                //* Use provided coordinates (from geolocation)
                latitude = coords.latitude;
                longitude = coords.longitude;

                //* Check is query is an object from the city suggestions dropdown and has a name property
                if (query && typeof query === 'object' && query.name) {
                    //? if available directly use the city name and country from the query object  (when a city suggestion is clicked)
                    name = query.name;
                    country = query.country || '';
                }
                else {
                    //* From coordinates use reverse geocoding to get the city name and country
                    const cityInfo = await getCityFromCoords(latitude, longitude);
                    name = cityInfo.cityName;
                    country = cityInfo.country;
                }

            }
            //? b. Get the city name from the search query
            else {

                //? b(i) When a city suggestion is clicked, check if query is an object and has a name property
                if (query && typeof query === 'object' && query.name) {
                    //? if available directly use the city name and country from the query object  (when a city suggestion is clicked)
                    latitude = query.latitude;
                    longitude = query.longitude;
                    name = query.name;
                    country = query.country || '';
                }
                else {
                    //? b(ii). Use the search query to get location/city
                    const endpoint = `${BASE_CITY_API_URL}name=${encodeURIComponent(query)}`;
        
                    const cityResponse = await fetch(endpoint);
                    if(!cityResponse.ok) {
                        throw new Error('Failed to fetch city data');
                    }
        
                    const cityData = await cityResponse.json();
                    console.log(cityData);
        
                    if(!cityData.results || cityData.results.length === 0) {
                        throw new Error('City not found');
                    }
        
                    const city = cityData.results[0]
                    latitude = city.latitude;
                    longitude = city.longitude;
                    name = city.name;
                    country = city.country;
                }
            }

            //? c. Get the weather data for the city
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

            //* Set the weather data
            setWeather({
                city: name,
                country: country,
                // current weather
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
                // weather units
                temperatureUnit: weatherData.current_units.temperature_2m.slice(0, 1),
                windSpeedUnit: weatherData.current_units.wind_speed_10m,
                precipitationUnit: weatherData.current_units.precipitation,
                humidityUnit: weatherData.current_units.relative_humidity_2m
            });


            //? D. Get daily and hourly forecasts
            //* d(i). Get daily forecast from weatherData
            const getDailyForecast = weatherData.daily.time.map((time, index) => ({
                date: formatDailyForecastDate(time), // "Wed", "Thu" etc - displayed in the daily forecast section, also used for filtering the hourly forecast for the selected day
                longDate: formatWeekday(time), // "Wednesday" or "Thursday" etc - for displaying in the hourly section
                minTemp: weatherData.daily.temperature_2m_min[index],
                maxTemp: weatherData.daily.temperature_2m_max[index],
                weatherCode: weatherData.daily.weather_code[index]
            }));
            console.log(getDailyForecast);

            //* d(ii). Get hourly forecast from weatherData
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

            //* Auto select the current day and set the selectedDay state when the weather data is fetched
            if (getHourlyForecast.length > 0) {
                setSelectedDay(getHourlyForecast[0].shortDay); // "Wed" 
                //OR setSelectedDay(getDailyForecast[0].date); 
            }
            
        }
        catch (error) {
            console.error(`Error fetching weather data: ${error}`);
            setErrorMessage(error.message);
            setApiError(true);
        }
        finally {
            setIsLoading(false);
        }
    }, []);

    //? g. First Render to get User Location and display weather data
    useEffect(() => {
        const initialWeather = async () => {
            if (weather.city) return;

            try {
                // Call getUserLocation to get users location coordinates
                const coords = await getUserLocation(); 
                // pass coords to fetchWeatherData function to get the users location weather
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


    //? h. Handle Day Selection - auto select the current day
    useEffect(() => {
        if (hourlyForecast.length > 0 && !selectedDay) {
            //* set selectedDay to the first(current) day of the hourly forecast when no day is selected by the user
            setSelectedDay(hourlyForecast[0].day);
        }
    }, [hourlyForecast, selectedDay]);

    //? i. Reset awaitingSelection flag state when an error occurs or the search input is cleared
    useEffect(() => {
        if (errorMessage || searchCity.trim() === '') {
            // Reset awaitingSelection state when an error occurs
            setAwaitingSelection(false); 
        }
    }, [errorMessage, searchCity]);

    //? j. Get filtered hourly forecast for any selected day
    const getFilteredHourlyForecast = () => {
        if (!selectedDay || hourlyForecast.length === 0) return hourlyForecast;

        //* Filter the hourly forecast based on the selected day
        return hourlyForecast.filter(forecast => forecast.shortDay === selectedDay);
    }


    //? k. Calculate display values using the conversion functions
    //* Calculated on every render based on the units prop
    const displayTemperature = convertTemperature(weather.temperature || 0, units.temperature);
    const displayFeelsLike = convertTemperature(weather.feelsLike || 0, units.temperature);
    const displayWindSpeed = convertWindSpeed(weather.windSpeed || 0, units.wind);
    const displayPrecipitation = convertPrecipitation(weather.precipitation || 0, units.precipitation);

    //? l. Convert daily and hourly temperatures
    const convertDailyMinTemp = (temp) => convertTemperature(temp, units.temperature);
    const convertDailyMaxTemp = (temp) => convertTemperature(temp, units.temperature);
    const convertHourlyTemp = (temp) => convertTemperature(temp, units.temperature);


    return (
        <>
            <h1>How's the sky looking today?</h1>
            <Search 
                searchCity={searchCity} 
                setSearchCity={setSearchCity} 
                isLoading={isLoading} 
                fetchWeatherData={fetchWeatherData} 
                errorMessage={errorMessage} 
                setErrorMessage={setErrorMessage}
                onSearchStart={() => setAwaitingSelection(true)}
            />

            {errorMessage && <p className='text-neutral-0'>{errorMessage}</p>}

            {/* Show the loading skeleton while the weather data is being fetched AND no weather data for a city has been fetched */}
            {isLoading || awaitingSelection ? 
                (
                    // * Loading Skeleton
                    <Skeleton />
                )
            : 
                apiError ? (
                    // * API Error Display
                    <ApiError 
                        onRetry = {() => fetchWeatherData(lastQuery, lastCoords)}
                    />
                ) 
            :
                // * Actual Weather Data
                //? Only show the weather data if there is a city to display OR there is no error message OR the app is not waiting for the user to select a city from the suggestions dropdown
                !weather.city || errorMessage || awaitingSelection ? null : (
                    <div className='weather-box'>
                        <div className="weather-daily">

                            {/* TODO: Turn this into a component */}
                            <div className="location-weather">
                                <div className="city-and-date">
                                    <h4 className="location">
                                    {/* Display user's location initially when the search query is empty */}
                                    {/* Only display the comma if there is a country */}
                                        {weather.city}{weather.country && `, ${weather.country}`}  
                                    </h4>
                                    <span className="date">
                                        {weather.dateTime && formatDate(weather.dateTime)}
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
                                        {weather.temperature &&
                                            <h1>
                                                {displayTemperature}{weather.temperatureUnit}
                                            </h1>
                                        }
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
                                        {displayWindSpeed} {units.wind === weather.windSpeedUnit ? weather.windSpeedUnit : 'mph'}
                                        {/* OR 
                                            {displayWindSpeed} {units.wind === 'km/h' ? weather.windSpeedUnit : 'mph'} 
                                        */}
                                    </span>
                                </div>
                                <div className="precipitation">
                                    <p>Precipitation</p>
                                    <span>
                                        {displayPrecipitation} {units.precipitation === weather.precipitationUnit ? weather.precipitationUnit : 'in'}
                                        {/* OR
                                            {displayPrecipitation} {units.precipitation === 'mm' ? weather.precipitationUnit : 'in'} 
                                        */}
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
                                        selected={dailyForecast.find(day => day.date === selectedDay)?.longDate} 
                                        options={dailyForecast} // OR options={dailyForecast.map(day => ({date: day.date, longDate: day.longDate}))}
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
                )
            }
        </>
    )
}
