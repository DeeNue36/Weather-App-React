import { createContext, useContext, useState } from 'react'

// Create context variable/object
const UnitsContext = createContext();

// Custom hook to use uUnitsContext
export const useUnitsContext = () => {
    const context = useContext(UnitsContext);

    // check if context is used outside of a provider
    if(!context) {
        throw new Error('useUnitsContext must be used withing a UnitsProvider');
    }
    return context;
};

// Units Provider Component
export const UnitsProvider = ({ children }) => {

    // Default State for Weather Units
    const [units, setUnits] = useState({
        temperature: 'celsius',
        wind: 'km/h',
        precipitation: 'mm'
    });

    // Toggle between Metric and Imperial Units at once
    const toggleWeatherUnits = () => {
        const isMetric = units.temperature === 'celsius';
        setUnits({
            temperature: isMetric ? 'fahrenheit' : 'celsius',
            wind: isMetric ? 'mph' : 'km/h',
            precipitation: isMetric ? 'in' : 'mm'
        });
    };

    // Handle Individual Units/Metrics Change
    const handleUnitChange = (unitType, value) => {
        setUnits(prevUnits => ({
            ...prevUnits,
            [unitType]: value
        }));
    };

    // Return Provider Component
    return (
        <UnitsContext.Provider value = {{ units, setUnits, toggleWeatherUnits, handleUnitChange }}>
            {children}
        </UnitsContext.Provider>
    );
};