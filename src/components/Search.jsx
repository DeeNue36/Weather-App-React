import React from 'react'

export const Search = ({ searchQuery, setSearchQuery }) => {
    return (
        <div className="search">
            <div className="search-input">
                <img src="icon-search.svg" alt="Search icon" />

                <input
                    type="text"
                    placeholder='Search for a place...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

            </div>
            <button className="search-btn" onClick={setSearchQuery}>
                Search
            </button>
        </div>
    )
}
