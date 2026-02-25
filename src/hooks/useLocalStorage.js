// Custom hook: useLocalStorage
// Wraps useState with automatic LocalStorage persistence + JSON serialization.
import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
    const [value, setValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item !== null ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch { }
    }, [key, value]);

    return [value, setValue];
}
