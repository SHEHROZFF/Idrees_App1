// src/screens/LoginScreen.js

import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
// import { loginUser } from '../services/api';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';

// Import the CustomAlert component
import CustomAlert from '../components/CustomAlert';
import { UserContext, UserProvider } from '../contexts/UserContext';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Loading state
  const [loading, setLoading] = useState(false);

  // State for controlling the CustomAlert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // Get theme from context
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  const { login } = useContext(UserContext);

  // Animation values
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconTranslateY = useRef(new Animated.Value(-50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Create a ref for password input
  const passwordInputRef = useRef();

  // Function to start the animations
  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(iconTranslateY, {
        toValue: 0,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    startAnimations();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setAlertTitle('Validation Error');
      setAlertMessage('Please enter both email and password.');
      setAlertVisible(true);
      return;
    }

    setLoading(true);

    // Simulate login API call
    const response = await login(email, password);
    setLoading(false);

    if (!response.success) {
      // navigation.navigate('Main'); // Adjust as per your navigation structure
      setAlertTitle('Login Failed');
      setAlertMessage('Invalid email or password.');
      setAlertVisible(true);
    } 
    // else {
    //   setAlertTitle('Login Failed');
    //   setAlertMessage('Invalid email or password.');
    //   setAlertVisible(true);
    // }
  };

  // Function to handle closing the alert
  const handleCloseAlert = () => {
    setAlertVisible(false);
  };

  return (
    <LinearGradient
      colors={theme === 'light' ? ['#ffffff', '#e6f7ff'] : ['#121212', '#1f1f1f']}
      style={styles.background}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <Animated.View
            style={{
              opacity: iconOpacity,
              transform: [{ translateY: iconTranslateY }],
              alignItems: 'center',
              marginBottom: 30,
            }}
          >
            <Icon name="login" size={100} color={currentTheme.primaryColor} />
            <Text style={[styles.title, { color: currentTheme.textColor }]}>
              Welcome Back
            </Text>
          </Animated.View>
          <View style={styles.inputContainer}>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: currentTheme.inputBackground },
              ]}
            >
              <Icon
                name="email"
                size={24}
                color={currentTheme.placeholderTextColor}
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Email"
                placeholderTextColor={currentTheme.placeholderTextColor}
                style={[
                  styles.input,
                  {
                    color: currentTheme.textColor,
                  },
                ]}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                accessibilityLabel="Email Input"
                returnKeyType="next"
                onSubmitEditing={() => {
                  passwordInputRef.current.focus();
                }}
                blurOnSubmit={false}
              />
            </View>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: currentTheme.inputBackground },
              ]}
            >
              <Icon
                name="lock"
                size={24}
                color={currentTheme.placeholderTextColor}
                style={styles.inputIcon}
              />
              <TextInput
                ref={passwordInputRef}
                placeholder="Password"
                placeholderTextColor={currentTheme.placeholderTextColor}
                style={[
                  styles.input,
                  {
                    color: currentTheme.textColor,
                  },
                ]}
                secureTextEntry
                onChangeText={setPassword}
                accessibilityLabel="Password Input"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotPasswordButton}
              accessibilityLabel="Forgot Password Button"
              accessibilityRole="button"
            >
              <Text style={[styles.forgotPasswordText, { color: currentTheme.secondaryColor }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>
          <Animated.View
            style={{
              transform: [{ scale: buttonScale }],
              width: '100%',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: currentTheme.primaryColor },
              ]}
              onPress={handleLogin}
              activeOpacity={0.8}
              accessibilityLabel="Login Button"
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>LOGIN</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
          <View style={styles.registerContainer}>
            <Text style={[styles.accountText, { color: currentTheme.textColor }]}>
              Don't have an account?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              accessibilityLabel="Sign Up Button"
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.registerText,
                  { color: currentTheme.secondaryColor },
                ]}
              >
                {' '}
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
          {/* CustomAlert Component */}
          <CustomAlert
            visible={alertVisible}
            title={alertTitle}
            message={alertMessage}
            onClose={handleCloseAlert}
            icon={alertTitle === 'Validation Error' ? 'alert-circle' : 'close-circle'}
          />
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

// Styles for the components
const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 10,
  },
  inputContainer: {
    width: '100%',
    marginTop: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  accountText: {
    fontSize: 16,
  },
  registerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;










// // LoginScreen.js

// import React, { useState, useEffect, useRef, useContext } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   StyleSheet,
//   Animated,
//   ImageBackground,
//   KeyboardAvoidingView,
//   Platform,
//   Dimensions,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { loginUser } from '../services/api';
// import Icon from 'react-native-vector-icons/MaterialIcons';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// const { width, height } = Dimensions.get('window');

// const LoginScreen = () => {
//   const navigation = useNavigation();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   // Get theme from context
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Animation values
//   const iconOpacity = useRef(new Animated.Value(0)).current;
//   const iconTranslateY = useRef(new Animated.Value(-50)).current;
//   const buttonAnimation = useRef(new Animated.Value(1)).current;

//   // Function to start the animations
//   const startAnimations = () => {
//     Animated.parallel([
//       Animated.timing(iconOpacity, {
//         toValue: 1,
//         duration: 1000,
//         useNativeDriver: true,
//       }),
//       Animated.spring(iconTranslateY, {
//         toValue: 0,
//         friction: 5,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };

//   useEffect(() => {
//     startAnimations();
//   }, []);

//   const handleLogin = async () => {
//     navigation.navigate('Otp'); 
//     // Animate button press
//     Animated.sequence([
//       Animated.spring(buttonAnimation, {
//         toValue: 0.95,
//         friction: 3,
//         tension: 40,
//         useNativeDriver: true,
//       }),
//       Animated.spring(buttonAnimation, {
//         toValue: 1,
//         friction: 3,
//         tension: 40,
//         useNativeDriver: true,
//       }),
//     ]).start();

//     // Simulate login API call
//     const response = await loginUser(email, password);
//     if (response) {
//       navigation.navigate('Main'); // Adjust as per your navigation structure
//     } else {
//       Alert.alert('Login failed', 'Please check your credentials and try again.');
//     }
//   };

//   return (
//     <ImageBackground
//       source={{
//         uri:
//           theme === 'light'
//             ? 'https://media.istockphoto.com/id/1350046657/photo/dark-green-defocused-blurred-motion-abstract-background.jpg'
//             : 'https://your-dark-theme-image-url', // Replace with your dark theme image URL
//       }}
//       style={styles.backgroundImage}
//     >
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={[
//           styles.overlay,
//           { backgroundColor: currentTheme.overlayColor },
//         ]}
//       >
//         <View style={styles.container}>
//           <Animated.View
//             style={{
//               opacity: iconOpacity,
//               transform: [{ translateY: iconTranslateY }],
//               alignItems: 'center',
//               marginBottom: 20,
//             }}
//           >
//             <Icon name="menu-book" size={100} color="#FFFFFF" />
//             <Text style={[styles.title, { color: currentTheme.textColor }]}>
//               StudyApp
//             </Text>
//           </Animated.View>
//           <View style={styles.inputContainer}>
//             <TextInput
//               placeholder="Email"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               style={[
//                 styles.input,
//                 {
//                   color: currentTheme.textColor,
//                   backgroundColor: currentTheme.cardBackground,
//                   borderColor: currentTheme.primaryColor,
//                 },
//               ]}
//               onChangeText={setEmail}
//               autoCapitalize="none"
//               keyboardType="email-address"
//             />
//             <TextInput
//               placeholder="Password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               style={[
//                 styles.input,
//                 {
//                   color: currentTheme.textColor,
//                   backgroundColor: currentTheme.cardBackground,
//                   borderColor: currentTheme.primaryColor,
//                 },
//               ]}
//               secureTextEntry
//               onChangeText={setPassword}
//             />
//             <TouchableOpacity
//               style={styles.forgotPasswordButton}
//               onPress={() => navigation.navigate('ForgotPassword')}
//             >
//               <Text
//                 style={[
//                   styles.forgotPasswordText,
//                   { color: currentTheme.secondaryColor },
//                 ]}
//               >
//                 Forgot Password?
//               </Text>
//             </TouchableOpacity>
//           </View>
//           <Animated.View
//             style={{
//               transform: [{ scale: buttonAnimation }],
//               width: '100%',
//               alignItems: 'center',
//             }}
//           >
//             <TouchableOpacity
//               style={[
//                 styles.button,
//                 { backgroundColor: currentTheme.primaryColor },
//               ]}
//               onPress={handleLogin}
//             >
//               <Text style={styles.buttonText}>LOGIN</Text>
//             </TouchableOpacity>
//           </Animated.View>
//           <View style={styles.registerContainer}>
//             <Text style={[styles.accountText, { color: currentTheme.textColor }]}>
//               Don't have an account?
//             </Text>
//             <TouchableOpacity onPress={() => navigation.navigate('Register')}>
//               <Text
//                 style={[
//                   styles.registerText,
//                   { color: currentTheme.secondaryColor },
//                 ]}
//               >
//                 {' '}
//                 Sign Up
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </KeyboardAvoidingView>
//     </ImageBackground>
//   );
// };

// // Styles for the components
// const styles = StyleSheet.create({
//   backgroundImage: {
//     flex: 1,
//     width: width,
//     height: height,
//     resizeMode: 'cover',
//   },
//   overlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   container: {
//     width: '85%',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 36,
//     fontWeight: 'bold',
//     marginTop: 10,
//     textShadowColor: '#000000',
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 5,
//   },
//   inputContainer: {
//     width: '100%',
//     marginTop: 30,
//   },
//   input: {
//     width: '100%',
//     padding: 15,
//     marginVertical: 10,
//     borderWidth: 1,
//     borderRadius: 30,
//   },
//   forgotPasswordButton: {
//     alignSelf: 'flex-end',
//     marginVertical: 5,
//   },
//   forgotPasswordText: {
//     fontSize: 14,
//   },
//   button: {
//     paddingVertical: 15,
//     paddingHorizontal: 80,
//     borderRadius: 30,
//     marginVertical: 20,
//     elevation: 5,
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   registerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   accountText: {
//     fontSize: 16,
//   },
//   registerText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default LoginScreen;
