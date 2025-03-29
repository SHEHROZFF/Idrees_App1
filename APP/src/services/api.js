// src/services/api.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your actual API URL
// const API_URL = 'http://10.0.0.2:5000/api';
const API_URL = 'https://ecom-app-eta-three.vercel.app/api';
// ----------------------- Helper Functions ----------------------- //

/**shehr
 * Retrieve the authentication token from AsyncStorage.
 * @returns {Promise<string|null>} The JWT token or null if not found.
 */
const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return token;
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

/**
 * Store the authentication token in AsyncStorage.
 * @param {string} token - The JWT token to store.
 * @returns {Promise<void>}
 */
const storeAuthToken = async (token) => {
  try {
    await AsyncStorage.setItem('token', token);
  } catch (error) {
    console.error('Error storing auth token:', error);
  }
};

/**
 * Remove the authentication token from AsyncStorage (Logout).
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem('token');
    return true;
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// ----------------------- Authentication Functions ----------------------- //

/**
 * Login User
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @returns {Promise<object>} Response data or error object.
 */
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password, role: 'user' });

    if (response.data && response.data.token) {
      await storeAuthToken(response.data.token);
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Login error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Login failed.' };
  }
};

/**
 * Register User
 * @param {object} userData - User registration data.
 * @returns {Promise<object>} Response data or error object.
 */
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);

    if (response.data && response.data.token) {
      await storeAuthToken(response.data.token);
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Registration error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Registration failed.' };
  }
};

/**
 * Forgot Password
 * @param {string} email - User's email.
 * @returns {Promise<object>} Response data or error object.
 */
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/forgotpassword`, { email, role: 'user' });
    return response.data;
  } catch (error) {
    console.error('Forgot Password error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to send reset link.' };
  }
};

/**
 * Verify OTP
 * @param {string} email - User's email.
 * @param {string} otp - One-Time Password received via email.
 * @returns {Promise<object>} Response data or error object.
 */
export const verifyOtp = async (email, otp) => {
  try {
    const response = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp, role: 'user' });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Verify OTP error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'OTP verification failed.' };
  }
};

/**
 * Reset Password
 * @param {string} email - User's email.
 * @param {string} newPassword - New password to set.
 * @returns {Promise<object>} Response data or error object.
 */
export const resetPassword = async (email, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/auth/reset-password`, { email, newPassword, role: 'user' });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Reset Password error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Password reset failed.' };
  }
};

/**
 * Get User Profile
 * @returns {Promise<object>} User profile data or error object.
 */
export const getUserProfile = async () => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found.');
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(`${API_URL}/users/me`, config);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get User Profile error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to fetch user profile.' };
  }
};

/**
 * Update User Profile
 * @param {object} updatedData - Updated user data.
 * @returns {Promise<object>} Updated user data or error object.
 */
export const updateUserProfile = async (updatedData) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found.');
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.put(`${API_URL}/users/me`, updatedData, config);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Update User Profile error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to update profile.' };
  }
};

// ----------------------- Product Functions ----------------------- //

/**
 * Fetch All Products
 * @returns {Promise<object>} Products data or error object.
 */
export const fetchProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/products`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Fetch Products error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to fetch products.' };
  }
};

/**
 * Get Product Details
 * @param {string} productId - ID of the product.
 * @returns {Promise<object>} Product details data or error object.
 */
export const getProductDetails = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/products/${productId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get Product Details error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to fetch product details.' };
  }
};

/**
 * Get Top-Rated Products
 * @returns {Promise<object>} Top-rated products data or error object.
 */
export const getTopProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/products/top`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get Top Products error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to fetch top products.' };
  }
};

// ----------------------- Review Functions ----------------------- //

/**
 * Add or Update a Review (Authenticated Users)
 * @param {string} productId - ID of the product to review.
 * @param {number} rating - Rating between 1 and 5.
 * @param {string} comment - Review comment.
 * @returns {Promise<object>} Response data or error object.
 */
export const addOrUpdateReview = async (productId, rating, comment) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found.');
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(
      `${API_URL}/reviews`,
      { productId, rating, comment },
      config
    );

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Add/Update Review error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to add/update review.' };
  }
};

/**
 * Get All Reviews for a Product
 * @param {string} productId - ID of the product.
 * @returns {Promise<object>} Reviews data or error object.
 */
export const getProductReviewsAPI = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/reviews/product/${productId}`);
    console.log(response);

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get Product Reviews error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to fetch reviews.' };
  }
};

/**
 * Delete a Review (Authenticated Users/Admin)
 * @param {string} reviewId - ID of the review to delete.
 * @returns {Promise<object>} Success message or error object.
 */
export const deleteReviewAPI = async (reviewId) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found.');
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.delete(`${API_URL}/reviews/${reviewId}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Delete Review error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to delete review.' };
  }
};

// ----------------------- Order Functions ----------------------- //

/**
 * Create a New Order
 * @param {object} orderData - Data for the new order.
 * @returns {Promise<object>} Created order data or error object.
 */
export const createOrder = async (orderData) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found.');
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(`${API_URL}/orders`, orderData, config);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Create Order error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to create order.' };
  }
};

/**
 * Get Logged-in User's Orders
 * @returns {Promise<object>} Orders data or error object.
 */
export const getMyOrders = async () => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found.');
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(`${API_URL}/orders/myorders`, config);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get My Orders error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to fetch orders.' };
  }
};

// ----------------------- Payment Functions ----------------------- //

/**
 * Fetch Payment Intent for Orders
 * @param {number} totalPrice - Total price of the order (in dollars).
 * @returns {Promise<string|null>} The client secret for the payment intent or null on error.
 */
export const fetchPaymentIntent = async (totalPrice) => {
  try {
    console.log("totalPrice",totalPrice);
    
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found.');
    }

    const response = await fetch(`${API_URL}/orders/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        totalPrice: parseInt(totalPrice) * 100, // Convert to cents
      }),
    });

    const { clientSecret } = await response.json();
    return clientSecret;
  } catch (error) {
    console.error('Error fetching payment intent:', error);
    return null; // Return null on error
  }
};

// ----------------------- Token Verification Function ----------------------- //

/**
 * Verify Authentication Token with Backend
 * @returns {Promise<boolean>} True if token is valid, else false.
 */
export const verifyAuthToken = async () => {
  try {
    const token = await getAuthToken();
    if (!token) return false;

    const response = await axios.get(`${API_URL}/auth/verify-token`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.success;
  } catch (error) {
    console.error('Token verification error:', error.response?.data?.message || error.message);
    return false;
  }
};


// ------------------------change password-------------------------- //

/**
 * Change User Password (Authenticated Users)
 * @param {string} oldPassword - User's current/old password.
 * @param {string} newPassword - User's new password.
 * @returns {Promise<object>} Response data or error object.
 */
export const changeUserPassword = async (oldPassword, newPassword) => {
  try {
    console.log("changeUserPassword",oldPassword,newPassword);
    
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found.');
    }
console.log("token",token);

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
console.log("config",config);

    // Adjust the endpoint and payload according to your backend API
    const response = await axios.post(
      `${API_URL}/users/changepassword`,
      { oldPassword, newPassword },
      config
    );
    console.log("response",response);
    

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Change Password error:', error.response?.data?.message || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to change password.',
    };
  }
};

// ----------------------- Export All Functions ----------------------- //

export default {
  // Authentication
  loginUser,
  registerUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  logoutUser,

  // Products
  fetchProducts,
  getProductDetails,
  getTopProducts,

  // Reviews
  addOrUpdateReview,
  getProductReviewsAPI,
  deleteReviewAPI,

  // Orders
  createOrder,
  getMyOrders,

  // Payment
  fetchPaymentIntent,

  // Token Verification
  verifyAuthToken,

  // Change Password
  changeUserPassword
};























// // src/services/api.js

// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// // Replace with your actual API URL
// const API_URL = 'http://localhost:5000/api';

// // ----------------------- Helper Functions ----------------------- //

// /**
//  * Retrieve the authentication token from AsyncStorage.
//  * @returns {Promise<string|null>} The JWT token or null if not found.
//  */
// const getAuthToken = async () => {
//   try {
//     const token = await AsyncStorage.getItem('token');
//     return token;
//   } catch (error) {
//     console.error('Error retrieving auth token:', error);
//     return null;
//   }
// };

// /**
//  * Store the authentication token in AsyncStorage.
//  * @param {string} token - The JWT token to store.
//  * @returns {Promise<void>}
//  */
// const storeAuthToken = async (token) => {
//   try {
//     console.log(token);
    
//     await AsyncStorage.setItem('token', token);
//   } catch (error) {
//     console.error('Error storing auth token:', error);
//   }
// };

// /**
//  * Remove the authentication token from AsyncStorage (Logout).
//  * @returns {Promise<void>}
//  */
// export const logoutUser = async () => {
//   try {
//     await AsyncStorage.removeItem('token');
//   } catch (error) {
//     console.error('Logout error:', error);
//   }
// };

// // ----------------------- Authentication Functions ----------------------- //

// /**
//  * Login User
//  * @param {string} email - User's email.
//  * @param {string} password - User's password.
//  * @returns {Promise<object>} Response data or error object.
//  */
// export const loginUser = async (email, password) => {
//   try {
//     const response = await axios.post(`${API_URL}/auth/login`, { email, password, role: 'user' });
    
//     if (response.data && response.data.token) {
//       await storeAuthToken(response.data.token);
//     }
    
//     return { success: true, data: response.data };
//   } catch (error) {
//     console.error('Login error:', error.response?.data?.message || error.message);
//     return { success: false, message: error.response?.data?.message || 'Login failed.' };
//   }
// };

// /**
//  * Register User
//  * @param {object} userData - User registration data.
//  * @returns {Promise<object>} Response data or error object.
//  */
// export const registerUser = async (userData) => {
//   try {
//     const response = await axios.post(`${API_URL}/auth/register`, userData);
    
//     if (response.data && response.data.token) {
//       await storeAuthToken(response.data.token);
//     }
    
//     return { success: true, data: response.data };
//   } catch (error) {
//     console.error('Registration error:', error.response?.data?.message || error.message);
//     return { success: false, message: error.response?.data?.message || 'Registration failed.' };
//   }
// };

// /**
//  * Forgot Password
//  * @param {string} email - User's email.
//  * @returns {Promise<object>} Response data or error object.
//  */
// export const forgotPassword = async (email) => {
//   try {
//     const response = await axios.post(`${API_URL}/auth/forgotpassword`, { email, role: 'user' });
//     return  response.data 
//   } catch (error) {
//     console.error('Forgot Password error:', error.response?.data?.message || error.message);
//     return { success: false, message: error.response?.data?.message || 'Failed to send reset link.' };
//   }
// };

// /**
//  * Verify OTP
//  * @param {string} email - User's email.
//  * @param {string} otp - One-Time Password received via email.
//  * @returns {Promise<object>} Response data or error object.
//  */
// export const verifyOtp = async (email, otp) => {
//   try {
//     const response = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp, role: 'user' });
//     return { success: true, data: response.data };
//   } catch (error) {
//     console.error('Verify OTP error:', error.response?.data?.message || error.message);
//     return { success: false, message: error.response?.data?.message || 'OTP verification failed.' };
//   }
// };

// /**
//  * Reset Password
//  * @param {string} email - User's email.
//  * @param {string} otp - One-Time Password.
//  * @param {string} newPassword - New password to set.
//  * @returns {Promise<object>} Response data or error object.
//  */
// export const resetPassword = async (email,newPassword) => {
//   try {
//     const response = await axios.post(`${API_URL}/auth/reset-password`, { email, newPassword, role: 'user' });
//     return { success: true, data: response.data };
//   } catch (error) {
//     console.error('Reset Password error:', error.response?.data?.message || error.message);
//     return { success: false, message: error.response?.data?.message || 'Password reset failed.' };
//   }
// };

// /**
//  * Get User Profile
//  * @returns {Promise<object>} User profile data or error object.
//  */
// export const getUserProfile = async () => {
//   try {
//     const token = await getAuthToken();
//     if (!token) {
//       throw new Error('No authentication token found.');
//     }

//     const config = {
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${token}`,
//       },
//     };

//     const response = await axios.get(`${API_URL}/auth/profile`, config);
//     return { success: true, data: response.data };
//   } catch (error) {
//     console.error('Get User Profile error:', error.response?.data?.message || error.message);
//     return { success: false, message: error.response?.data?.message || 'Failed to fetch user profile.' };
//   }
// };

// // ----------------------- Product Functions ----------------------- //

// /**
//  * Fetch All Products
//  * @returns {Promise<object>} Products data or error object.
//  */
// export const fetchProducts = async () => {
//   try {
//     const response = await axios.get(`${API_URL}/products`);
//     return { success: true, data: response.data };
//   } catch (error) {
//     console.error('Fetch Products error:', error.response?.data?.message || error.message);
//     return { success: false, message: error.response?.data?.message || 'Failed to fetch products.' };
//   }
// };

// // /**
// //  * Add New Product (Admin Only)
// //  * @param {object} productData - Data of the product to add.
// //  * @returns {Promise<object>} Created product data or error object.
// //  */
// // export const addProduct = async (productData) => {
// //   try {
// //     const token = await getAuthToken();
// //     if (!token) {
// //       throw new Error('No authentication token found.');
// //     }

// //     const config = {
// //       headers: {
// //         'Content-Type': 'application/json',
// //         Authorization: `Bearer ${token}`,
// //       },
// //     };

// //     const response = await axios.post(`${API_URL}/products`, productData, config);
// //     return { success: true, data: response.data };
// //   } catch (error) {
// //     console.error('Add Product error:', error.response?.data?.message || error.message);
// //     return { success: false, message: error.response?.data?.message || 'Failed to add product.' };
// //   }
// // };

// // /**
// //  * Update Product (Admin Only)
// //  * @param {string} productId - ID of the product to update.
// //  * @param {object} updateData - Data to update the product with.
// //  * @returns {Promise<object>} Updated product data or error object.
// //  */
// // export const updateProduct = async (productId, updateData) => {
// //   try {
// //     const token = await getAuthToken();
// //     if (!token) {
// //       throw new Error('No authentication token found.');
// //     }

// //     const config = {
// //       headers: {
// //         'Content-Type': 'application/json',
// //         Authorization: `Bearer ${token}`,
// //       },
// //     };

// //     const response = await axios.put(`${API_URL}/products/${productId}`, updateData, config);
// //     return { success: true, data: response.data };
// //   } catch (error) {
// //     console.error('Update Product error:', error.response?.data?.message || error.message);
// //     return { success: false, message: error.response?.data?.message || 'Failed to update product.' };
// //   }
// // };

// // /**
// //  * Delete Product (Admin Only)
// //  * @param {string} productId - ID of the product to delete.
// //  * @returns {Promise<object>} Success message or error object.
// //  */
// // export const deleteProduct = async (productId) => {
// //   try {
// //     const token = await getAuthToken();
// //     if (!token) {
// //       throw new Error('No authentication token found.');
// //     }

// //     const config = {
// //       headers: {
// //         Authorization: `Bearer ${token}`,
// //       },
// //     };

// //     const response = await axios.delete(`${API_URL}/products/${productId}`, config);
// //     return { success: true, data: response.data };
// //   } catch (error) {
// //     console.error('Delete Product error:', error.response?.data?.message || error.message);
// //     return { success: false, message: error.response?.data?.message || 'Failed to delete product.' };
// //   }
// // };

// /**
//  * Get Product Details
//  * @param {string} productId - ID of the product.
//  * @returns {Promise<object>} Product details data or error object.
//  */
// export const getProductDetails = async (productId) => {
//   try {
//     const response = await axios.get(`${API_URL}/products/${productId}`);
//     return { success: true, data: response.data };
//   } catch (error) {
//     console.error('Get Product Details error:', error.response?.data?.message || error.message);
//     return { success: false, message: error.response?.data?.message || 'Failed to fetch product details.' };
//   }
// };

// /**
//  * Get Top-Rated Products
//  * @returns {Promise<object>} Top-rated products data or error object.
//  */
// export const getTopProducts = async () => {
//   try {
//     const response = await axios.get(`${API_URL}/products/top`);
//     return { success: true, data: response.data };
//   } catch (error) {
//     console.error('Get Top Products error:', error.response?.data?.message || error.message);
//     return { success: false, message: error.response?.data?.message || 'Failed to fetch top products.' };
//   }
// };

// // ----------------------- Review Functions ----------------------- //

// /**
//  * Add or Update a Review (Authenticated Users)
//  * @param {string} productId - ID of the product to review.
//  * @param {number} rating - Rating between 1 and 5.
//  * @param {string} comment - Review comment.
//  * @returns {Promise<object>} Response data or error object.
//  */
// export const addOrUpdateReview = async (productId, rating, comment) => {
//   try {
//     const token = await getAuthToken();
//     if (!token) {
//       throw new Error('No authentication token found.');
//     }

//     const config = {
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${token}`,
//       },
//     };

//     const response = await axios.post(
//       `${API_URL}/reviews`,
//       { productId, rating, comment },
//       config
//     );

//     return { success: true, data: response.data };
//   } catch (error) {
//     console.error('Add/Update Review error:', error.response?.data?.message || error.message);
//     return { success: false, message: error.response?.data?.message || 'Failed to add/update review.' };
//   }
// };

// /**
//  * Get All Reviews for a Product
//  * @param {string} productId - ID of the product.
//  * @returns {Promise<object>} Reviews data or error object.
//  */
// export const getProductReviewsAPI = async (productId) => {
//   try {
    
//     const response = await axios.get(`${API_URL}/reviews/product/${productId}`);
//     console.log(response);

//     return response;
//   } catch (error) {
//     console.error('Get Product Reviews error:', error.response?.data?.message || error.message);
//     return { success: false, message: error.response?.data?.message || 'Failed to fetch reviews.' };
//   }
// };

// /**
//  * Delete a Review (Authenticated Users/Admin)
//  * @param {string} reviewId - ID of the review to delete.
//  * @returns {Promise<object>} Success message or error object.
//  */
// export const deleteReviewAPI = async (reviewId) => {
//   try {
//     const token = await getAuthToken();
//     if (!token) {
//       throw new Error('No authentication token found.');
//     }

//     const config = {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     };

//     const response = await axios.delete(`${API_URL}/reviews/${reviewId}`, config);
//     return { success: true, data: response.data };
//   } catch (error) {
//     console.error('Delete Review error:', error.response?.data?.message || error.message);
//     return { success: false, message: error.response?.data?.message || 'Failed to delete review.' };
//   }
// };

// // ----------------------- Export All Functions ----------------------- //

// export default {
//   // Authentication
//   loginUser,
//   registerUser,
//   forgotPassword,
//   verifyOtp,
//   resetPassword,
//   getUserProfile,
//   logoutUser,

//   // Products
//   fetchProducts,
//   // addProduct,
//   // updateProduct,
//   // deleteProduct,
//   getProductDetails,
//   getTopProducts,

//   // Reviews
//   addOrUpdateReview,
//   getProductReviewsAPI,
//   deleteReviewAPI,
// };



























