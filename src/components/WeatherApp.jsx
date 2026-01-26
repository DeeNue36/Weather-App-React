import { Header } from './Header'
import { WeatherData } from './WeatherData'

export const WeatherApp = () => {
    return (
        <div className='container'>
            <Header />
            <WeatherData />
        </div>
    )
}