import API_CONFIG from '../config/api.config.js';



// Storage keys for authentication
const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
  USER_DATA: 'userData',
  TOKEN_EXPIRATION: 'tokenExpiration'
};

// Helper function to get headers with authentication
const getHeaders = () => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

// Helper function to set authentication data
const setAuthData = (data, explicitUser = null, explicitToken = null) => {
  const token = explicitToken || data?.data?.token || data?.token;
  const user = explicitUser || data?.data?.user || data?.user;

  if (token) {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem('isLoggedIn', 'true'); // Added for ProtectedRoute consistency

    // Set token expiration (default to 7 days if not provided)
    const expiresIn = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    localStorage.setItem(
      STORAGE_KEYS.TOKEN_EXPIRATION,
      String(Date.now() + expiresIn)
    );

    // Store user data if available
    if (user) {
      localStorage.setItem(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(user)
      );
    }
  }
  return data;
};

export const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.LOGIN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok && data.success && data.data?.token) {
        // Store authentication data
        setAuthData(data);

        return {
          success: true,
          message: 'Login successful',
          data: data.data
        };
      } else {
        return {
          success: false,
          message: data.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.REGISTER), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok && data.success && data.data?.token) {
        // Store authentication data
        setAuthData(data);

        return {
          success: true,
          message: 'Registration successful',
          data: data.data
        };
      } else {
        return {
          success: false,
          message: data.message || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    }
  },

  // Logout user
  logout: () => {
    // Clear all auth-related items
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRATION);
    localStorage.removeItem('isLoggedIn'); // Clear this as well
  },

  // Get current user
  getCurrentUser: () => {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return false;

    const expiration = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRATION);
    if (expiration && Date.now() > parseInt(expiration)) {
      // Token has expired, clear auth data
      authService.logout();
      return false;
    }

    return true;
  },
  
  // Validate session with backend
  validateSession: async () => {
    if (!authService.isAuthenticated()) return false;
    
    try {
        const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.PROFILE), {
            headers: getHeaders()
        });
        
        if (response.ok) {
            return true;
        } else if (response.status === 401) {
            authService.logout();
            return false;
        }
        // For other errors (500, network), assume session is still valid locally to avoid jarring logout
        return true;
    } catch (error) {
        console.error('Session validation error:', error);
        return true; // Assume valid on network error to allow offline usage if needed
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.PROFILE), {
        headers: getHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) authService.logout();
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Get token
  getToken: () => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  // Get user data
  getUserData: () => {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  },

  // Helper function to make authenticated API requests
  apiRequest: async (url, options = {}) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      },
    };

    try {
        const response = await fetch(url, config);

        if (response.status === 401) {
          // Token is invalid or expired
          authService.logout();
          // Optional: You might want to reload the page or redirect here, 
          // but letting the caller handle the error is often better.
          // However, to ensure safety:
           window.location.href = '/login'; 
           throw new Error('Session expired. Please log in again.');
        }

        return response;
    } catch (error) {
        throw error;
    }
  },

  setAuthData // Exporting this for use in OTP.jsx
};

export { getHeaders, STORAGE_KEYS }; 