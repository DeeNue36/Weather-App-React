//? e. Conversion functions
//? e(i) Temperature Conversion
const convertTemperature = (temp, unit) => {
    if (unit === 'fahrenheit') {
        return Math.round((temp * 9/5) + 32)
    }
    return Math.round(temp);
};

//? e(ii) Wind Speed Conversion
const convertWindSpeed = (speed, unit) => {
    if (unit === 'mph') {
        return (speed * 0.621371).toFixed(0);
    }
    return speed;
};

//? e(iii) Precipitation Conversion
const convertPrecipitation = (precipitation, unit) => {
    if (unit === 'in') {
        return (precipitation / 25.4).toFixed(0);
    }
    return precipitation;
};

export { convertTemperature, convertWindSpeed, convertPrecipitation };