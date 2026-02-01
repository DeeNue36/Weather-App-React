import {useState, useEffect, useRef} from 'react';

export const UnitsDropdown = ({ isOpen, setIsOpen }) => {
    const dropdownRef = useRef(null); // Reference to the dropdown element

    // Close the dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the click was on the toggle button - if yes, don't close the dropdown, the button in Header.jsx will handle the click, this is to prevent the mousedown event from closing the dropdown since its is outside the dropdownRef element
            // without this check when the user clicks on the toggle button the button logic and the mousedown event will attempt to close the dropdown at the same time causing the dropdown state to always be true and the dropdown to always be open
            if (event.target.closest('#toggle-units-btn')) {
                return;
            }
            
            // "If ref has been assigned an element and that element is not the target of the event, close the dropdown i.e close the dropdown when clicking anywhere outside the dropdown"
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setIsOpen]);

    return (
        <div className="units-dropdown" ref={dropdownRef}>
            {isOpen && (
                <div className="units-dropdown-options">
                    <span className="units-dropdown-option">Celsius</span>
                    <span className="units-dropdown-option">Fahrenheit</span>
                </div>
            )}
        </div>
    )
}