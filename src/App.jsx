import { Header } from './components/Header'
import { WeatherData } from './components/WeatherData'
import './App.css'

function App() {

  return (
    <>
      <main className="container">
        <Header />
        <WeatherData />
      </main>
    </>
  )
}

export default App
