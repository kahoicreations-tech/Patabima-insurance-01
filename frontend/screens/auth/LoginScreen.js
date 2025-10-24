import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuth();
  const passwordInputRef = useRef(null);
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!phoneNumber.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both phone number and password');
      return;
    }

    try {
      const result = await login({
        email: phoneNumber, // Using phone as email for demo
        password: password
      });

      if (result.success) {
        // Navigation will be handled automatically by the AuthContext
        console.log('Login successful');
      } else {
        Alert.alert('Login Failed', result.error || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <StatusBar style="light" />
        
        {/* Curved red header */}
        <View style={styles.curvedHeader}>
          {/* Circular logo container */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/PataLogo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          <Text style={styles.agencyText}>PATA BIMA AGENCY</Text>
          <Text style={styles.taglineText}>Insurance for Protection</Text>
        </View>

        <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
        
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Let's sign you in</Text>
          <Text style={styles.subtitle}>Welcome back, you've been missed</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholderTextColor={Colors.textLight}
              returnKeyType="next"
              autoCapitalize="none"
              autoCorrect={false}
              blurOnSubmit={false}
              onSubmitEditing={() => {
                // Focus on password field when next is pressed
                passwordInputRef?.current?.focus();
              }}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.passwordContainer}>
              <TextInput
                ref={passwordInputRef}
                style={styles.passwordInput}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor={Colors.textLight}
                returnKeyType="done"
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.signInButton}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.signInButtonText}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.forgotPasswordContainer}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Forget your password?</Text>
          </TouchableOpacity>

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerContainer}>
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>Review our </Text>
              <TouchableOpacity>
                <Text style={styles.termsLink}>Terms and Policies</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.versionText}>PataBima - Ver 1.0.0</Text>
          </View>
        </View>

        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  curvedHeader: {
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
    height: 200, // Increased height for better text visibility
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  logoContainer: {
    width: 90,
    height: 90,
    backgroundColor: Colors.background,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  logo: {
    width: 55,
    height: 55,
  },
  agencyText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.background,
    textAlign: 'center',
    marginBottom: 2, // Reduced from Spacing.xs to bring texts closer
    letterSpacing: 0.5,
  },
  taglineText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.background,
    textAlign: 'center',
    opacity: 1,
    marginTop: 0, // Removed margin top to reduce spacing
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24, // Match spacing in screenshot
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    marginTop: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 18,
    paddingVertical: Platform.OS === 'ios' ? 16 : 14,
    borderRadius: 14,
    fontSize: 16,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    borderWidth: 0,
    height: 56,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 14,
    borderWidth: 0,
    height: 56,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: Platform.OS === 'ios' ? 16 : 14,
    fontSize: 16,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
  eyeIcon: {
    paddingHorizontal: 16,
    height: 56, // Match container height
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeText: {
    fontSize: 22,
    opacity: 0.7,
  },
  signInButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    width: '100%',
    minHeight: 56,
  },
  signInButtonText: {
    color: Colors.background,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md, // Reduced margin
  },
  forgotPasswordText: {
    fontSize: Typography.fontSize.sm, // Slightly smaller but still readable
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md, // Reduced margin
  },
  signUpText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  signUpLink: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primary,
  },
  footerContainer: {
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.regular,
    color: '#888888',
  },
  termsLink: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
  },
  versionText: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.regular,
    color: '#AAAAAA',
    textAlign: 'center',
  },
});
