import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usersAPI } from '../services/users';
import djangoAPI from '../services/DjangoAPIService';
import { clearTokens } from '../services/apiConfig';
import SecureTokenStorage from '../services/SecureTokenStorage';
import StoragePurge from '../services/StoragePurge';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication status on app start
    console.log('[AuthContext] useEffect: Initializing auth...');
    let cancelled = false;
    let timeoutId;
    (async () => {
      timeoutId = setTimeout(() => {
        if (!cancelled) {
          console.warn('[AuthContext] Auth init timeout fallback fired (6s exceeded)');
          setIsLoading(false);
          setIsAuthenticated(false);
        }
      }, 6000);
      await checkAuthStatus();
      if (!cancelled) {
        clearTimeout(timeoutId);
        console.log('[AuthContext] checkAuthStatus completed successfully');
      }
    })();
    
    // Set up DjangoAPIService callbacks for session management
    djangoAPI.setOnSessionExpired(async () => {
      console.log('[AuthContext] Session expired - silent cleanup');
      await handleSilentLogout();
    });

    djangoAPI.setOnTokenRefreshed(() => {
      console.log('[AuthContext] Token refreshed silently');
      // Session continues seamlessly - no user intervention needed
    });

    return () => {
      // Cleanup callbacks
      console.log('[AuthContext] useEffect cleanup');
      djangoAPI.setOnSessionExpired(null);
      djangoAPI.setOnTokenRefreshed(null);
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const checkAuthStatus = async () => {
    console.log('[AuthContext] Starting checkAuthStatus...');
    try {
      // Check if we have tokens in secure storage
      console.log('[AuthContext] Checking for tokens...');
      const accessToken = await SecureTokenStorage.getAccessToken();
      const refreshToken = await SecureTokenStorage.getRefreshToken();

      if (!accessToken || !refreshToken) {
        console.log('[AuthContext] No JWT tokens found, user needs to login');
        await clearStoredAuth();
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      console.log('[AuthContext] Tokens found, checking expiry...');
      // Check if token is expired or expiring soon
      const isExpired = await SecureTokenStorage.isTokenExpired();
      const isExpiringSoon = await SecureTokenStorage.isTokenExpiringSoon();

      if (isExpired) {
        console.log('[AuthContext] Token expired, attempting silent refresh');
        const refreshed = await djangoAPI.refreshTokenFlow();
        
        if (!refreshed) {
          console.log('[AuthContext] Token refresh failed, clearing session');
          await clearStoredAuth();
          setIsAuthenticated(false);
          setUser(null);
          return;
        }
      } else if (isExpiringSoon) {
        console.log('[AuthContext] Token expiring soon, refreshing proactively');
        // Fire and forget - don't block on this
        djangoAPI.refreshTokenFlow().catch(err => 
          console.warn('[AuthContext] Proactive refresh failed:', err)
        );
      }

      // Verify token with backend
      console.log('[AuthContext] Verifying token with backend...');
      try {
        const profile = await usersAPI.getCurrentUser();
        setUser(profile || null);
        setIsAuthenticated(true);
        console.log('[AuthContext] User authenticated via backend check');
      } catch (err) {
        const status = err?.response?.status;
        const code = err?.code;
        console.log('[AuthContext] Auth check failed:', { status, code, message: err?.message });
        if (status === 401 || status === 403 || status === 400 || code === 'NO_TOKEN') {
          console.log('[AuthContext] Auth check failed (unauthorized). Clearing tokens.');
          await clearStoredAuth();
          setIsAuthenticated(false);
          setUser(null);
        } else {
          console.log('[AuthContext] Auth check error (non-auth):', err?.message || err);
          // Be conservative: treat as not authenticated
          await clearStoredAuth();
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('[AuthContext] Error checking auth status:', error);
      await clearStoredAuth();
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      console.log('[AuthContext] Setting isLoading = false');
      setIsLoading(false);
    }
  };

  const clearStoredAuth = async () => {
    try {
      // Stop session monitoring
      djangoAPI.stopSessionMonitoring();
      
      // Clear secure token storage
      await SecureTokenStorage.clearAll();
      
      // Use the centralized helper to clear both key sets from AsyncStorage
      await clearTokens();
      
      // Also clear any in-app session placeholders
      await AsyncStorage.multiRemove(['@PataBima:userData', '@PataBima:sessionToken', '@PataBima:sessionExpiry']);
      
      console.log('Auth tokens and session cleared');
    } catch (error) {
      console.error('Error clearing stored auth:', error);
    }
  };

  // Silent logout - no modal, just navigate to login when needed
  const handleSilentLogout = async () => {
    await clearStoredAuth();
    setUser(null);
    setIsAuthenticated(false);
    // The app will naturally navigate to login screen when isAuthenticated is false
  };

  const storeAuthData = async (userData, sessionDuration = 24 * 60 * 60 * 1000) => {
    try {
      const sessionToken = `pat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const sessionExpiry = Date.now() + sessionDuration; // Default 24 hours
      
      await AsyncStorage.multiSet([
        ['@PataBima:userData', JSON.stringify(userData)],
        ['@PataBima:sessionToken', sessionToken],
        ['@PataBima:sessionExpiry', sessionExpiry.toString()]
      ]);
      
      console.log('Auth data stored successfully');
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  };

  const login = async (phonenumber, password) => {
    try {
      // Step 1: Send credentials to get OTP
      const result = await djangoAPI.login(phonenumber, password);
      console.log('[AuthContext] Login OTP sent successfully');
      return { 
        success: true, 
        requiresOtp: true,
        message: result.message,
        otpCode: result.otpCode // For development
      };
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Login failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const verifyOtp = async (phonenumber, otpCode) => {
    try {
      setIsLoading(true);
      // Get password from temp storage (should be stored during login step)
      const tempPassword = await AsyncStorage.getItem('@PataBima:tempPassword');
      
      if (!tempPassword) {
        return { success: false, error: 'Session expired. Please login again.' };
      }

      // Step 2: Complete authentication with OTP
      const result = await djangoAPI.authenticateWithOTP(phonenumber, tempPassword, otpCode);
      
      // Clear temp password
      await AsyncStorage.removeItem('@PataBima:tempPassword');
      
      // Get user profile
      const profile = await usersAPI.getCurrentUser();
      await storeAuthData(profile);
      setUser(profile);
      setIsAuthenticated(true);
      
      console.log('[AuthContext] OTP verified, user authenticated');
      return { success: true, user: profile };
    } catch (error) {
      console.error('[AuthContext] OTP verification error:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Invalid OTP. Please try again.';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (_userData) => {
    try {
      setIsLoading(true);
      // After successful backend signup, the app should still go through login + OTP
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Clear Django JWT tokens and stop monitoring
      await clearStoredAuth();
      // Also clear app data, drafts, and caches to prevent cross-account leakage
      await StoragePurge.purgeOnLogout();
      
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('User logged out successfully');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  // New function to refresh auth state after Django login
  const refreshAuthState = async () => {
    // Re-run the auth verification; this will set user + isAuthenticated
    setIsLoading(true);
    await checkAuthStatus();
  };

  const resetPassword = async (email) => {
    try {
      setIsLoading(true);
      
      // Demo reset password
      // In a real app, send reset request to backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return { success: true, message: 'Password reset link sent to your email' };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'Failed to send reset link. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    // Placeholder for error clearing - can be enhanced with error state
    console.log('[AuthContext] Errors cleared');
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    verifyOtp,
    signup,
    logout,
    resetPassword,
    checkAuthStatus,
    refreshAuthState,
    clearError,
    error: null // Placeholder - can be enhanced with actual error state
  };

  // Remove the Session Locked modal - handle session expiry silently
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;