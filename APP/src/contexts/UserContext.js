// src/contexts/UserContext.js

import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import api from '../services/api'; // Ensure the path is correct
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logoutUser } from '../services/api'; // Import logout function

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // State to hold user data
  const [user, setUser] = useState(null);

  // State to manage loading status
  const [loading, setLoading] = useState(true);

  // State to manage authentication status
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch user profile on app start
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const response = await api.getUserProfile();
          if (response.success && response.data) {
            setUser(response.data);
            setIsAuthenticated(true);
          } else {
            // Token might be invalid or expired
            await logout();
          }
        }
      } catch (error) {
        console.error('Initialization Error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  /**
   * Login Function
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>} Success status and message
   */
  const login = async (email, password) => {
    try {
      const response = await api.loginUser(email, password);
      if (response.success && response.data.token) {
        const profileResponse = await api.getUserProfile();
        if (profileResponse.success && profileResponse.data) {
          setUser(profileResponse.data);
          setIsAuthenticated(true);
          return { success: true };
        } else {
          throw new Error(profileResponse.message || 'Failed to fetch user profile.');
        }
      } else {
        return { success: false, message: response.message || 'Login failed.' };
      }
    } catch (error) {
      console.error('Login Error:', error);
      return { success: false, message: error.message || 'Login failed.' };
    }
  };

  /**
   * Register Function
   * @param {object} userData
   * @returns {Promise<object>} Success status and message
   */
  const register = async (userData) => {
    try {
      const response = await api.registerUser(userData);
      if (response.success && response.data.token) {
        const profileResponse = await api.getUserProfile();
        if (profileResponse.success && profileResponse.data) {
          setUser(profileResponse.data);
          setIsAuthenticated(true);
          return { success: true };
        } else {
          throw new Error(profileResponse.message || 'Failed to fetch user profile.');
        }
      } else {
        return { success: false, message: response.message || 'Registration failed.' };
      }
    } catch (error) {
      console.error('Registration Error:', error);
      return { success: false, message: error.message || 'Registration failed.' };
    }
  };

  /**
   * Logout Function
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      const response = await logoutUser(); // Removes token from AsyncStorage
      console.log("in context",response);
      
      if (response) {
        // setUser(null);
        setIsAuthenticated(false);
      } else {
        Alert.alert('Logout Failed', 'Please try again.');
      }
    } catch (error) {
      console.error('Logout Error:', error);
      Alert.alert('Logout Error', 'An unexpected error occurred.');
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, register, logout, loading, isAuthenticated }}>
      {children}
    </UserContext.Provider>
  );
};










// // src/contexts/UserContext.js

// import React, { createContext, useState, useEffect } from 'react';
// import { Alert } from 'react-native';
// import api from '../services/api'; // Ensure the path is correct
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { logoutUser } from '../services/api'; // Import logout function

// export const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//   // State to hold user data
//   const [user, setUser] = useState(null);

//   // State to manage loading status
//   const [loading, setLoading] = useState(true);

//   // Fetch user profile on app start
//   useEffect(() => {
//     const initializeUser = async () => {
//       try {
//         const token = await AsyncStorage.getItem('token');
//         if (token) {
//           const response = await api.getUserProfile();
//           if (response.success && response.data) {
//             setUser(response.data);
//           } else {
//             // Token might be invalid or expired
//             await logout();
//           }
//         }
//       } catch (error) {
//         console.error('Initialization Error:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     initializeUser();
//   }, []);

//   /**
//    * Login Function
//    * @param {string} email
//    * @param {string} password
//    */
//   const login = async (email, password) => {
//     try {
//       const response = await api.loginUser(email, password);
//       if (response.success && response.data.token) {
//         const profileResponse = await api.getUserProfile();
//         if (profileResponse.success && profileResponse.data) {
//           setUser(profileResponse.data);
//           return { success: true };
//         } else {
//           throw new Error(profileResponse.message || 'Failed to fetch user profile.');
//         }
//       } else {
//         return { success: false, message: response.message || 'Login failed.' };
//       }
//     } catch (error) {
//       console.error('Login Error:', error);
//       return { success: false, message: error.message || 'Login failed.' };
//     }
//   };
//   const register = async (userData) => {
//     try {
//       const response = await api.registerUser(userData);
//       if (response.success && response.data.token) {
//         const profileResponse = await api.getUserProfile();
//         if (profileResponse.success && profileResponse.data) {
//           setUser(profileResponse.data);
//           return { success: true };
//         } else {
//           throw new Error(profileResponse.message || 'Failed to fetch user profile.');
//         }
//       } else {
//         return { success: false, message: response.message || 'Login failed.' };
//       }
//     } catch (error) {
//       console.error('Login Error:', error);
//       return { success: false, message: error.message || 'Login failed.' };
//     }
//   };

//   // const update = async (updatedData) => {
//   //   try {
//   //     const response = await api.updateUserProfile(updatedData);
//   //     if (response.success && response.data.data) {
//   //       const profileResponse = await api.getUserProfile();
//   //       if (profileResponse.success && profileResponse.data) {
//   //         setUser(profileResponse.data);
//   //         return { success: true };
//   //       } else {
//   //         throw new Error(profileResponse.message || 'Failed to fetch user profile.');
//   //       }
//   //     } else {
//   //       return { success: false, message: response.message || 'Login failed.' };
//   //     }
//   //   } catch (error) {
//   //     console.error('Login Error:', error);
//   //     return { success: false, message: error.message || 'Login failed.' };
//   //   }
//   // };
//   /**
//    * Logout Function
//    */
//   const logout = async () => {
//     try {
//       const response = await logoutUser(); // Removes token from AsyncStorage
//       // console.log(response);
      
//       // setUser(null);
//       return response;
//     } catch (error) {
//       console.error('Logout Error:', error);
//       Alert.alert('Error', 'Failed to logout. Please try again.');
//     }
//   };

//   return (
//     <UserContext.Provider value={{ user, setUser, login, logout, loading, register }}>
//       {children}
//     </UserContext.Provider>
//   );
// };










// // src/contexts/UserContext.js

// import React, { createContext, useState, useEffect } from 'react';
// import { Alert } from 'react-native';
// import api from '../services/api'; // Ensure the path is correct
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { logoutUser } from '../services/api'; // Import logout function

// export const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//   // State to hold user data
//   const [user, setUser] = useState(null);

//   // State to manage loading status
//   const [loading, setLoading] = useState(true);

//   // Fetch user profile on app start
//   useEffect(() => {
//     const initializeUser = async () => {
//       try {
//         const token = await AsyncStorage.getItem('token');
//         if (token) {
//           const response = await api.getUserProfile();
//           if (response.success && response.data) {
//             setUser(response.data);
//           } else {
//             // Token might be invalid or expired
//             // await logout();
//           }
//         }
//       } catch (error) {
//         console.error('Initialization Error:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     initializeUser();
//   }, []);


//   return (
//     <UserContext.Provider value={{ user, setUser,loading }}>
//       {children}
//     </UserContext.Provider>
//   );
// };
