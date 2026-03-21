export const LocationWeatherDetails = ({displayFeelsLike, units, weather, displayWindSpeed, displayPrecipitation}) => {
    return (
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
    )
}