// src/screens/NewPasswordScreen.js

import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { resetPassword } from '../services/api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';
import CustomAlert from '../components/CustomAlert'; // Import CustomAlert

const { width, height } = Dimensions.get('window');

const NewPasswordScreen = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const route = useRoute();
  const { email } = route.params;

  // Password visibility states
  const [secureEntry, setSecureEntry] = useState(true);
  const [secureConfirmEntry, setSecureConfirmEntry] = useState(true);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Error state
  const [error, setError] = useState('');

  // State for controlling the CustomAlert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertIcon, setAlertIcon] = useState('');
  const [alertButtons, setAlertButtons] = useState([]);

  const navigation = useNavigation();

  // Get theme from context
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  // Animation values
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconTranslateY = useRef(new Animated.Value(-50)).current;

  // Ref for confirm password input
  const confirmPasswordInputRef = useRef(null);

  // Function to start the entrance animations
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

  // Optional: Password strength calculation
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[@$!%*?&#]/.test(password)) strength += 1;
    return strength;
  };

  const renderPasswordStrength = () => {
    const strength = getPasswordStrength(newPassword);
    const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['#E53935', '#FB8C00', '#FDD835', '#43A047'];

    if (newPassword.length === 0) return null;

    return (
      <View style={styles.passwordStrengthContainer}>
        <View
          style={[
            styles.strengthBar,
            { backgroundColor: strengthColors[strength - 1] || '#E53935' },
          ]}
        />
        <Text
          style={[
            styles.strengthText,
            { color: strengthColors[strength - 1] || '#E53935' },
          ]}
        >
          {strengthLabels[strength - 1] || 'Weak'}
        </Text>
      </View>
    );
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Optional: Add password strength validation here
    if (getPasswordStrength(newPassword) < 3) {
      setError('Password is too weak. Please choose a stronger password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log(email, newPassword);

      const response = await resetPassword(email, newPassword);
      setLoading(false);

      if (response) {
        // Use CustomAlert instead of Alert.alert
        setAlertTitle('Success');
        setAlertMessage('Your password has been updated successfully!');
        setAlertIcon('checkmark-circle');
        setAlertButtons([
          {
            text: 'OK',
            onPress: () => {
              setAlertVisible(false);
              navigation.navigate('Login');
            },
          },
        ]);
        setAlertVisible(true);
      } else {
        setError('Failed to update password. Please try again later.');
      }
    } catch (err) {
      setLoading(false);
      setError('An error occurred. Please try again.');
      console.error('Update Password Error:', err);
    }
  };

  return (
    <LinearGradient
      colors={
        theme === 'light' ? ['#ffffff', '#e6f7ff'] : ['#121212', '#1f1f1f']
      }
      style={styles.background}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Animated.View
          style={{
            opacity: iconOpacity,
            transform: [{ translateY: iconTranslateY }],
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <Ionicons
            name="lock-closed-outline"
            size={100}
            color={currentTheme.primaryColor}
          />
          <Text style={[styles.title, { color: currentTheme.textColor }]}>
            New Password
          </Text>
        </Animated.View>
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-closed-outline"
              size={24}
              color={currentTheme.placeholderTextColor}
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="New Password"
              placeholderTextColor={currentTheme.placeholderTextColor}
              style={[
                styles.input,
                {
                  color: currentTheme.textColor,
                  backgroundColor: currentTheme.inputBackground,
                },
              ]}
              secureTextEntry={secureEntry}
              onChangeText={setNewPassword}
              value={newPassword}
              accessibilityLabel="New Password Input"
              returnKeyType="next"
              onSubmitEditing={() => {
                confirmPasswordInputRef.current.focus();
              }}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              onPress={() => setSecureEntry(!secureEntry)}
              style={styles.visibilityIcon}
              accessibilityLabel={
                secureEntry ? 'Show Password' : 'Hide Password'
              }
              accessibilityRole="button"
            >
              <Ionicons
                name={secureEntry ? 'eye-off' : 'eye'}
                size={24}
                color={currentTheme.placeholderTextColor}
              />
            </TouchableOpacity>
          </View>
          {renderPasswordStrength()}
          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-open-outline"
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
              secureTextEntry={secureConfirmEntry}
              onChangeText={setConfirmPassword}
              value={confirmPassword}
              accessibilityLabel="Confirm Password Input"
              returnKeyType="done"
              onSubmitEditing={handleUpdatePassword}
            />
            <TouchableOpacity
              onPress={() => setSecureConfirmEntry(!secureConfirmEntry)}
              style={styles.visibilityIcon}
              accessibilityLabel={
                secureConfirmEntry ? 'Show Password' : 'Hide Password'
              }
              accessibilityRole="button"
            >
              <Ionicons
                name={secureConfirmEntry ? 'eye-off' : 'eye'}
                size={24}
                color={currentTheme.placeholderTextColor}
              />
            </TouchableOpacity>
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: currentTheme.primaryColor },
              loading && styles.buttonLoading,
            ]}
            onPress={handleUpdatePassword}
            activeOpacity={0.8}
            accessibilityLabel="Update Password Button"
            accessibilityRole="button"
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>UPDATE PASSWORD</Text>
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          accessibilityLabel="Back to Login Button"
          accessibilityRole="button"
          style={styles.backToLoginButton}
        >
          <Text
            style={[
              styles.backToLoginText,
              { color: currentTheme.secondaryColor },
            ]}
          >
            Back to Login
          </Text>
        </TouchableOpacity>

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
    paddingHorizontal: 20, // Added padding for better spacing on small devices
  },
  container: {
    width: '100%',
    alignItems: 'center',
    // Removed borderRadius, backgroundColor, and shadow properties for better responsiveness
  },
  title: {
    fontSize: 28,
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
  visibilityIcon: {
    padding: 5,
  },
  passwordStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  strengthBar: {
    width: 50,
    height: 5,
    borderRadius: 5,
    marginRight: 10,
  },
  strengthText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#E53935',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
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
  buttonLoading: {
    backgroundColor: '#004D40', // Darker shade while loading
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
    textDecorationLine: 'underline',
  },
});

export default NewPasswordScreen;


















// // src/screens/NewPasswordScreen.js

// import React, { useState, useRef, useEffect, useContext } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   StyleSheet,
//   Animated,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
//   Dimensions,
// } from 'react-native';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { resetPassword } from '../services/api';
// import Ionicons from 'react-native-vector-icons/Ionicons'; // Corrected Import
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// const { width, height } = Dimensions.get('window');

// const NewPasswordScreen = () => {
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const route = useRoute();
//   const { email } = route.params; 

//   // Password visibility states
//   const [secureEntry, setSecureEntry] = useState(true);
//   const [secureConfirmEntry, setSecureConfirmEntry] = useState(true);

//   // Loading state
//   const [loading, setLoading] = useState(false);

//   // Error state
//   const [error, setError] = useState('');

//   const navigation = useNavigation();

//   // Get theme from context
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Animation values
//   const iconOpacity = useRef(new Animated.Value(0)).current;
//   const iconTranslateY = useRef(new Animated.Value(-50)).current;

//   // Ref for confirm password input
//   const confirmPasswordInputRef = useRef(null);

//   // Function to start the entrance animations
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

//   // Optional: Password strength calculation
//   const getPasswordStrength = (password) => {
//     let strength = 0;
//     if (password.length >= 8) strength += 1;
//     if (/[A-Z]/.test(password)) strength += 1;
//     if (/[0-9]/.test(password)) strength += 1;
//     if (/[@$!%*?&#]/.test(password)) strength += 1;
//     return strength;
//   };

//   const renderPasswordStrength = () => {
//     const strength = getPasswordStrength(newPassword);
//     const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
//     const strengthColors = ['#E53935', '#FB8C00', '#FDD835', '#43A047'];

//     if (newPassword.length === 0) return null;

//     return (
//       <View style={styles.passwordStrengthContainer}>
//         <View
//           style={[
//             styles.strengthBar,
//             { backgroundColor: strengthColors[strength - 1] || '#E53935' },
//           ]}
//         />
//         <Text
//           style={[
//             styles.strengthText,
//             { color: strengthColors[strength - 1] || '#E53935' },
//           ]}
//         >
//           {strengthLabels[strength - 1] || 'Weak'}
//         </Text>
//       </View>
//     );
//   };

//   const handleUpdatePassword = async () => {
//     // navigation.navigate('Login')
//     if (!newPassword || !confirmPassword) {
//       setError('Please fill in all fields.');
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       setError('Passwords do not match.');
//       return;
//     }

//     // Optional: Add password strength validation here
//     if (getPasswordStrength(newPassword) < 3) {
//       setError('Password is too weak. Please choose a stronger password.');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       console.log(email,newPassword);
      
//       const response = await resetPassword(email,newPassword);
//       setLoading(false);

//       if (response) {
//         navigation.navigate('Login')
//         Alert.alert('Success', 'Your password has been updated successfully!', [
//           {
//             text: 'OK',
//             onPress: () => navigation.navigate('Login'),
//           },
//         ]);
//       } else {
//         setError('Failed to update password. Please try again later.');
//       }
//     } catch (err) {
//       setLoading(false);
//       setError('An error occurred. Please try again.');
//       console.error('Update Password Error:', err);
//     }
//   };

//   return (
//     <LinearGradient
//       colors={
//         theme === 'light' ? ['#ffffff', '#e6f7ff'] : ['#121212', '#1f1f1f']
//       }
//       style={styles.background}
//     >
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.overlay}
//       >
//         <Animated.View
//           style={{
//             opacity: iconOpacity,
//             transform: [{ translateY: iconTranslateY }],
//             alignItems: 'center',
//             marginBottom: 20,
//           }}
//         >
//           <Ionicons
//             name="lock-closed-outline"
//             size={100}
//             color={currentTheme.primaryColor}
//           />
//           <Text style={[styles.title, { color: currentTheme.textColor }]}>
//             New Password
//           </Text>
//         </Animated.View>
//         <View style={styles.inputContainer}>
//           <View style={styles.inputWrapper}>
//             <Ionicons
//               name="lock-closed-outline"
//               size={24}
//               color={currentTheme.placeholderTextColor}
//               style={styles.inputIcon}
//             />
//             <TextInput
//               placeholder="New Password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               style={[
//                 styles.input,
//                 {
//                   color: currentTheme.textColor,
//                   backgroundColor: currentTheme.inputBackground,
//                 },
//               ]}
//               secureTextEntry={secureEntry}
//               onChangeText={setNewPassword}
//               value={newPassword}
//               accessibilityLabel="New Password Input"
//               returnKeyType="next"
//               onSubmitEditing={() => {
//                 confirmPasswordInputRef.current.focus();
//               }}
//               blurOnSubmit={false}
//             />
//             <TouchableOpacity
//               onPress={() => setSecureEntry(!secureEntry)}
//               style={styles.visibilityIcon}
//               accessibilityLabel={
//                 secureEntry ? 'Show Password' : 'Hide Password'
//               }
//               accessibilityRole="button"
//             >
//               <Ionicons
//                 name={secureEntry ? 'eye-off' : 'eye'}
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//               />
//             </TouchableOpacity>
//           </View>
//           {renderPasswordStrength()}
//           <View style={styles.inputWrapper}>
//             <Ionicons
//               name="lock-open-outline"
//               size={24}
//               color={currentTheme.placeholderTextColor}
//               style={styles.inputIcon}
//             />
//             <TextInput
//               ref={confirmPasswordInputRef}
//               placeholder="Confirm Password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               style={[
//                 styles.input,
//                 {
//                   color: currentTheme.textColor,
//                   backgroundColor: currentTheme.inputBackground,
//                 },
//               ]}
//               secureTextEntry={secureConfirmEntry}
//               onChangeText={setConfirmPassword}
//               value={confirmPassword}
//               accessibilityLabel="Confirm Password Input"
//               returnKeyType="done"
//               onSubmitEditing={handleUpdatePassword}
//             />
//             <TouchableOpacity
//               onPress={() => setSecureConfirmEntry(!secureConfirmEntry)}
//               style={styles.visibilityIcon}
//               accessibilityLabel={
//                 secureConfirmEntry ? 'Show Password' : 'Hide Password'
//               }
//               accessibilityRole="button"
//             >
//               <Ionicons
//                 name={secureConfirmEntry ? 'eye-off' : 'eye'}
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//               />
//             </TouchableOpacity>
//           </View>
//           {error ? <Text style={styles.errorText}>{error}</Text> : null}
//         </View>
//         <View style={styles.buttonContainer}>
//           <TouchableOpacity
//             style={[
//               styles.button,
//               { backgroundColor: currentTheme.primaryColor },
//               loading && styles.buttonLoading,
//             ]}
//             onPress={handleUpdatePassword}
//             activeOpacity={0.8}
//             accessibilityLabel="Update Password Button"
//             accessibilityRole="button"
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator size="small" color="#FFFFFF" />
//             ) : (
//               <Text style={styles.buttonText}>UPDATE PASSWORD</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//         <TouchableOpacity
//           onPress={() => navigation.navigate('Login')}
//           accessibilityLabel="Back to Login Button"
//           accessibilityRole="button"
//           style={styles.backToLoginButton}
//         >
//           <Text
//             style={[
//               styles.backToLoginText,
//               { color: currentTheme.secondaryColor },
//             ]}
//           >
//             Back to Login
//           </Text>
//         </TouchableOpacity>
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
//     paddingHorizontal: 20, // Added padding for better spacing on small devices
//   },
//   container: {
//     width: '100%',
//     alignItems: 'center',
//     // Removed borderRadius, backgroundColor, and shadow properties for better responsiveness
//   },
//   title: {
//     fontSize: 28,
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
//   visibilityIcon: {
//     padding: 5,
//   },
//   passwordStrengthContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   strengthBar: {
//     width: 50,
//     height: 5,
//     borderRadius: 5,
//     marginRight: 10,
//   },
//   strengthText: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   errorText: {
//     color: '#E53935',
//     fontSize: 14,
//     marginTop: 5,
//     textAlign: 'center',
//   },
//   buttonContainer: {
//     width: '100%',
//     marginTop: 10,
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
//   buttonLoading: {
//     backgroundColor: '#004D40', // Darker shade while loading
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
//     textDecorationLine: 'underline',
//   },
// });

// export default NewPasswordScreen;
