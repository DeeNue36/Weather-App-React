import { Header } from './components/Header'
import { WeatherData } from './components/WeatherData'
import './App.css'

function App() {

  return (
    <>
      <main className="container">
        <Header />
        <h1>How's the sky looking today?</h1>
        <WeatherData />
      </main>
    </>
  )
}

export default App
