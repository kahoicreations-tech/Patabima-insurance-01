import React, { createContext, useContext, useState, useEffect } from 'react';

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
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // For demo purposes, start unauthenticated
      // In a real app, check stored tokens or session data here
      await new Promise(resolve => setTimeout(resolve, 100));
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      
      // Demo login - accepts any credentials
      // In a real app, validate with backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const demoUser = {
        id: '1',
        name: 'John Doe',
        email: credentials.email,
        agentCode: 'PAT001',
        phone: '+254 700 000 000'
      };
      
      setUser(demoUser);
      setIsAuthenticated(true);
      
      return { success: true, user: demoUser };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setIsLoading(true);
      
      // Demo signup - accepts any data
      // In a real app, register with backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newUser = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        agentCode: `PAT${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        phone: userData.phone
      };
      
      setUser(newUser);
      setIsAuthenticated(true);
      
      return { success: true, user: newUser };
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
      
      // In a real app, clear tokens and notify backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser(null);
      setIsAuthenticated(false);
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
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

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    signup,
    logout,
    resetPassword,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
