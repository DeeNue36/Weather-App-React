import { useState, useEffect, useRef } from 'react';
import { BASE_CITY_API_URL } from '../api';
import { Spinner } from './Spinner';

export const Search = ({ searchCity, setSearchCity, isLoading, fetchWeatherData }) => {
    const [citySuggestions, setCitySuggestions] = useState([]); // Array of city suggestions
    const [showSuggestedCities, setShowSuggestedCities] = useState(false); // state to control visibility of suggested cities
    const [isSearching, setIsSearching] = useState(false); // state to control visibility of spinner
    const searchRef = useRef(null); // Reference to detect clicks outside dropdown


    // Close the search dropdown when clicking outside it
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSuggestedCities(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    //? Fetch city search suggestions from API
    const fetchCitySuggestions = async (query) => { 
        //* Reset states at the start of a new search
        setIsSearching(true);
        setShowSuggestedCities(false);
        setCitySuggestions([]);

        try {
            const endpoint = `${BASE_CITY_API_URL}name=${encodeURIComponent(query)}&count=4&language=en&format=json`;

            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error('Failed to fetch city suggestions');
            }

            const data = await response.json();
            console.log('API Response:', data);

            if (data.results && data.results.length > 0) {
                setCitySuggestions(data.results);
                setShowSuggestedCities(true);

                // simulate a delay before showing city suggestions
                setTimeout(() => {
                    setShowSuggestedCities(true);
                    setIsSearching(false); // turn off loading after the delay of 2 seconds
                }, 500);
            }
            else {
                setCitySuggestions([]);
                setShowSuggestedCities(false);
            }
        }
        catch (error) {
            console.error('Error fetching city suggestions:', error);
            setCitySuggestions([]);
        }
        // finally {
        //     setIsSearching(false);
        // }
    }


    //? Show weather data for a city suggestion that is clicked
    const handleCitySuggestionClick = (city) => {
        setSearchCity(city.name);
        fetchWeatherData(city.name, {latitude: city.latitude, longitude: city.longitude});
        setIsSearching(false);
        setShowSuggestedCities(false); // Close dropdown
    };


    //? Handle Input Submission (Enter key or Search button click)
    const handleSearch = (e) => {
        e?.preventDefault(); // Prevent default form submission behavior

        // Only fetch suggestions if there's input
        if (searchCity && searchCity.trim().length >= 2) {
            fetchCitySuggestions(searchCity);
        }
        else {
            // If no input or query too short just fetch weather directly
            fetchWeatherData(searchCity);
        }
    };


    //? Handle Enter key - also shows dropdown
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
        if (e.key === 'Escape') {
            setShowSuggestedCities(false);
        }
    };


    return (
        <div className="search" ref={searchRef}>
            <div className="search-input-container">
                {/* Search Input Bar */}
                <div className="search-input">
                    <img src="icon-search.svg" alt="Search icon" />

                    <input
                        type="text"
                        placeholder='Search for a place...'
                        value = {searchCity}
                        onChange = {(e) => setSearchCity(e.target.value)}
                        onKeyDown = {handleKeyDown}
                    />
                </div>

                {/* Show suggested cities based on user search/query */}
                {showSuggestedCities && citySuggestions.length > 0 && (
                    <ul className="searched-suggestions">
                        {isSearching ? 
                            (
                                <div className="search-loading">
                                    <Spinner />
                                    <span className="search-loading-text">Search in progress</span>
                                </div>
                            )
                        : 
                            (
                                citySuggestions.map((city) => (
                                    <li 
                                        className="search-suggestion-location" 
                                        onClick={() => handleCitySuggestionClick(city)}
                                        key={`${city.latitude}-${city.longitude}`}
                                        // OR key={index} and add index as a param to the mapping function
                                    >
                                        <span className="suggestion-location-name">
                                            {city.name}
                                        </span>
                                        <span className="suggestion-location-country">
                                            {city.country}
                                        </span>
                                    </li>
                                ))
                            )
                        }
                    </ul>
                )}

            </div>

            <button 
                className="search-btn" 
                onClick={handleSearch} 
                disabled={isLoading || !searchCity.trim()}
            >
                Search
            </button>
        </div>
    )
}
