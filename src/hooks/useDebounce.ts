import { useState, useEffect } from 'react';

/**
 * A custom hook that delays updating a value until a specified time has passed.
 * This is perfect for preventing API calls on every keystroke in a search bar.
 * @param value The value to debounce (e..g, the search term).
 * @param delay The delay in milliseconds (e.g., 500).
 * @returns The debounced value, which only updates after the delay.
 */
export function useDebounce<T>(value: T, delay: number): T {
    // State to store the debounced value
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Set up a timer to update the debounced value after the specified delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // This is the cleanup function:
        // If the 'value' changes again (e.g., user keeps typing) before the
        // delay is over, this will clear the previous timer and start a new one.
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // Only re-run the effect if the value or delay changes

    return debouncedValue;
}