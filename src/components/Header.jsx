import React, { useState } from 'react';
import { UnitsDropdown } from './UnitsDropdown';

export const Header = ({ units, setUnits }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    //Toggle Dropdown Visibility
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Handle Individual Units/Metrics Selection
    const handleUnitsChange = (unitType, value) => {
        setUnits(prevUnits => ({
            ...prevUnits,
            [unitType]: value
        }))
        setIsDropdownOpen(false);
    }

    // Switch between Metric and Imperial Units at once
    const changeWeatherUnits = () => {
        const isMetric = units.temperature === 'celsius';
        setUnits({
            temperature: isMetric ? 'fahrenheit' : 'celsius',
            wind: isMetric ? 'mph' : 'km/h',
            precipitation: isMetric ? 'in' : 'mm'
        });
    };

    return (
        <nav className="navbar">
            <div className="logo">
                <img src="logo.svg" alt="Weather Now Logo" />
            </div>

            <div className="units-container">
                <button
                    className="units-btn"
                    id='toggle-units-btn'
                    onClick={toggleDropdown}
                >
                    <img src="icon-units.svg" alt="units icon" className="units-icon" />
                    Units
                    <img src="icon-dropdown.svg" alt="units dropdown icon" className="units-dropdown-icon" />
                </button>

                {isDropdownOpen && 
                    <UnitsDropdown 
                        isOpen={isDropdownOpen} 
                        setIsOpen={setIsDropdownOpen} 
                        units={units}
                        onUnitChange={handleUnitsChange}
                        onChangeWeatherUnits={changeWeatherUnits}
                    />
                }
            </div>
        </nav>
    )
}
