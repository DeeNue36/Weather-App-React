import React from 'react'

export const Search = ({ searchCity, setSearchCity, isLoading }) => {
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
                onClick={setSearchCity} 
                disabled={isLoading}
            >
                Search
            </button>
        </div>
    )
}
