// src/screens/SettingsScreen.js

import React, { useContext, useRef, useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Animated,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';
import { UserContext } from '../contexts/UserContext';

const { width, height } = Dimensions.get('window');

const SettingsScreen = () => {
  const navigation = useNavigation();

  // Theme & Auth
  const { theme, toggleTheme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  const { logout } = useContext(UserContext);

  // State
  const [isNotificationsEnabled, setIsNotificationsEnabled] = React.useState(true);
  const [aboutUsVisible, setAboutUsVisible] = useState(false); // Controls the About Us modal

  // Animations (optional)
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  // Interpolations for back button (if you want to animate it)
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-20deg'],
  });
  const colorInterpolate = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [currentTheme.headerTextColor, currentTheme.secondaryColor],
  });

  const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

  // Handlers
  const toggleNotifications = () => setIsNotificationsEnabled((prev) => !prev);
  const handleToggleTheme = () => toggleTheme();

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  const handleLogout = async () => {
    const response = await logout();
    // Optionally navigate to Login or show an alert
  };

  // Show About Us modal
  const handleAboutUsPress = () => {
    setAboutUsVisible(true);
  };

  // Close About Us modal
  const closeAboutUsModal = () => {
    setAboutUsVisible(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Header with LinearGradient */}
        <LinearGradient
          colors={currentTheme.headerBackground}
          style={styles.header}
          start={[0, 0]}
          end={[1, 0]}
        >
          {/* Simple Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
            Settings
          </Text>
        </LinearGradient>

        {/* Enable Notifications */}
        <TouchableOpacity
          style={[styles.settingItem1, { borderBottomColor: currentTheme.borderColor }]}
          activeOpacity={0.7}
        >
          <View style={styles.settingInfo}>
            <Ionicons
              name="notifications"
              size={24}
              color={currentTheme.primaryColor}
              style={styles.icon}
            />
            <Text style={[styles.settingText, { color: currentTheme.textColor }]}>
              Enable Notifications
            </Text>
          </View>
          <Switch
            trackColor={{
              false: currentTheme.switchTrackColorFalse,
              true: currentTheme.switchTrackColorTrue,
            }}
            thumbColor={currentTheme.switchThumbColor}
            ios_backgroundColor={currentTheme.switchIosBackgroundColor}
            onValueChange={toggleNotifications}
            value={isNotificationsEnabled}
          />
        </TouchableOpacity>

        {/* Dark Theme */}
        <TouchableOpacity
          style={[styles.settingItem1, { borderBottomColor: currentTheme.borderColor }]}
          activeOpacity={0.7}
        >
          <View style={styles.settingInfo}>
            <Ionicons
              name="moon"
              size={24}
              color={currentTheme.primaryColor}
              style={styles.icon}
            />
            <Text style={[styles.settingText, { color: currentTheme.textColor }]}>
              Dark Theme
            </Text>
          </View>
          <Switch
            trackColor={{
              false: currentTheme.switchTrackColorFalse,
              true: currentTheme.switchTrackColorTrue,
            }}
            thumbColor={currentTheme.switchThumbColor}
            ios_backgroundColor={currentTheme.switchIosBackgroundColor}
            onValueChange={handleToggleTheme}
            value={theme === 'dark'}
          />
        </TouchableOpacity>

        {/* Change Password */}
        <TouchableOpacity
          style={[styles.settingItem, { borderBottomColor: currentTheme.borderColor }]}
          onPress={() => handleNavigate('ChangePassword')}
          activeOpacity={0.7}
        >
          <View style={styles.settingInfo}>
            <Ionicons
              name="lock-closed"
              size={24}
              color={currentTheme.primaryColor}
              style={styles.icon}
            />
            <Text style={[styles.settingText, { color: currentTheme.textColor }]}>
              Change Password
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={currentTheme.placeholderTextColor}
          />
        </TouchableOpacity>

        {/* About Us (now shows a popup) */}
        <TouchableOpacity
          style={[styles.settingItem, { borderBottomColor: currentTheme.borderColor }]}
          onPress={handleAboutUsPress}
          activeOpacity={0.7}
        >
          <View style={styles.settingInfo}>
            <Ionicons
              name="information-circle"
              size={24}
              color={currentTheme.primaryColor}
              style={styles.icon}
            />
            <Text style={[styles.settingText, { color: currentTheme.textColor }]}>
              About Us
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={currentTheme.placeholderTextColor}
          />
        </TouchableOpacity>

        {/* Log Out Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.logoutButton, { backgroundColor: currentTheme.primaryColor }]}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* About Us Modal */}
      <Modal
        visible={aboutUsVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeAboutUsModal}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, { backgroundColor: currentTheme.cardBackground }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentTheme.cardTextColor }]}>
                About Us
              </Text>
              <TouchableOpacity
                onPress={closeAboutUsModal}
                style={styles.modalCloseButton}
                accessibilityLabel="Close About Us"
              >
                <Ionicons name="close" size={24} color={currentTheme.textColor} />
              </TouchableOpacity>
            </View>
            {/* Modal Body (ScrollView for content) */}
            <ScrollView>
              <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
                Welcome to House Of Cert! We are committed to providing the best
                possible experience for our users. Below is an overview of who we are and
                what we stand for.
              </Text>

              <Text style={[styles.modalHeading, { color: currentTheme.textColor }]}>
                Our Mission
              </Text>
              <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
                Our mission is to empower individuals around the world with high-quality
                learning resources and seamless shopping experiences. We believe that
                knowledge and reliable products should be accessible to everyone.
              </Text>

              <Text style={[styles.modalHeading, { color: currentTheme.textColor }]}>
                Our Team
              </Text>
              <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
                We're a diverse group of designers, developers, and industry experts
                passionate about innovation and collaboration. Each member of our team
                brings a unique perspective to help shape our platform into something
                truly special.
              </Text>

              <Text style={[styles.modalHeading, { color: currentTheme.textColor }]}>
                Our Values
              </Text>
              <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
                • Transparency: We believe in open communication with our users,
                stakeholders, and within our team.
                {'\n'}• Quality: We continuously strive to provide top-notch products and
                services.
                {'\n'}• Integrity: We conduct our business with honesty and respect.
              </Text>

              <Text style={[styles.modalHeading, { color: currentTheme.textColor }]}>
                Get in Touch
              </Text>
              <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
                If you have any questions, feel free to reach out to our team at
                Idri.gueye@gmail.com. Thank you for choosing us and being a part of our
                growing community!
              </Text>
            </ScrollView>
            {/* Close Button */}
            <TouchableOpacity
              onPress={closeAboutUsModal}
              style={[
                styles.closeModalButton,
                { backgroundColor: currentTheme.primaryColor },
              ]}
              accessibilityLabel="Close About Us Popup"
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SettingsScreen;

/* ------------------- Styles ------------------- */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    position: 'absolute',
    left: 15,
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingItem1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  icon: {
    marginRight: 15,
  },
  logoutButton: {
    marginTop: 40,
    paddingVertical: 15,
    marginHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 4,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  /* Modal Styles */
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 20,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 20,
  },
  closeModalButton: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

























// // src/screens/SettingsScreen.js

// import React, { useContext, useRef } from 'react';
// import {
//   View,
//   Text,
//   Switch,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   SafeAreaView,
//   Animated,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { UserContext } from '../contexts/UserContext';

// const SettingsScreen = () => {
//   const navigation = useNavigation();

//   const { theme, toggleTheme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const { logout } = useContext(UserContext);

//   const [isNotificationsEnabled, setIsNotificationsEnabled] = React.useState(true);

//   const toggleNotifications = () =>
//     setIsNotificationsEnabled((previous) => !previous);

//   const handleToggleTheme = () => {
//     toggleTheme();
//   };

//   const handleNavigate = (screen) => {
//     navigation.navigate(screen);
//   };

//   const handleLogout = async () => {
//     const response = await logout();
//     // You may navigate to 'Login' or show an alert
//   };

//   // Optional: Animated back button references & logic
//   const scaleAnim = useRef(new Animated.Value(1)).current;
//   const rotateAnim = useRef(new Animated.Value(0)).current;
//   const colorAnim = useRef(new Animated.Value(0)).current;

//   const rotateInterpolate = rotateAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: ['0deg', '-20deg'],
//   });
//   const colorInterpolate = colorAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [currentTheme.headerTextColor, currentTheme.secondaryColor],
//   });
//   const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

//   return (
//     <SafeAreaView
//       style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}
//     >
//       <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
//         <LinearGradient
//           colors={currentTheme.headerBackground}
//           style={styles.header}
//           start={[0, 0]}
//           end={[1, 0]}
//         >
//           {/* Simple Back Button (no animation) */}
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={() => navigation.goBack()}
//           >
//             <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
//           </TouchableOpacity>
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//             Settings
//           </Text>
//         </LinearGradient>

//         {/* Enable Notifications */}
//         <TouchableOpacity
//           style={[styles.settingItem1, { borderBottomColor: currentTheme.borderColor }]}
//           activeOpacity={0.7}
//         >
//           <View style={styles.settingInfo}>
//             <Ionicons
//               name="notifications"
//               size={24}
//               color={currentTheme.primaryColor}
//               style={styles.icon}
//             />
//             <Text style={[styles.settingText, { color: currentTheme.textColor }]}>
//               Enable Notifications
//             </Text>
//           </View>
//           <Switch
//             trackColor={{
//               false: currentTheme.switchTrackColorFalse,
//               true: currentTheme.switchTrackColorTrue,
//             }}
//             thumbColor={currentTheme.switchThumbColor}
//             ios_backgroundColor={currentTheme.switchIosBackgroundColor}
//             onValueChange={toggleNotifications}
//             value={isNotificationsEnabled}
//           />
//         </TouchableOpacity>

//         {/* Dark Theme */}
//         <TouchableOpacity
//           style={[styles.settingItem1, { borderBottomColor: currentTheme.borderColor }]}
//           activeOpacity={0.7}
//         >
//           <View style={styles.settingInfo}>
//             <Ionicons
//               name="moon"
//               size={24}
//               color={currentTheme.primaryColor}
//               style={styles.icon}
//             />
//             <Text style={[styles.settingText, { color: currentTheme.textColor }]}>
//               Dark Theme
//             </Text>
//           </View>
//           <Switch
//             trackColor={{
//               false: currentTheme.switchTrackColorFalse,
//               true: currentTheme.switchTrackColorTrue,
//             }}
//             thumbColor={currentTheme.switchThumbColor}
//             ios_backgroundColor={currentTheme.switchIosBackgroundColor}
//             onValueChange={handleToggleTheme}
//             value={theme === 'dark'}
//           />
//         </TouchableOpacity>

//         {/* Change Password */}
//         <TouchableOpacity
//           style={[styles.settingItem, { borderBottomColor: currentTheme.borderColor }]}
//           onPress={() => handleNavigate('ChangePassword')}
//           activeOpacity={0.7}
//         >
//           <View style={styles.settingInfo}>
//             <Ionicons
//               name="lock-closed"
//               size={24}
//               color={currentTheme.primaryColor}
//               style={styles.icon}
//             />
//             <Text style={[styles.settingText, { color: currentTheme.textColor }]}>
//               Change Password
//             </Text>
//           </View>
//           <Ionicons
//             name="chevron-forward"
//             size={24}
//             color={currentTheme.placeholderTextColor}
//           />
//         </TouchableOpacity>

//         {/* Language */}
//         {/* <TouchableOpacity
//           style={[styles.settingItem, { borderBottomColor: currentTheme.borderColor }]}
//           onPress={() => handleNavigate('LanguageSettings')}
//           activeOpacity={0.7}
//         >
//           <View style={styles.settingInfo}>
//             <Ionicons
//               name="language"
//               size={24}
//               color={currentTheme.primaryColor}
//               style={styles.icon}
//             />
//             <Text style={[styles.settingText, { color: currentTheme.textColor }]}>
//               Language
//             </Text>
//           </View>
//           <Ionicons
//             name="chevron-forward"
//             size={24}
//             color={currentTheme.placeholderTextColor}
//           />
//         </TouchableOpacity> */}

//         {/* About Us */}
//         <TouchableOpacity
//           style={[styles.settingItem, { borderBottomColor: currentTheme.borderColor }]}
//           onPress={() => handleNavigate('MarketHome')}
//           activeOpacity={0.7}
//         >
//           <View style={styles.settingInfo}>
//             <Ionicons
//               name="information-circle"
//               size={24}
//               color={currentTheme.primaryColor}
//               style={styles.icon}
//             />
//             <Text style={[styles.settingText, { color: currentTheme.textColor }]}>
//               About Us
//             </Text>
//           </View>
//           <Ionicons
//             name="chevron-forward"
//             size={24}
//             color={currentTheme.placeholderTextColor}
//           />
//         </TouchableOpacity>

//         {/* Log Out Button */}
//         <TouchableOpacity
//           onPress={handleLogout}
//           style={[styles.logoutButton, { backgroundColor: currentTheme.primaryColor }]}
//           activeOpacity={0.7}
//         >
//           <Text style={styles.logoutText}>Log Out</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default SettingsScreen;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 15,
//     paddingHorizontal: 15,
//     justifyContent: 'center',
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   backButton: {
//     position: 'absolute',
//     left: 15,
//     padding: 8,
//     borderRadius: 20,
//   },
//   headerTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//   },
//   settingItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 21,
//     paddingHorizontal: 15,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//   },
//   settingItem1: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//   },
//   settingInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   settingText: {
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   icon: {
//     marginRight: 15,
//   },
//   logoutButton: {
//     marginTop: 40,
//     paddingVertical: 15,
//     marginHorizontal: 20,
//     borderRadius: 10,
//     alignItems: 'center',
//     elevation: 4,
//     // iOS shadow
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//   },
//   logoutText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: '600',
//   },
// });
