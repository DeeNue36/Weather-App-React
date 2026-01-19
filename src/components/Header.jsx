import React from 'react'

export const Header = () => {
    return (
        <>
            <nav className="navbar">
                <div className="logo">
                    <img src="logo.svg" alt="Weather Now Logo" />
                </div>
                <button className="units-btn">
                    <img src="icon-units.svg" alt="units icon" className="units-icon" />
                    Units
                    <img src="icon-dropdown.svg" alt="units dropdown icon" className="units-dropdown" />
                </button>
            </nav>
        </>
    )
}
