// src/screens/ForgotPasswordScreen.js

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
import { forgotPassword } from '../services/api';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';
import CustomAlert from '../components/CustomAlert'; // Import CustomAlert

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const navigation = useNavigation();

  // Loading state
  const [loading, setLoading] = useState(false);

  // State for controlling the CustomAlert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertIcon, setAlertIcon] = useState('');

  // Get theme from context
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  // Animation values
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconTranslateY = useRef(new Animated.Value(-50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

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

  const handleResetPassword = async () => {
    if (!email) {
      setAlertTitle('Validation Error');
      setAlertMessage('Please enter your email.');
      setAlertIcon('alert-circle');
      setAlertVisible(true);
      return;
    }

    // Simple email format validation
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setAlertTitle('Validation Error');
      setAlertMessage('Please enter a valid email address.');
      setAlertIcon('alert-circle');
      setAlertVisible(true);
      return;
    }

    setLoading(true);

    // Simulate reset password API call
    const response = await forgotPassword(email);
    setLoading(false);

    if (response.success) {
      setAlertTitle('Success');
      setAlertMessage('A reset link has been sent to your email.');
      setAlertIcon('checkmark-circle');
      setAlertVisible(true);
    } else {
      setAlertTitle('Error');
      setAlertMessage(response.message);
      setAlertIcon('close-circle');
      setAlertVisible(true);
    }
  };

  const handleCloseAlert = () => {
    setAlertVisible(false);
    if (alertTitle === 'Success') {
      navigation.navigate('Otp', { email }); // Navigate to the OTP screen after successful reset request
    }
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
            <Icon name="lock-reset" size={100} color={currentTheme.primaryColor} />
            <Text style={[styles.title, { color: currentTheme.textColor }]}>
              Reset Password
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
                returnKeyType="done"
                onSubmitEditing={handleResetPassword}
              />
            </View>
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
              onPress={handleResetPassword}
              activeOpacity={0.8}
              accessibilityLabel="Send Reset Link Button"
              accessibilityRole="button"
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>SEND RESET LINK</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            accessibilityLabel="Back to Login Button"
            accessibilityRole="button"
            style={styles.backToLoginButton}
          >
            <Text style={[styles.backToLoginText, { color: currentTheme.secondaryColor }]}>
              Back to Login
            </Text>
          </TouchableOpacity>

          {/* CustomAlert Component */}
          <CustomAlert
            visible={alertVisible}
            title={alertTitle}
            message={alertMessage}
            onClose={handleCloseAlert}
            icon={alertIcon}
          />
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

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
    backgroundColor: '#ffffff',
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
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backToLoginButton: {
    marginTop: 20,
  },
  backToLoginText: {
    fontSize: 16,
  },
});


export default ForgotPasswordScreen;









// // src/screens/ForgotPasswordScreen.js

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
//   ActivityIndicator,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { forgotPassword } from '../services/api';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// const { width, height } = Dimensions.get('window');

// const ForgotPasswordScreen = () => {
//   const [email, setEmail] = useState('');
//   const navigation = useNavigation();

//   // Loading state
//   const [loading, setLoading] = useState(false);

//   // Get theme from context
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Animation values
//   const iconOpacity = useRef(new Animated.Value(0)).current;
//   const iconTranslateY = useRef(new Animated.Value(-50)).current;
//   const buttonScale = useRef(new Animated.Value(1)).current;

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

//   const handleResetPassword = async () => {
//     // navigation.navigate('Otp')
//     if (!email) {
//       Alert.alert('Validation Error', 'Please enter your email.');
//       return;
//     }

//     // Simple email format validation
//     const emailRegex = /\S+@\S+\.\S+/;
//     if (!emailRegex.test(email)) {
//       Alert.alert('Validation Error', 'Please enter a valid email address.');
//       return;
//     }

//     setLoading(true);

//     // Simulate reset password API call
//     const response = await forgotPassword(email);
//     setLoading(false);

//     if (response) {
//       Alert.alert('Success', 'A reset link has been sent to your email.');
//       navigation.navigate('Otp', { email }); // Navigate to the OTP screen after successful reset request
//     } else {
//       Alert.alert('Error', 'Failed to send reset link. Please try again later.');
//     }
//   };

//   return (
//     <LinearGradient
//       colors={theme === 'light' ? ['#ffffff', '#e6f7ff'] : ['#121212', '#1f1f1f']}
//       style={styles.background}
//     >
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.overlay}
//       >
//         <View style={styles.container}>
//           <Animated.View
//             style={{
//               opacity: iconOpacity,
//               transform: [{ translateY: iconTranslateY }],
//               alignItems: 'center',
//               marginBottom: 30,
//             }}
//           >
//             <Icon name="lock-reset" size={100} color={currentTheme.primaryColor} />
//             <Text style={[styles.title, { color: currentTheme.textColor }]}>
//               Reset Password
//             </Text>
//           </Animated.View>
//           <View style={styles.inputContainer}>
//             <View style={styles.inputWrapper}>
//               <Icon
//                 name="email"
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 placeholder="Email"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 style={[
//                   styles.input,
//                   {
//                     color: currentTheme.textColor,
//                     backgroundColor: currentTheme.inputBackground,
//                   },
//                 ]}
//                 onChangeText={setEmail}
//                 autoCapitalize="none"
//                 keyboardType="email-address"
//                 accessibilityLabel="Email Input"
//                 returnKeyType="done"
//                 onSubmitEditing={handleResetPassword}
//               />
//             </View>
//           </View>
//           <Animated.View
//             style={{
//               transform: [{ scale: buttonScale }],
//               width: '100%',
//               alignItems: 'center',
//             }}
//           >
//             <TouchableOpacity
//               style={[
//                 styles.button,
//                 { backgroundColor: currentTheme.primaryColor },
//               ]}
//               onPress={handleResetPassword}
//               activeOpacity={0.8}
//               accessibilityLabel="Send Reset Link Button"
//               accessibilityRole="button"
//               disabled={loading}
//             >
//               {loading ? (
//                 <ActivityIndicator size="small" color="#FFFFFF" />
//               ) : (
//                 <Text style={styles.buttonText}>SEND RESET LINK</Text>
//               )}
//             </TouchableOpacity>
//           </Animated.View>
//           <TouchableOpacity
//             onPress={() => navigation.navigate('Login')}
//             accessibilityLabel="Back to Login Button"
//             accessibilityRole="button"
//             style={styles.backToLoginButton}
//           >
//             <Text style={[styles.backToLoginText, { color: currentTheme.secondaryColor }]}>
//               Back to Login
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </LinearGradient>
//   );
// };

// // Styles for the components
// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//     width: width,
//     height: height,
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
//     fontSize: 32,
//     fontWeight: 'bold',
//     marginTop: 10,
//   },
//   inputContainer: {
//     width: '100%',
//     marginTop: 20,
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 10,
//     borderRadius: 30,
//     borderWidth: 1,
//     borderColor: '#d9d9d9',
//     backgroundColor: '#ffffff',
//     paddingHorizontal: 15,
//   },
//   inputIcon: {
//     marginRight: 10,
//   },
//   input: {
//     flex: 1,
//     height: 50,
//     fontSize: 16,
//   },
//   button: {
//     width: '100%',
//     paddingVertical: 15,
//     borderRadius: 30,
//     alignItems: 'center',
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   backToLoginButton: {
//     marginTop: 20,
//   },
//   backToLoginText: {
//     fontSize: 16,
//   },
// });

// export default ForgotPasswordScreen;





// // ForgotPasswordScreen.js

// import React, { useState, useEffect, useRef, useContext } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   StyleSheet,
//   Animated,
//   KeyboardAvoidingView,
//   Platform,
//   Dimensions,
//   ImageBackground,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { resetPassword } from '../services/api';
// import Icon from 'react-native-vector-icons/MaterialIcons';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// const { width, height } = Dimensions.get('window');

// const ForgotPasswordScreen = () => {
//   const [email, setEmail] = useState('');
//   const navigation = useNavigation();

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

//   const handleResetPassword = async () => {
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

//     // Implement reset password logic here
//     const response = await resetPassword(email);
//     if (response) {
//       Alert.alert('Success', 'A reset link has been sent to your email.');
//       navigation.navigate('Otp'); // Navigate to the OTP screen after successful reset request
//     } else {
//       Alert.alert('Error', 'Please check your email and try again.');
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
//             <Icon name="lock-reset" size={100} color="#FFFFFF" />
//             <Text style={[styles.title, { color: currentTheme.textColor }]}>
//               Reset Password
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
//                 },
//               ]}
//               onChangeText={setEmail}
//               autoCapitalize="none"
//               keyboardType="email-address"
//             />
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
//               onPress={handleResetPassword}
//             >
//               <Text style={styles.buttonText}>SEND RESET LINK</Text>
//             </TouchableOpacity>
//           </Animated.View>
//           <TouchableOpacity onPress={() => navigation.navigate('Login')}>
//             <Text
//               style={[styles.backToLoginText, { color: currentTheme.secondaryColor }]}
//             >
//               Back to Login
//             </Text>
//           </TouchableOpacity>
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
//     textAlign: 'center',
//   },
//   inputContainer: {
//     width: '100%',
//     marginTop: 30,
//   },
//   input: {
//     width: '100%',
//     padding: 15,
//     marginVertical: 10,
//     borderColor: '#B2DFDB',
//     borderWidth: 1,
//     borderRadius: 30,
//   },
//   button: {
//     paddingVertical: 15,
//     paddingHorizontal: 50,
//     borderRadius: 30,
//     marginVertical: 20,
//     elevation: 5,
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   backToLoginText: {
//     fontSize: 16,
//     marginTop: 10,
//   },
// });

// export default ForgotPasswordScreen;
