//? f. Date and Time Formatting

//? f(i). Date Formatting for City/Location
const formatDate = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

//? f(ii). Date Formatting for Daily Forecast
const formatDailyForecastDate = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
    });
};

//? f(iii). Date and Time Formatting for Hourly Forecast

//? f(iii)(a) Date Formatting for Hourly Forecast
const formatWeekday = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
    });
};

//? f(iii)(b) Time Formatting for Hourly Forecast
const formatHourlyForecastTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true,
        ampm: true
    });
};

export { formatDate, formatDailyForecastDate, formatWeekday, formatHourlyForecastTime };