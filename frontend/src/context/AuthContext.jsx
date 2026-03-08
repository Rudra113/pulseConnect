/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

// API Base URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create the Auth Context
const AuthContext = createContext(null);

/**
 * Custom hook to use the auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * Auth Provider Component
 * Wraps the app and provides authentication state
 */
export const AuthProvider = ({ children }) => {
  // User state
  const [user, setUser] = useState(null);
  // Loading state for initial auth check
  const [loading, setLoading] = useState(true);
  // Error state
  const [error, setError] = useState(null);

  /**
   * Configure axios defaults when token changes
   */
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("medtracker_token", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("medtracker_token");
    }
  };

  /**
   * Check if user is already logged in on app load
   */
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("medtracker_token");

      if (token) {
        try {
          setAuthToken(token);
          const response = await axios.get(`${API_URL}/auth/me`);

          if (response.data.success) {
            setUser(response.data.data);
          }
        } catch (err) {
          console.error("Auth check failed:", err);
          // Token is invalid, clear it
          setAuthToken(null);
          setUser(null);
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  /**
   * Register a new user
   * @param {Object} registrationData - Can be object with all fields or individual params for backwards compatibility
   */
  const register = async (registrationData, ...args) => {
    try {
      setError(null);

      // Handle both object format and legacy format (name, email, password)
      let payload;
      if (typeof registrationData === "object" && registrationData !== null) {
        payload = registrationData;
      } else {
        // Legacy support: register(name, email, password)
        const [name, email, password] = args;
        payload = { name, email, password };
      }

      const response = await axios.post(`${API_URL}/auth/register`, payload);

      if (response.data.success) {
        const { user: userData, token } = response.data.data;

        // For doctors pending approval, don't auto-login
        if (userData.role === "doctor" && !userData.isApproved) {
          return { success: true, pendingApproval: true };
        }

        setAuthToken(token);
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      setError(message);
      return { success: false, message };
    }
  };

  /**
   * Login user
   */
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const { user: userData, token } = response.data.data;
        setAuthToken(token);
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      return { success: false, message };
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      // Call logout API to set offline status
      const token = localStorage.getItem("medtracker_token");
      if (token) {
        await axios.post(
          `${API_URL}/auth/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      }
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      // Always clear local state
      setAuthToken(null);
      setUser(null);
      setError(null);
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (updates) => {
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, updates);

      if (response.data.success) {
        setUser(response.data.data);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || "Update failed";
      return { success: false, message };
    }
  };

  /**
   * Clear error
   */
  const clearError = () => setError(null);

  // Context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
