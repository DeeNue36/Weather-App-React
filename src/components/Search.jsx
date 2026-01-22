import React from 'react'

export const Search = ({ searchCity, setSearchCity, isLoading, fetchWeatherData }) => {
    return (
        <div className="search">
            <div className="search-input">
                <img src="icon-search.svg" alt="Search icon" />

                <input
                    type="text"
                    placeholder='Search for a place...'
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                />

            </div>
            <button 
                className="search-btn" 
                onClick={fetchWeatherData} 
                disabled={isLoading}
            >
                Search
            </button>
        </div>
    )
}
