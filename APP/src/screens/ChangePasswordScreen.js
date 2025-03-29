import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';
import { changeUserPassword } from '../services/api';
import CustomAlert from '../components/CustomAlert'; // Import your custom alert

const ChangePasswordScreen = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  const navigation = useNavigation();

  // Access theme from context
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  // ----------- Custom Alert State ----------- 
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertIcon, setAlertIcon] = useState('');
  const [alertButtons, setAlertButtons] = useState([]);
  

  // Handler to show CustomAlert easily
  const showAlert = (title, message, icon, buttons) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertIcon(icon);
    setAlertButtons(buttons);
    setAlertVisible(true);
  };

  const handleChangePassword = async () => {
    // Basic validation
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      showAlert('Error', 'All fields are required.', 'alert-circle', [
        { text: 'OK', onPress: () => setAlertVisible(false) },
      ]);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showAlert('Error', 'New password and confirm password do not match.', 'alert-circle', [
        { text: 'OK', onPress: () => setAlertVisible(false) },
      ]);
      return;
    }

    setLoading(true); // Set loading to true when the request starts

    // Call the change password API
    const response = await changeUserPassword(oldPassword, newPassword);

    setLoading(false); // Set loading to false once the response is received

    if (response.success) {
      showAlert('Success', 'Your password has been changed successfully.', 'checkmark-circle', [
        {
          text: 'OK',
          onPress: () => {
            setAlertVisible(false);
            navigation.navigate('Settings');
          },
        },
      ]);
    } else {
      showAlert('Error', response.message || 'Failed to change password.', 'close-circle', [
        { text: 'OK', onPress: () => setAlertVisible(false) },
      ]);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}
    >
      {/* Header with Linear Gradient */}
      <LinearGradient
        colors={currentTheme.headerBackground}
        style={styles.header}
        start={[0, 0]}
        end={[1, 0]}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            console.log('Back button pressed');
            navigation.navigate('Settings');
          }}
        >
          <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
        </TouchableOpacity>

        {/* Header Title */}
        <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
          Change Password
        </Text>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.subheading, { color: currentTheme.textColor }]}>
          Please fill in the details below to update your password.
        </Text>

        {/* Old Password Field */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: currentTheme.textColor }]}>
            Current Password
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed"
              size={20}
              color={currentTheme.placeholderTextColor}
              style={styles.icon}
            />
            <TextInput
              style={[
                styles.input,
                {
                  color: currentTheme.textColor,
                  borderColor: currentTheme.borderColor,
                  backgroundColor: currentTheme.cardBackground,
                },
              ]}
              placeholder="Enter your current password"
              placeholderTextColor={currentTheme.placeholderTextColor}
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
            />
          </View>
        </View>

        {/* New Password Field */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: currentTheme.textColor }]}>
            New Password
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed"
              size={20}
              color={currentTheme.placeholderTextColor}
              style={styles.icon}
            />
            <TextInput
              style={[
                styles.input,
                {
                  color: currentTheme.textColor,
                  borderColor: currentTheme.borderColor,
                  backgroundColor: currentTheme.cardBackground,
                },
              ]}
              placeholder="Enter a new password"
              placeholderTextColor={currentTheme.placeholderTextColor}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>
        </View>

        {/* Confirm New Password Field */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: currentTheme.textColor }]}>
            Confirm New Password
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed"
              size={20}
              color={currentTheme.placeholderTextColor}
              style={styles.icon}
            />
            <TextInput
              style={[
                styles.input,
                {
                  color: currentTheme.textColor,
                  borderColor: currentTheme.borderColor,
                  backgroundColor: currentTheme.cardBackground,
                },
              ]}
              placeholder="Re-enter your new password"
              placeholderTextColor={currentTheme.placeholderTextColor}
              secureTextEntry
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
            />
          </View>
        </View>

        {/* Change Password Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentTheme.primaryColor }]}
          onPress={handleChangePassword}
          disabled={loading} // Disable the button when loading
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Update Password</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* CustomAlert Component */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        icon={alertIcon}
        buttons={alertButtons}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;


/* ----------- Styles ----------- */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Android elevation
    elevation: 5,
    zIndex: 10,
  },
  backButton: {
    position: 'absolute',
    left: 15,
    padding: 15,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20, // Make sure it's above the gradient or other elements
  }, 
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  container: {
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  subheading: {
    fontSize: 16,
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
  },
  icon: {
    position: 'absolute',
    left: 10,
    zIndex: 10,
  },
  input: {
    flex: 1,
    height: 50,
    paddingLeft: 40,
    paddingRight: 10,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    marginTop: 15,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Android elevation
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

