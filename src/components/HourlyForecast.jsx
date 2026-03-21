export const HourlyForecast = ({filteredForecast, convertHourlyTemp, temperatureUnit, weatherIcons, weatherDescriptions }) => {
  return (
    <div className="hourly-weather-forecast">
      {filteredForecast.map((hour, index) => (
        <div 
          className="weather-hour-card" 
          key={index}
          tabIndex={0}
          role='button'
          aria-label={`Hourly forecast for ${hour.time}, ${convertHourlyTemp(hour.temperature)}${temperatureUnit} ${weatherDescriptions(hour.weatherCode)}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
            }
          }}
        >
          <div className="hour">
            {hour.weatherCode !== undefined && (
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
            {convertHourlyTemp(hour.temperature)}{temperatureUnit}
          </span>
        </div>
      ))}
    </div>
  );
}
