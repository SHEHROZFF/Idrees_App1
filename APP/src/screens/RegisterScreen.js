// src/screens/RegisterScreen.js

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
import { registerUser } from '../services/api';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';
import CustomAlert from '../components/CustomAlert'; // Import CustomAlert
import { UserContext } from '../contexts/UserContext';
const { width, height } = Dimensions.get('window');

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Password states
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(''); // New state for password strength
  const [passwordScore, setPasswordScore] = useState(0); // Numeric score for password strength

  // Confirm password state
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true); // New state for password match

  const { register } = useContext(UserContext);

  // Loading state
  const [loading, setLoading] = useState(false);

  // State for controlling the CustomAlert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertIcon, setAlertIcon] = useState('');
  const [alertButtons, setAlertButtons] = useState([]);

  // Get theme from context
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  // Animation values
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconTranslateY = useRef(new Animated.Value(-50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Create refs for input fields
  const emailInputRef = useRef();
  const passwordInputRef = useRef();
  const confirmPasswordInputRef = useRef();

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

  // Function to evaluate password strength
  const evaluatePasswordStrength = (password) => {
    let strength = '';
    let score = 0;

    if (password.length >= 6) {
      if (/[a-z]/.test(password)) score++; // Lowercase letters
      if (/[A-Z]/.test(password)) score++; // Uppercase letters
      if (/[0-9]/.test(password)) score++; // Numbers
      if (/[^A-Za-z0-9]/.test(password)) score++; // Special characters
      if (password.length >= 8) score++; // Bonus for length

      switch (score) {
        case 1:
        case 2:
          strength = 'Weak';
          break;
        case 3:
          strength = 'Medium';
          break;
        case 4:
          strength = 'Strong';
          break;
        case 5:
          strength = 'Very Strong';
          break;
        default:
          strength = 'Weak';
      }
    } else {
      strength = 'Too Short';
    }

    setPasswordStrength(strength);
    setPasswordScore(score);
  };

  const handlePasswordChange = (password) => {
    setPassword(password);
    evaluatePasswordStrength(password);

    // Check if passwords match
    if (confirmPassword !== '') {
      setPasswordsMatch(password === confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (confirmPassword) => {
    setConfirmPassword(confirmPassword);
    setPasswordsMatch(password === confirmPassword);
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setAlertTitle('Validation Error');
      setAlertMessage('Please fill in all fields.');
      setAlertIcon('alert-circle');
      setAlertButtons([
        {
          text: 'OK',
          onPress: () => setAlertVisible(false),
        },
      ]);
      setAlertVisible(true);
      return;
    }

    if (password.length < 6) {
      setAlertTitle('Validation Error');
      setAlertMessage('Password must be at least 6 characters long.');
      setAlertIcon('alert-circle');
      setAlertButtons([
        {
          text: 'OK',
          onPress: () => setAlertVisible(false),
        },
      ]);
      setAlertVisible(true);
      return;
    }

    if (password !== confirmPassword) {
      setAlertTitle('Validation Error');
      setAlertMessage('Passwords do not match.');
      setAlertIcon('alert-circle');
      setAlertButtons([
        {
          text: 'OK',
          onPress: () => setAlertVisible(false),
        },
      ]);
      setAlertVisible(true);
      return;
    }

    setLoading(true);

    // Simulate registration API call
    const userData = { name, email, password, role: 'user' };
    const response = await register(userData);
    setLoading(false);
    console.log(response);
    

    if (response.success) {
      setAlertTitle('Success');
      setAlertMessage('Account created successfully!');
      setAlertIcon('checkmark-circle');
      setAlertButtons([
        {
          text: 'OK',
          onPress: () => {
            setAlertVisible(false);
            navigation.navigate('Main');
          },
        },
      ]);
      setAlertVisible(true);
    } else {
      setAlertTitle('Registration Failed');
      setAlertMessage(response.message);
      setAlertIcon('close-circle');
      setAlertButtons([
        {
          text: 'OK',
          onPress: () => setAlertVisible(false),
        },
      ]);
      setAlertVisible(true);
    }
  };

  // Function to get color based on password strength
  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'Too Short':
        return 'red';
      case 'Weak':
        return 'red';
      case 'Medium':
        return 'orange';
      case 'Strong':
        return 'yellowgreen';
      case 'Very Strong':
        return 'green';
      default:
        return 'grey';
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
            <Icon name="person-add" size={100} color={currentTheme.primaryColor} />
            <Text style={[styles.title, { color: currentTheme.textColor }]}>
              Create Account
            </Text>
          </Animated.View>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Icon
                name="person"
                size={24}
                color={currentTheme.placeholderTextColor}
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Name"
                placeholderTextColor={currentTheme.placeholderTextColor}
                style={[
                  styles.input,
                  {
                    color: currentTheme.textColor,
                    backgroundColor: currentTheme.inputBackground,
                  },
                ]}
                onChangeText={setName}
                accessibilityLabel="Name Input"
                returnKeyType="next"
                onSubmitEditing={() => {
                  emailInputRef.current.focus();
                }}
                blurOnSubmit={false}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Icon
                name="email"
                size={24}
                color={currentTheme.placeholderTextColor}
                style={styles.inputIcon}
              />
              <TextInput
                ref={emailInputRef}
                placeholder="Email"
                placeholderTextColor={currentTheme.placeholderTextColor}
                style={[
                  styles.input,
                  {
                    color: currentTheme.textColor,
                    backgroundColor: currentTheme.inputBackground,
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
            <View style={styles.inputWrapper}>
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
                    backgroundColor: currentTheme.inputBackground,
                  },
                ]}
                secureTextEntry
                onChangeText={handlePasswordChange}
                accessibilityLabel="Password Input"
                returnKeyType="next"
                onSubmitEditing={() => {
                  confirmPasswordInputRef.current.focus();
                }}
                blurOnSubmit={false}
              />
            </View>
            {/* Password Strength Indicator */}
            {password !== '' && (
              <View style={styles.passwordStrengthContainer}>
                <View
                  style={[
                    styles.passwordStrengthBar,
                    {
                      width: `${(passwordScore / 5) * 100}%`,
                      backgroundColor: getPasswordStrengthColor(),
                    },
                  ]}
                />
                <Text style={[styles.passwordStrengthText, { color: getPasswordStrengthColor() }]}>
                  {passwordStrength}
                </Text>
              </View>
            )}
            <View style={styles.inputWrapper}>
              <Icon
                name="lock-outline"
                size={24}
                color={currentTheme.placeholderTextColor}
                style={styles.inputIcon}
              />
              <TextInput
                ref={confirmPasswordInputRef}
                placeholder="Confirm Password"
                placeholderTextColor={currentTheme.placeholderTextColor}
                style={[
                  styles.input,
                  {
                    color: currentTheme.textColor,
                    backgroundColor: currentTheme.inputBackground,
                  },
                ]}
                secureTextEntry
                onChangeText={handleConfirmPasswordChange}
                accessibilityLabel="Confirm Password Input"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
            </View>
            {/* Password Match Indicator */}
            {confirmPassword !== '' && !passwordsMatch && (
              <Text style={styles.passwordMismatchText}>Passwords do not match</Text>
            )}
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
              onPress={handleRegister}
              activeOpacity={0.8}
              accessibilityLabel="Register Button"
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>REGISTER</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
          <View style={styles.loginContainer}>
            <Text style={[styles.accountText, { color: currentTheme.textColor }]}>
              Already have an account?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              accessibilityLabel="Login Button"
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.loginText,
                  { color: currentTheme.secondaryColor },
                ]}
              >
                {' '}
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CustomAlert Component */}
        <CustomAlert
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          icon={alertIcon}
          onClose={() => setAlertVisible(false)}
          buttons={alertButtons}
        />
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
  passwordStrengthContainer: {
    width: '100%',
    marginBottom: 10,
  },
  passwordStrengthBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'grey',
  },
  passwordStrengthText: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf: 'flex-end',
  },
  passwordMismatchText: {
    color: 'red',
    fontSize: 14,
    marginTop: -5,
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: 50, // Adjust to align with the input fields
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
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  accountText: {
    fontSize: 16,
  },
  loginText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});


export default RegisterScreen;







// // src/screens/RegisterScreen.js

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
//   ActivityIndicator,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { registerUser } from '../services/api';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// const { width, height } = Dimensions.get('window');

// const RegisterScreen = () => {
//   const navigation = useNavigation();
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');

//   // Password states
//   const [password, setPassword] = useState('');
//   const [passwordStrength, setPasswordStrength] = useState(''); // New state for password strength
//   const [passwordScore, setPasswordScore] = useState(0); // Numeric score for password strength

//   // Confirm password state
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [passwordsMatch, setPasswordsMatch] = useState(true); // New state for password match

//   // Loading state
//   const [loading, setLoading] = useState(false);

//   // Get theme from context
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Animation values
//   const iconOpacity = useRef(new Animated.Value(0)).current;
//   const iconTranslateY = useRef(new Animated.Value(-50)).current;
//   const buttonScale = useRef(new Animated.Value(1)).current;

//   // Create refs for input fields
//   const emailInputRef = useRef();
//   const passwordInputRef = useRef();
//   const confirmPasswordInputRef = useRef();

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

//   // Function to evaluate password strength
//   const evaluatePasswordStrength = (password) => {
//     let strength = '';
//     let score = 0;

//     if (password.length >= 6) {
//       if (/[a-z]/.test(password)) score++; // Lowercase letters
//       if (/[A-Z]/.test(password)) score++; // Uppercase letters
//       if (/[0-9]/.test(password)) score++; // Numbers
//       if (/[^A-Za-z0-9]/.test(password)) score++; // Special characters
//       if (password.length >= 8) score++; // Bonus for length

//       switch (score) {
//         case 1:
//         case 2:
//           strength = 'Weak';
//           break;
//         case 3:
//           strength = 'Medium';
//           break;
//         case 4:
//           strength = 'Strong';
//           break;
//         case 5:
//           strength = 'Very Strong';
//           break;
//         default:
//           strength = 'Weak';
//       }
//     } else {
//       strength = 'Too Short';
//     }

//     setPasswordStrength(strength);
//     setPasswordScore(score);
//   };

//   const handlePasswordChange = (password) => {
//     setPassword(password);
//     evaluatePasswordStrength(password);

//     // Check if passwords match
//     if (confirmPassword !== '') {
//       setPasswordsMatch(password === confirmPassword);
//     }
//   };

//   const handleConfirmPasswordChange = (confirmPassword) => {
//     setConfirmPassword(confirmPassword);
//     setPasswordsMatch(password === confirmPassword);
//   };

//   const handleRegister = async () => {
//     if (!name || !email || !password || !confirmPassword) {
//       Alert.alert('Validation Error', 'Please fill in all fields.');
//       return;
//     }

//     if (password.length < 6) {
//       Alert.alert('Validation Error', 'Password must be at least 6 characters long.');
//       return;
//     }

//     if (password !== confirmPassword) {
//       Alert.alert('Validation Error', 'Passwords do not match.');
//       return;
//     }

//     setLoading(true);

//     // Simulate registration API call
//     const userData = { name, email, password, role: 'user' };
//     const response = await registerUser(userData);
//     setLoading(false);

//     if (response) {
//       Alert.alert('Success', 'Account created successfully!');
//       navigation.navigate('Login');
//     } else {
//       Alert.alert('Registration Failed', 'Please check your details and try again.');
//     }
//   };

//   // Function to get color based on password strength
//   const getPasswordStrengthColor = () => {
//     switch (passwordStrength) {
//       case 'Too Short':
//         return 'red';
//       case 'Weak':
//         return 'red';
//       case 'Medium':
//         return 'orange';
//       case 'Strong':
//         return 'yellowgreen';
//       case 'Very Strong':
//         return 'green';
//       default:
//         return 'grey';
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
//             <Icon name="person-add" size={100} color={currentTheme.primaryColor} />
//             <Text style={[styles.title, { color: currentTheme.textColor }]}>
//               Create Account
//             </Text>
//           </Animated.View>
//           <View style={styles.inputContainer}>
//             <View style={styles.inputWrapper}>
//               <Icon
//                 name="person"
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 placeholder="Name"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 style={[
//                   styles.input,
//                   {
//                     color: currentTheme.textColor,
//                     backgroundColor: currentTheme.inputBackground,
//                   },
//                 ]}
//                 onChangeText={setName}
//                 accessibilityLabel="Name Input"
//                 returnKeyType="next"
//                 onSubmitEditing={() => {
//                   emailInputRef.current.focus();
//                 }}
//                 blurOnSubmit={false}
//               />
//             </View>
//             <View style={styles.inputWrapper}>
//               <Icon
//                 name="email"
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 ref={emailInputRef}
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
//                 returnKeyType="next"
//                 onSubmitEditing={() => {
//                   passwordInputRef.current.focus();
//                 }}
//                 blurOnSubmit={false}
//               />
//             </View>
//             <View style={styles.inputWrapper}>
//               <Icon
//                 name="lock"
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 ref={passwordInputRef}
//                 placeholder="Password"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 style={[
//                   styles.input,
//                   {
//                     color: currentTheme.textColor,
//                     backgroundColor: currentTheme.inputBackground,
//                   },
//                 ]}
//                 secureTextEntry
//                 onChangeText={handlePasswordChange}
//                 accessibilityLabel="Password Input"
//                 returnKeyType="next"
//                 onSubmitEditing={() => {
//                   confirmPasswordInputRef.current.focus();
//                 }}
//                 blurOnSubmit={false}
//               />
//             </View>
//             {/* Password Strength Indicator */}
//             {password !== '' && (
//               <View style={styles.passwordStrengthContainer}>
//                 <View
//                   style={[
//                     styles.passwordStrengthBar,
//                     {
//                       width: `${(passwordScore / 5) * 100}%`,
//                       backgroundColor: getPasswordStrengthColor(),
//                     },
//                   ]}
//                 />
//                 <Text style={[styles.passwordStrengthText, { color: getPasswordStrengthColor() }]}>
//                   {passwordStrength}
//                 </Text>
//               </View>
//             )}
//             <View style={styles.inputWrapper}>
//               <Icon
//                 name="lock-outline"
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 ref={confirmPasswordInputRef}
//                 placeholder="Confirm Password"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 style={[
//                   styles.input,
//                   {
//                     color: currentTheme.textColor,
//                     backgroundColor: currentTheme.inputBackground,
//                   },
//                 ]}
//                 secureTextEntry
//                 onChangeText={handleConfirmPasswordChange}
//                 accessibilityLabel="Confirm Password Input"
//                 returnKeyType="done"
//                 onSubmitEditing={handleRegister}
//               />
//             </View>
//             {/* Password Match Indicator */}
//             {confirmPassword !== '' && !passwordsMatch && (
//               <Text style={styles.passwordMismatchText}>Passwords do not match</Text>
//             )}
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
//               onPress={handleRegister}
//               activeOpacity={0.8}
//               accessibilityLabel="Register Button"
//               accessibilityRole="button"
//             >
//               {loading ? (
//                 <ActivityIndicator size="small" color="#FFFFFF" />
//               ) : (
//                 <Text style={styles.buttonText}>REGISTER</Text>
//               )}
//             </TouchableOpacity>
//           </Animated.View>
//           <View style={styles.loginContainer}>
//             <Text style={[styles.accountText, { color: currentTheme.textColor }]}>
//               Already have an account?
//             </Text>
//             <TouchableOpacity
//               onPress={() => navigation.navigate('Login')}
//               accessibilityLabel="Login Button"
//               accessibilityRole="button"
//             >
//               <Text
//                 style={[
//                   styles.loginText,
//                   { color: currentTheme.secondaryColor },
//                 ]}
//               >
//                 {' '}
//                 Login
//               </Text>
//             </TouchableOpacity>
//           </View>
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
//   passwordStrengthContainer: {
//     width: '100%',
//     marginBottom: 10,
//   },
//   passwordStrengthBar: {
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: 'grey',
//   },
//   passwordStrengthText: {
//     marginTop: 5,
//     fontSize: 14,
//     fontWeight: 'bold',
//     alignSelf: 'flex-end',
//   },
//   passwordMismatchText: {
//     color: 'red',
//     fontSize: 14,
//     marginTop: -5,
//     marginBottom: 10,
//     alignSelf: 'flex-start',
//     marginLeft: 50, // Adjust to align with the input fields
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
//   loginContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   accountText: {
//     fontSize: 16,
//   },
//   loginText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default RegisterScreen;



