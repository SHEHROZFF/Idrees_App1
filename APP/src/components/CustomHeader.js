// components/CustomHeader.js

import React, { useContext } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../ThemeContext';
import { CartContext } from '../contexts/CartContext'; // Ensure correct path
import { lightTheme, darkTheme } from '../../themes';
import { LinearGradient } from 'expo-linear-gradient';
import { UserContext } from '../contexts/UserContext';

const DEFAULT_PROFILE_IMAGE = 'https://w7.pngwing.com/pngs/684/806/png-transparent-user-avatar-enter-photo-placeholder.png';

const CustomHeader = ({ userProfileImage = DEFAULT_PROFILE_IMAGE, username = 'John Doe' }) => {
  const { theme } = useContext(ThemeContext);
  const { cartItems } = useContext(CartContext);
  const navigation = useNavigation();
  const { user } = useContext(UserContext);
  ;
  

  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  return (
    <LinearGradient
      colors={currentTheme.headerBackground}
      style={styles.headerContainer}
      start={[0, 1]}
      end={[0, 0]}
    >
      {/* User Info */}
      <TouchableOpacity
        style={styles.userInfoContainer}
        onPress={() => navigation.navigate('UserProfile')}
        accessibilityLabel="Go to Profile"
        accessibilityRole="button"
      >
        <Image
          source={{ uri: user.data.profileImage || DEFAULT_PROFILE_IMAGE }}
          style={[
            styles.profileImage,
            { borderColor: currentTheme.borderColor },
          ]}
          accessibilityLabel={`${username}'s profile picture`}
          onError={(e) => {
            console.log(`Failed to load profile image for ${username}:`, e.nativeEvent.error);
          }}
        />
        <Text style={[styles.username, { color: currentTheme.headerTextColor }]}>
          {user.data.name}
        </Text>
      </TouchableOpacity>

      {/* Right Buttons */}
      <View style={styles.rightButtonsContainer}>
        {/* Cart Button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('CartPage')}
          accessibilityLabel="Go to Cart"
          accessibilityRole="button"
        >
          <Ionicons name="cart-outline" size={24} color={currentTheme.headerTextColor} />
          {cartItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Settings Button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Settings')}
          accessibilityLabel="Go to Settings"
          accessibilityRole="button"
        >
          <Ionicons name="settings-outline" size={24} color={currentTheme.headerTextColor} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 20 : 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1, 
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 18,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: '#ccc', // Placeholder background color
  },
  rightButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginLeft: 15,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: '#E53935',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default CustomHeader;




// // components/CustomHeader.js

// import React, { useRef, useContext } from 'react';
// import {
//   View,
//   TouchableWithoutFeedback,
//   Image,
//   StyleSheet,
//   Animated,
//   Text,
//   Platform,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';
// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { LinearGradient } from 'expo-linear-gradient';

// const DEFAULT_PROFILE_IMAGE = 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg';

// const CustomHeader = ({ userProfileImage = DEFAULT_PROFILE_IMAGE, username = 'User' }) => {
//   const navigation = useNavigation();

//   // Animation refs
//   const scaleAnim = useRef(new Animated.Value(1)).current; // For scaling
//   const rotateAnim = useRef(new Animated.Value(0)).current; // For rotation
//   const colorAnim = useRef(new Animated.Value(0)).current; // For color interpolation

//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Interpolate rotation from 0deg to -20deg on press
//   const rotateInterpolate = rotateAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: ['0deg', '-20deg'],
//   });

//   // Interpolate color from arrowColor to secondaryColor on press
//   const colorInterpolate = colorAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [currentTheme.arrowColor, currentTheme.secondaryColor],
//   });

//   const handlePressIn = () => {
//     // Animate to pressed state
//     Animated.parallel([
//       Animated.spring(scaleAnim, {
//         toValue: 0.9,
//         friction: 4,
//         useNativeDriver: true,
//       }),
//       Animated.timing(rotateAnim, {
//         toValue: 1,
//         duration: 200,
//         useNativeDriver: true,
//       }),
//       Animated.timing(colorAnim, {
//         toValue: 1,
//         duration: 200,
//         useNativeDriver: false, // Color interpolation doesn't support native driver
//       }),
//     ]).start();
//   };

//   const handlePressOut = () => {
//     // Animate back to original state
//     Animated.parallel([
//       Animated.spring(scaleAnim, {
//         toValue: 1,
//         friction: 4,
//         useNativeDriver: true,
//       }),
//       Animated.timing(rotateAnim, {
//         toValue: 0,
//         duration: 200,
//         useNativeDriver: true,
//       }),
//       Animated.timing(colorAnim, {
//         toValue: 0,
//         duration: 200,
//         useNativeDriver: false,
//       }),
//     ]).start(() => {
//       navigation.goBack();
//     });
//   };

//   return (
//     <LinearGradient
//       colors={currentTheme.headerBackground}
//       style={styles.headerContainer}
//       start={[0, 0]}
//       end={[1, 0]}
//     >
//       {/* Back Button with Enhanced Animation */}
//       <TouchableWithoutFeedback
//         onPressIn={handlePressIn}
//         onPressOut={handlePressOut}
//         accessibilityLabel="Go Back"
//         accessibilityRole="button"
//       >
//         <Animated.View
//           style={[
//             styles.backButton,
//             {
//               transform: [{ scale: scaleAnim }, { rotate: rotateInterpolate }],
//             },
//           ]}
//         >
//           <AnimatedIonicons name="arrow-back" size={24} color={colorInterpolate} />
//         </Animated.View>
//       </TouchableWithoutFeedback>

//       {/* User Info */}
//       <View style={styles.userInfoContainer}>
//         <Text style={[styles.username, { color: currentTheme.headerTextColor }]}>
//           {username}
//         </Text>
//         <Image
//           source={{ uri: userProfileImage }}
//           style={[
//             styles.profileImage,
//             { borderColor: currentTheme.borderColor },
//           ]}
//           accessibilityLabel={`${username}'s profile picture`}
//           onError={(e) => {
//             console.log(`Failed to load profile image for ${username}: `, e.nativeEvent.error);
//             // Optionally, set a default image or handle the error as needed
//           }}
//         />
//       </View>
//     </LinearGradient>
//   );
// };

// // Custom Animated Ionicons component to handle color interpolation
// const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

// const styles = StyleSheet.create({
//   headerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 15,
//     paddingVertical: Platform.OS === 'ios' ? 40 : 15, // Adjust for status bar
//     // Shadow for iOS
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     // Elevation for Android
//     elevation: 5,
//   },
//   backButton: {
//     padding: 10,
//     borderRadius: 20,
//     // Optional: Add background color or ripple effect
//     // backgroundColor: 'rgba(255,255,255,0.2)',
//   },
//   userInfoContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   username: {
//     fontSize: 16,
//     marginRight: 10,
//     fontWeight: '600',
//   },
//   profileImage: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     borderWidth: 2,
//     backgroundColor: '#ccc', // Placeholder background color
//   },
// });

// export default CustomHeader;
