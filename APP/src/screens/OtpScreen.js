// src/screens/OtpScreen.js

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
  Vibration,
  useWindowDimensions,
} from 'react-native';
import { verifyOtp, forgotPassword } from '../services/api';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Updated Import for Expo
import { LinearGradient } from 'expo-linear-gradient';

import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';
import CustomAlert from '../components/CustomAlert'; // Import CustomAlert

const OtpScreen = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // For a 6-digit OTP
  const inputRefs = useRef([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60); // 60 seconds countdown
  const navigation = useNavigation();
  const route = useRoute();

  const { email } = route.params;

  // Get theme from context
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  // State for controlling the CustomAlert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertIcon, setAlertIcon] = useState('');
  const [alertButtons, setAlertButtons] = useState([]);

  // Animation values
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconTranslateY = useRef(new Animated.Value(-50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

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
    startTimer();
  }, []);

  // Timer countdown for OTP expiration
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Function to start the countdown timer
  const startTimer = () => {
    setTimer(60); // Reset to 60 seconds
  };

  // Shake animation for incorrect OTP
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length < 6) {
      setError('Please enter all 6 digits of the OTP.');
      triggerShake();
      Vibration.vibrate(500);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await verifyOtp(email, otpString);
      setLoading(false);
      console.log(response);
      

      if (response.success) {
        navigation.navigate('NewPassword', { email: email });
        // Use CustomAlert to display success message
        setAlertTitle('Success');
        setAlertMessage('OTP verified successfully!');
        setAlertIcon('checkmark-circle');
        setAlertButtons([
          {
            text: 'OK',
            onPress: () => setAlertVisible(false),
          },
        ]);
        setAlertVisible(true);
      } else {
        setError('Invalid OTP. Please try again.');
        triggerShake();
        Vibration.vibrate(500);
      }
    } catch (err) {
      setLoading(false);
      setError('An error occurred. Please try again.');
      triggerShake();
      Vibration.vibrate(500);
      console.error('OTP Verification Error:', err);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await forgotPassword(email);
      setLoading(false);

      if (response) {
        // Use CustomAlert to display success message
        setAlertTitle('Success');
        setAlertMessage('A new OTP has been sent to your email.');
        setAlertIcon('mail');
        setAlertButtons([
          {
            text: 'OK',
            onPress: () => setAlertVisible(false),
          },
        ]);
        setAlertVisible(true);

        startTimer();
        setOtp(['', '', '', '', '', '']); // Reset OTP inputs
        inputRefs.current[0].focus();
      } else {
        setError('Failed to resend OTP. Please try again later.');
      }
    } catch (err) {
      setLoading(false);
      setError('An error occurred. Please try again.');
      console.error('Resend OTP Error:', err);
    }
  };

  const handleChange = (value, index) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to the next input field if the current one is filled
      if (value && index < otp.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace key press
    if (e.nativeEvent.key === 'Backspace') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      // Focus on the previous input field if backspace is pressed
      if (index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const { width } = useWindowDimensions();

  // Determine OTP input size and gap based on screen width
  const getOtpInputSize = () => {
    if (width >= 400) return 50;
    if (width >= 375) return 45;
    return 40;
  };

  const getOtpInputGap = () => {
    if (width >= 400) return 15;
    if (width >= 375) return 12;
    return 8;
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
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateX: shakeAnim }],
            },
          ]}
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
              name="checkmark-done-circle-outline"
              size={getOtpInputSize() + 20} // Dynamic size based on screen
              color={currentTheme.primaryColor}
            />
            <Text style={[styles.title, { color: currentTheme.textColor }]}>
              Verify OTP
            </Text>
          </Animated.View>
          <Text style={[styles.instructions, { color: currentTheme.textColor }]}>
            Please enter the OTP sent to your email.
          </Text>
          <View style={[styles.otpContainer, { gap: getOtpInputGap() }]}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)} // Assign ref for each input
                value={digit}
                onChangeText={(value) => handleChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                style={[
                  styles.otpInput,
                  {
                    borderColor: error ? '#E53935' : currentTheme.primaryColor,
                    color: currentTheme.textColor,
                    backgroundColor: currentTheme.inputBackground,
                    width: getOtpInputSize(),
                    height: getOtpInputSize(),
                    fontSize: getOtpInputSize() - 10,
                  },
                ]}
                keyboardType="number-pad"
                maxLength={1} // One digit per input
                placeholder="•"
                placeholderTextColor={currentTheme.placeholderTextColor}
                returnKeyType="done"
                accessibilityLabel={`OTP Digit ${index + 1}`}
                accessibilityRole="text"
                textContentType="oneTimeCode" // Improves autofill on iOS
              />
            ))}
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: currentTheme.primaryColor },
                loading && styles.buttonLoading,
              ]}
              onPress={handleVerifyOtp}
              disabled={loading}
              accessibilityLabel="Verify OTP Button"
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>VERIFY OTP</Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.timerContainer}>
            <Text style={[styles.timerText, { color: currentTheme.textColor }]}>
              {timer > 0 ? `Resend OTP in ${timer}s` : 'You can resend the OTP now.'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleResendOtp}
            style={[
              styles.resendButton,
              { opacity: timer === 0 ? 1 : 0.6 },
            ]}
            disabled={timer !== 0 || loading}
            accessibilityLabel="Resend OTP Button"
            accessibilityRole="button"
          >
            <Text style={[styles.resendText, { color: currentTheme.secondaryColor }]}>
              Resend OTP
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
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20, // Added padding for better spacing on small devices
  },
  container: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10, // Prevents text from touching screen edges
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Centers the OTP inputs
    width: '80%',
    maxWidth: 400,
    marginBottom: 10,
    // Adding gap using the gap property for React Native >=0.71
    // If using an older version, adjust margins manually
  },
  otpInput: {
    borderWidth: 1,
    borderRadius: 10,
    textAlign: 'center',
    // width and height are set dynamically based on screen width
    // fontSize is also adjusted
    // backgroundColor is set dynamically
    // color is set dynamically
    // borderColor is set based on error state
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
    // Elevation for Android
    elevation: 2,
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
    backgroundColor: '#4CAF50', // Default primary color
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
    backgroundColor: '#388E3C', // Darker shade while loading
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timerContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  timerText: {
    fontSize: 14,
  },
  resendButton: {
    marginTop: 10,
  },
  resendText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default OtpScreen;














// // src/screens/OtpScreen.js

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
//   Vibration,
//   useWindowDimensions,
// } from 'react-native';
// import { verifyOtp, resendOtp } from '../services/api';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons'; // Updated Import for Expo
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// const OtpScreen = () => {
//   const [otp, setOtp] = useState(['', '', '', '', '', '']); // For a 6-digit OTP
//   const inputRefs = useRef([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [timer, setTimer] = useState(60); // 60 seconds countdown
//   const navigation = useNavigation();
//   const route = useRoute(); 

//   const { email } = route.params;

//   // Get theme from context
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Animation values
//   const iconOpacity = useRef(new Animated.Value(0)).current;
//   const iconTranslateY = useRef(new Animated.Value(-50)).current;
//   const shakeAnim = useRef(new Animated.Value(0)).current;

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
//     startTimer();
//   }, []);

//   // Timer countdown for OTP expiration
//   useEffect(() => {
//     let interval = null;
//     if (timer > 0) {
//       interval = setInterval(() => {
//         setTimer((prev) => prev - 1);
//       }, 1000);
//     } else if (timer === 0) {
//       clearInterval(interval);
//     }
//     return () => clearInterval(interval);
//   }, [timer]);

//   // Function to start the countdown timer
//   const startTimer = () => {
//     setTimer(60); // Reset to 60 seconds
//   };

//   // Shake animation for incorrect OTP
//   const triggerShake = () => {
//     Animated.sequence([
//       Animated.timing(shakeAnim, {
//         toValue: 10,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//       Animated.timing(shakeAnim, {
//         toValue: -10,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//       Animated.timing(shakeAnim, {
//         toValue: 10,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//       Animated.timing(shakeAnim, {
//         toValue: 0,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };

//   const handleVerifyOtp = async () => {
//     const otpString = otp.join('');
//     if (otpString.length < 6) {
//       setError('Please enter all 6 digits of the OTP.');
//       triggerShake();
//       Vibration.vibrate(500);
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const response = await verifyOtp( email, otpString );
//       setLoading(false);

//       if (response) {
//         Alert.alert('Success', 'OTP verified successfully!', 
//         //   [
//         //   {
//         //     text: 'OK',
//         //     onPress: () => navigation.navigate('NewPassword'),
//         //   },
//         // ]
//       );
//         navigation.navigate('NewPassword', { email: email });
//       } else {
//         setError('Invalid OTP. Please try again.');
//         triggerShake();
//         Vibration.vibrate(500);
//       }
//     } catch (err) {
//       setLoading(false);
//       setError('An error occurred. Please try again.');
//       triggerShake();
//       Vibration.vibrate(500);
//       console.error('OTP Verification Error:', err);
//     }
//   };

//   const handleResendOtp = async () => {
//     if (timer > 0) {
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const response = await resendOtp();
//       setLoading(false);

//       if (response) {
//         Alert.alert('Success', 'A new OTP has been sent to your email.');
//         startTimer();
//         setOtp(['', '', '', '', '', '']); // Reset OTP inputs
//         inputRefs.current[0].focus();
//       } else {
//         setError('Failed to resend OTP. Please try again later.');
//       }
//     } catch (err) {
//       setLoading(false);
//       setError('An error occurred. Please try again.');
//       console.error('Resend OTP Error:', err);
//     }
//   };

//   const handleChange = (value, index) => {
//     if (/^\d*$/.test(value) && value.length <= 1) {
//       const newOtp = [...otp];
//       newOtp[index] = value;
//       setOtp(newOtp);

//       // Move to the next input field if the current one is filled
//       if (value && index < otp.length - 1) {
//         inputRefs.current[index + 1].focus();
//       }
//     }
//   };

//   const handleKeyPress = (e, index) => {
//     // Handle backspace key press
//     if (e.nativeEvent.key === 'Backspace') {
//       const newOtp = [...otp];
//       newOtp[index] = '';
//       setOtp(newOtp);
//       // Focus on the previous input field if backspace is pressed
//       if (index > 0) {
//         inputRefs.current[index - 1].focus();
//       }
//     }
//   };

//   const { width } = useWindowDimensions();

//   // Determine OTP input size and gap based on screen width
//   const getOtpInputSize = () => {
//     if (width >= 400) return 50;
//     if (width >= 375) return 45;
//     return 40;
//   };

//   const getOtpInputGap = () => {
//     if (width >= 400) return 15;
//     if (width >= 375) return 12;
//     return 8;
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
//         <Animated.View
//           style={[
//             styles.container,
//             {
//               transform: [{ translateX: shakeAnim }],
//             },
//           ]}
//         >
//           <Animated.View
//             style={{
//               opacity: iconOpacity,
//               transform: [{ translateY: iconTranslateY }],
//               alignItems: 'center',
//               marginBottom: 20,
//             }}
//           >
//             <Ionicons
//               name="checkmark-done-circle-outline"
//               size={getOtpInputSize() + 20} // Dynamic size based on screen
//               color={currentTheme.primaryColor}
//             />
//             <Text style={[styles.title, { color: currentTheme.textColor }]}>
//               Verify OTP
//             </Text>
//           </Animated.View>
//           <Text style={[styles.instructions, { color: currentTheme.textColor }]}>
//             Please enter the OTP sent to your email.
//           </Text>
//           <View style={[styles.otpContainer, { gap: getOtpInputGap() }]}>
//             {otp.map((digit, index) => (
//               <TextInput
//                 key={index}
//                 ref={(ref) => (inputRefs.current[index] = ref)} // Assign ref for each input
//                 value={digit}
//                 onChangeText={(value) => handleChange(value, index)}
//                 onKeyPress={(e) => handleKeyPress(e, index)}
//                 style={[
//                   styles.otpInput,
//                   {
//                     borderColor: error ? '#E53935' : currentTheme.primaryColor,
//                     color: currentTheme.textColor,
//                     backgroundColor: currentTheme.inputBackground,
//                     width: getOtpInputSize(),
//                     height: getOtpInputSize(),
//                     fontSize: getOtpInputSize() - 10,
//                   },
//                 ]}
//                 keyboardType="number-pad"
//                 maxLength={1} // One digit per input
//                 placeholder="•"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 returnKeyType="done"
//                 accessibilityLabel={`OTP Digit ${index + 1}`}
//                 accessibilityRole="text"
//                 textContentType="oneTimeCode" // Improves autofill on iOS
//               />
//             ))}
//           </View>
//           {error ? <Text style={styles.errorText}>{error}</Text> : null}
//           <View style={styles.buttonContainer}>
//             <TouchableOpacity
//               style={[
//                 styles.button,
//                 { backgroundColor: currentTheme.primaryColor },
//                 loading && styles.buttonLoading,
//               ]}
//               onPress={handleVerifyOtp}
//               disabled={loading}
//               accessibilityLabel="Verify OTP Button"
//               accessibilityRole="button"
//             >
//               {loading ? (
//                 <ActivityIndicator size="small" color="#FFFFFF" />
//               ) : (
//                 <Text style={styles.buttonText}>VERIFY OTP</Text>
//               )}
//             </TouchableOpacity>
//           </View>
//           <View style={styles.timerContainer}>
//             <Text style={[styles.timerText, { color: currentTheme.textColor }]}>
//               {timer > 0 ? `Resend OTP in ${timer}s` : 'You can resend the OTP now.'}
//             </Text>
//           </View>
//           <TouchableOpacity
//             onPress={handleResendOtp}
//             style={[
//               styles.resendButton,
//               { opacity: timer === 0 ? 1 : 0.6 },
//             ]}
//             disabled={timer !== 0 || loading}
//             accessibilityLabel="Resend OTP Button"
//             accessibilityRole="button"
//           >
//             <Text style={[styles.resendText, { color: currentTheme.secondaryColor }]}>
//               Resend OTP
//             </Text>
//           </TouchableOpacity>
//         </Animated.View>
//       </KeyboardAvoidingView>
//     </LinearGradient>
//   );
// };

// // Styles for the components
// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//     width: '100%',
//     height: '100%',
//   },
//   overlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20, // Added padding for better spacing on small devices
//   },
//   container: {
//     alignItems: 'center',
//     width: '100%',
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginTop: 10,
//   },
//   instructions: {
//     fontSize: 16,
//     textAlign: 'center',
//     marginBottom: 20,
//     paddingHorizontal: 10, // Prevents text from touching screen edges
//   },
//   otpContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center', // Centers the OTP inputs
//     width: '80%',
//     maxWidth: 400,
//     marginBottom: 10,
//     // Adding gap using the gap property for React Native >=0.71
//     // If using an older version, adjust margins manually
//   },
//   otpInput: {
//     borderWidth: 1,
//     borderRadius: 10,
//     textAlign: 'center',
//     // width and height are set dynamically based on screen width
//     // fontSize is also adjusted
//     // backgroundColor is set dynamically
//     // color is set dynamically
//     // borderColor is set based on error state
//     // Shadow for iOS
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 1,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 1.41,
//     // Elevation for Android
//     elevation: 2,
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
//     backgroundColor: '#4CAF50', // Default primary color
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
//     backgroundColor: '#388E3C', // Darker shade while loading
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   timerContainer: {
//     marginTop: 10,
//     marginBottom: 10,
//   },
//   timerText: {
//     fontSize: 14,
//   },
//   resendButton: {
//     marginTop: 10,
//   },
//   resendText: {
//     fontSize: 16,
//     textDecorationLine: 'underline',
//   },
// });

// export default OtpScreen;
