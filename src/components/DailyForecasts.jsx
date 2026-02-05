export const DailyForecasts = ({ dailyForecasts, weatherIcons, weatherDescriptions, weatherUnit, convertMinTemp, convertMaxTemp }) => {
    return (
        <div className="location-daily-forecasts">
            <p>Daily Forecast</p>
            <div className="days-forecasts">
                {dailyForecasts.map((day, index) => {
                    return (
                        <div className="day" key={index}>
                            <p>{day.date}</p>
                            { day.weatherCode !== undefined && (
                                <img 
                                    src={weatherIcons[day.weatherCode] || 'icon-sunny.webp'} 
                                    alt={weatherDescriptions(day.weatherCode)}
                                    className='daily-weather-icon'
                                />
                            )}
                            <div className="high-low-temp">
                                <p>
                                    {convertMinTemp(day.maxTemp)}{weatherUnit}
                                </p>
                                <p>
                                    {convertMaxTemp(day.minTemp)}{weatherUnit}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}