import { useState } from 'react';
import { UnitsDropdown } from './UnitsDropdown';

export const Header = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    //Toggle Dropdown Visibility
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
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
                    />
                }
            </div>
        </nav>
    )
}
