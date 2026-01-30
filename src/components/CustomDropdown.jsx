import { useRef, useState, useEffect } from 'react';

export const CustomDropdown = ({options, selected, onChange}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close the dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle option selection
    const handleOptionClick = (option) => {
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className="days-dropdown" ref={dropdownRef}>
            <span 
                className="days-dropdown-selected" 
                onClick={() => setIsOpen(!isOpen)}
            >
                {selected || 'Select a day'}
            </span>
            {isOpen && (
                <ul className="days-dropdown-options">
                    {options.map((option) => (
                        <li
                            key={option}
                            className="day-dropdown-option"
                            onClick={() => handleOptionClick(option)}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};