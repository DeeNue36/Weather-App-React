import { useRef, useState, useEffect } from 'react';

export const DaysDropdown = ({options, selected, onChange}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null); // Reference to the dropdown element

    // Close the dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // "If ref has been assigned an element and that element is not the target of the event, close the dropdown i.e close the dropdown when clicking anywhere outside the dropdown"
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle day option selection
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
                <img src="/icon-dropdown.svg" alt="dropdown icon" />
            </span>
            {isOpen && (
                <ul className="days-dropdown-options">
                    {options.map((option, index) => (
                        <li
                            key={index}
                            className="day-dropdown-option"
                            onClick={() => handleOptionClick(option)}
                        >
                            {option.longDate}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
    //     <div className="days-dropdown" ref={dropdownRef}>
    //         <span 
    //             className="days-dropdown-selected" 
    //             onClick={() => setIsOpen(!isOpen)}
    //         >
    //             {selected || 'Select day'}
    //             <img src="/icon-dropdown.svg" alt="dropdown icon" />
    //         </span>
    //         {isOpen && (
    //             <ul className="days-dropdown-options">
    //                 {options.map((option, index) => (
    //                     <li
    //                         key={index}
    //                         className="day-dropdown-option"
    //                         onClick={() => handleOptionClick(option)}
    //                     >
    //                         {option.longDate}
    //                     </li>
    //                 ))}
    //             </ul>
    //         )}
    //     </div>
    // );