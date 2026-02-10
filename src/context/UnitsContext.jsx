import { createContext, useContext } from 'react';

// Create context variable/object
export const UnitsContext = createContext();

// Custom hook to use units context
export const useUnitsContext = () => {
    const context = useContext(UnitsContext);

    // check if context is used outside of a provider
    if(!context) {
        throw new Error('useUnitsContext must be used within a UnitsProvider');
    }
    return context;
};
