// ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { lightTheme, darkTheme } from './themes'; // fallback values

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Current mode: "light" or "dark"
  const [mode, setMode] = useState('light');
  // Store the theme details fetched from the backend
  const [themeDetails, setThemeDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Toggle between light and dark modes
  const toggleTheme = () => {
    setMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Fetch theme from the backend on mount
  useEffect(() => {
    axios.get('https://ecom-app-eta-three.vercel.app/api/theme') // replace with your actual API endpoint
      .then(response => {
        console.log(response.data);
        
        setThemeDetails(response.data);
      })
      .catch(error => {
        console.error('Failed to fetch theme settings:', error);
        // Fall back to static themes if fetch fails
        setThemeDetails({ light: lightTheme, dark: darkTheme });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // While loading, you can return null or a loading indicator
  if (loading) {
    return null;
  }

  // Determine the current theme details based on mode
  const currentTheme = mode === 'light' ? themeDetails.light : themeDetails.dark;

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};













// // ThemeContext.js

// import React, { createContext, useState } from 'react';

// export const ThemeContext = createContext();

// export const ThemeProvider = ({ children }) => {
//   // Default theme is light
//   const [theme, setTheme] = useState('light');

//   const toggleTheme = () => {
//     // Toggle between 'light' and 'dark'
//     setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
//   };

//   return (
//     <ThemeContext.Provider value={{ theme, toggleTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };
