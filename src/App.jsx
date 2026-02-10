import { WeatherApp } from './components/WeatherApp'
import { UnitsProvider } from './context/UnitsContextProvider'
import './App.css'

function App() {

  return (
    <main>
      {/* Wrap the WeatherApp component with the Provider - now all its children/components can use UseUnitsContext() */}
      <UnitsProvider> 
        <WeatherApp />
      </UnitsProvider>
    </main>
  )
}

export default App
