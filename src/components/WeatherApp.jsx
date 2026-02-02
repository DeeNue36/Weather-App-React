import { useState } from 'react'
import { Header } from './Header'
import { WeatherData } from './WeatherData'

export const WeatherApp = () => {
    const [units, setUnits] = useState({
        temperature: "celsius",
        wind: "km/h",
        precipitation: "mm"
    });

    return (
        <div className='container'>
            <Header units={units} setUnits={setUnits} />
            <WeatherData units={units}/>
        </div>
    )
}