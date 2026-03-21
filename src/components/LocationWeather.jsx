export const LocationWeather = ({ weather, weatherIcons, weatherDescriptions, formatDate, displayTemperature }) => {
    return (
        <div className="location-weather">
            <div className="city-and-date">
                <h2 className="location">
                {/* Display user's location initially when the search query is empty */}
                {/* Only display the comma if there is a country */}
                    {weather.city}{weather.country && `, ${weather.country}`}  
                </h2>
                <span className="date">
                    {weather.dateTime && formatDate(weather.dateTime)}
                </span>
            </div>

            <div className="condition-and-temperature">
                {weather.weatherCode !== undefined && (
                    <img
                        src={weatherIcons[weather.weatherCode] || 'icon-sunny.webp'}
                        alt={weatherDescriptions(weather.weatherCode)}
                        className="weather-icon"
                    />
                )}
                <div className="temperature">
                    {weather.temperature &&
                        <h3>
                            {displayTemperature}{weather.temperatureUnit}
                        </h3>
                    }
                </div>
            </div>
        </div>
    )
}