export const Skeleton = () => {
    return (
        <div className='weather-box'>
            <div className="weather-daily">

                {/* Skeleton: Location's Weather */}
                <div className="location-weather-skeleton">
                    <div className="skeleton-loader">
                        <div className="loading-dots">
                            <span className='dot'></span>
                            <span className='dot'></span>
                            <span className='dot'></span>
                        </div>
                        <span className="skeleton-loader-text">
                            Loading...
                        </span>
                    </div>
                </div>

                {/* Skeleton: Weather Details for Location */}
                <div className="location-weather-details">
                    <div className="feels-like skeleton-card">
                        <p>Feels Like</p>
                        <span>
                            –
                        </span>
                    </div>
                    <div className="humidity skeleton-card">
                        <p>Humidity</p>
                        <span>
                            –
                        </span>
                    </div>
                    <div className="wind-speed skeleton-card">
                        <p>Wind Speed</p>
                        <span>
                            –
                        </span>
                    </div>
                    <div className="precipitation skeleton-card">
                        <p>Precipitation</p>
                        <span>
                            –
                        </span>
                    </div>
                </div>

                {/* Skeleton: Daily Forecasts */}
                <div className="location-daily-forecasts">
                    <p>Daily Forecast</p>
                    <div className="days-forecasts">
                        {[...Array(7)].map((_, i) => (
                            <div className="day skeleton-day" key={i}></div>
                        ))}
                    </div>
                </div>

            </div>

            <div className="weather-hourly">
                <div className="location-hourly-forecast skeleton-card">
                    <div className="weekday-hourly-forecast">
                        <p>Hourly Forecast</p>
                        <div className="skeleton-days-dropdown">
                            <span>–</span>
                            <img src="/icon-dropdown.svg" alt="dropdown icon" />
                        </div>
                    </div>

                    <div className="hourly-weather-forecast h-[unset]">
                        {[...Array(24)].map((_, i) => (
                            <div className="skeleton-hourly-card" key={i}></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}