import { useState, useEffect, useRef } from 'react';
import { useDebounce } from 'react-use';
import { BASE_CITY_API_URL } from '../api';

export const Search = ({ searchCity, setSearchCity, isLoading, fetchWeatherData }) => {
    const [citySuggestions, setCitySuggestions] = useState([]);
    const [showSuggestedCities, setShowSuggestedCities] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef(null); // Reference to detect clicks outside dropdown
    const [debouncedSearchedCity, setDebouncedSearchedCity] = useState(''); // Debounce the searchCity value

    // Debouncing, delay API call until user stops typing for a second
    useDebounce(() => {
        setDebouncedSearchedCity(searchCity);
    }, 1000, [searchCity]);

    // Fetch city suggestions when debounced value changes in the input field
    useEffect(() => {
        // don't perform a search if input field is empty or too short
        if (!debouncedSearchedCity || debouncedSearchedCity.length < 2) {
            setCitySuggestions([]);
            setShowSuggestedCities(false);
            return;
        }

        // Fetch city suggestions
        fetchCitySuggestions(debouncedSearchedCity);
    }, [debouncedSearchedCity]);


    // Close dropdown when clicking outside it
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

    // Fetch city search suggestions from API
    const fetchCitySuggestions = async (query) => {
        setIsSearching(true);

        try {
            const endpoint = `${BASE_CITY_API_URL}name=${encodeURIComponent(query)}&count=4&language=en&format=json`;

            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error('Failed to fetch city suggestions');
            }

            const data = await response.json();

            if (data.results && data.results.length > 0) {
                setCitySuggestions(data.results);
                setShowSuggestedCities(true);
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
        finally {
            setIsSearching(false);
        }
    }



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
