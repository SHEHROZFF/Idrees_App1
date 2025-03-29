// src/components/EditProfilePopup.js

import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';
import CustomAlert from '../components/CustomAlert';

const { width, height } = Dimensions.get('window');

const EditProfilePopup = ({ visible, onClose, userData, onSave }) => {
  const [name, setName] = useState(userData.name || '');
  const [email, setEmail] = useState(userData.email || '');
  const [phone, setPhone] = useState(userData.phone || '');
  const [address, setAddress] = useState(userData.address || '');

  // State variables for image URLs
  const [profileImageUrl, setProfileImageUrl] = useState(userData.profileImage || '');
  const [coverImageUrl, setCoverImageUrl] = useState(userData.coverImage || '');

  // State variables for image load errors
  const [profileImageError, setProfileImageError] = useState(false);
  const [coverImageError, setCoverImageError] = useState(false);

  // Access the current theme
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  // State for controlling the CustomAlert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertIcon, setAlertIcon] = useState('');
  const [alertButtons, setAlertButtons] = useState([]);

  useEffect(() => {
    setName(userData.name || '');
    setEmail(userData.email || '');
    setPhone(userData.phone || '');
    setAddress(userData.address || '');
    setProfileImageUrl(userData.profileImage || '');
    setCoverImageUrl(userData.coverImage || '');
  }, [userData]);

  // Validate image URLs
  const isValidImageUrl = (url) => {
    const regex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|jpeg)$/i;
    return regex.test(url);
  };

  // Email validation
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Phone number validation
  const isValidPhoneNumber = (phone) => {
    const regex = /^\+?[0-9]{7,15}$/;
    return regex.test(phone);
  };

  const showAlert = (title, message, icon) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertIcon(icon);
    setAlertButtons([
      {
        text: 'OK',
        onPress: () => setAlertVisible(false),
      },
    ]);
    setAlertVisible(true);
  };

  const handleSave = () => {
    // Perform validation
    if (!name || !email) {
      showAlert('Validation Error', 'Name and email are required.', 'alert-circle');
      return;
    }
    if (email && !isValidEmail(email)) {
      showAlert('Invalid Email', 'Please enter a valid email address.', 'alert-circle');
      return;
    }
    if (phone && !isValidPhoneNumber(phone)) {
      showAlert('Invalid Phone Number', 'Please enter a valid phone number.', 'alert-circle');
      return;
    }
    if (profileImageUrl && !isValidImageUrl(profileImageUrl)) {
      showAlert(
        'Invalid URL',
        'Please enter a valid image URL for the profile image.',
        'alert-circle'
      );
      return;
    }
    if (coverImageUrl && !isValidImageUrl(coverImageUrl)) {
      showAlert(
        'Invalid URL',
        'Please enter a valid image URL for the cover image.',
        'alert-circle'
      );
      return;
    }

    const updatedData = {
      ...userData,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      profileImage: profileImageUrl.trim(),
      coverImage: coverImageUrl.trim(),
    };

    onSave(updatedData);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View
          style={[
            styles.modalInnerContainer,
            { backgroundColor: currentTheme.cardBackground },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentTheme.cardTextColor }]}>
                Edit Profile
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={currentTheme.textColor} />
              </TouchableOpacity>
            </View>

            {/* Profile Image Section */}
            <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>
              Profile Photo
            </Text>
            <View style={styles.imageSection}>
              {profileImageUrl ? (
                <Image
                  source={{ uri: profileImageUrl }}
                  style={styles.profileImagePreview}
                  onError={() => setProfileImageError(true)}
                />
              ) : (
                <View
                  style={[
                    styles.placeholderImage,
                    { backgroundColor: currentTheme.backgroundColor },
                  ]}
                >
                  <Ionicons name="person-outline" size={50} color={currentTheme.placeholderTextColor} />
                </View>
              )}
              {profileImageError && (
                <Text style={styles.errorText}>Failed to load profile image.</Text>
              )}
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: currentTheme.backgroundColor,
                    color: currentTheme.textColor,
                    borderColor: currentTheme.borderColor,
                  },
                ]}
                value={profileImageUrl}
                onChangeText={(text) => {
                  setProfileImageUrl(text);
                  if (isValidImageUrl(text)) {
                    setProfileImageError(false);
                  }
                }}
                placeholder="Enter profile image URL"
                placeholderTextColor={currentTheme.placeholderTextColor}
                autoCapitalize="none"
                accessibilityLabel="Profile Image URL Input"
              />
            </View>

            {/* Cover Image Section */}
            <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>
              Cover Photo
            </Text>
            <View style={styles.imageSection}>
              {coverImageUrl ? (
                <Image
                  source={{ uri: coverImageUrl }}
                  style={styles.coverImagePreview}
                  onError={() => setCoverImageError(true)}
                />
              ) : (
                <View
                  style={[
                    styles.placeholderCoverImage,
                    { backgroundColor: currentTheme.backgroundColor },
                  ]}
                >
                  <Ionicons name="image-outline" size={50} color={currentTheme.placeholderTextColor} />
                </View>
              )}
              {coverImageError && (
                <Text style={styles.errorText}>Failed to load cover image.</Text>
              )}
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: currentTheme.backgroundColor,
                    color: currentTheme.textColor,
                    borderColor: currentTheme.borderColor,
                  },
                ]}
                value={coverImageUrl}
                onChangeText={(text) => {
                  setCoverImageUrl(text);
                  if (isValidImageUrl(text)) {
                    setCoverImageError(false);
                  }
                }}
                placeholder="Enter cover image URL"
                placeholderTextColor={currentTheme.placeholderTextColor}
                autoCapitalize="none"
                accessibilityLabel="Cover Image URL Input"
              />
            </View>

            {/* Other Profile Fields */}
            <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>
              Personal Details
            </Text>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: currentTheme.textColor }]}>Name</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: currentTheme.backgroundColor,
                    color: currentTheme.textColor,
                    borderColor: currentTheme.borderColor,
                  },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={currentTheme.placeholderTextColor}
                accessibilityLabel="Name Input"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: currentTheme.textColor }]}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: currentTheme.backgroundColor,
                    color: currentTheme.textColor,
                    borderColor: currentTheme.borderColor,
                  },
                ]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={currentTheme.placeholderTextColor}
                accessibilityLabel="Email Input"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: currentTheme.textColor }]}>Phone Number</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: currentTheme.backgroundColor,
                    color: currentTheme.textColor,
                    borderColor: currentTheme.borderColor,
                  },
                ]}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                placeholderTextColor={currentTheme.placeholderTextColor}
                accessibilityLabel="Phone Number Input"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: currentTheme.textColor }]}>Address</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    height: 80,
                    backgroundColor: currentTheme.backgroundColor,
                    color: currentTheme.textColor,
                    borderColor: currentTheme.borderColor,
                  },
                ]}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your address"
                multiline
                numberOfLines={3}
                placeholderTextColor={currentTheme.placeholderTextColor}
                accessibilityLabel="Address Input"
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: currentTheme.primaryColor }]}
              onPress={handleSave}
              accessibilityLabel="Save Profile"
              accessibilityRole="button"
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* CustomAlert Component */}
          <CustomAlert
            visible={alertVisible}
            title={alertTitle}
            message={alertMessage}
            icon={alertIcon}
            onClose={() => setAlertVisible(false)}
            buttons={alertButtons}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditProfilePopup;

/* ------------------- Enhanced Styles ------------------- */
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalInnerContainer: {
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    width: '90%',
    maxHeight: '90%',
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  imageSection: {
    marginBottom: 20,
  },
  profileImagePreview: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: (width * 0.3) / 2,
    alignSelf: 'center',
    marginBottom: 10,
    // Optional Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  coverImagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 10,
    // Optional Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  placeholderImage: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: (width * 0.3) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  placeholderCoverImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  inputContainer: {
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 14,
    marginBottom: 5,
  },
  saveButton: {
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 5,
  },
});


















// // src/components/EditProfilePopup.js

// import React, { useState, useContext, useEffect } from 'react';
// import {
//   View,
//   Text,
//   Modal,
//   TouchableOpacity,
//   TextInput,
//   StyleSheet,
//   Alert,
//   ScrollView,
//   KeyboardAvoidingView,
//   Platform,
//   Image,
//   Dimensions,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { ThemeContext } from '../../ThemeContext'; // Import ThemeContext
// import { lightTheme, darkTheme } from '../../themes'; // Import theme definitions
// import CustomAlert from '../components/CustomAlert'; // Import CustomAlert

// const { width, height } = Dimensions.get('window');

// const EditProfilePopup = ({ visible, onClose, userData, onSave }) => {
//   const [name, setName] = useState(userData.name || '');
//   const [email, setEmail] = useState(userData.email || '');
//   const [phone, setPhone] = useState(userData.phone || '');
//   const [address, setAddress] = useState(userData.address || '');

//   // State variables for image URLs
//   const [profileImageUrl, setProfileImageUrl] = useState(userData.profileImage || '');
//   const [coverImageUrl, setCoverImageUrl] = useState(userData.coverImage || '');

//   // State variables for image load errors
//   const [profileImageError, setProfileImageError] = useState(false);
//   const [coverImageError, setCoverImageError] = useState(false);

//   // Access the current theme
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//     // State for controlling the CustomAlert
//     const [alertVisible, setAlertVisible] = useState(false);
//     const [alertTitle, setAlertTitle] = useState('');
//     const [alertMessage, setAlertMessage] = useState('');
//     const [alertIcon, setAlertIcon] = useState('');
//     const [alertButtons, setAlertButtons] = useState([]);
  

//   useEffect(() => {
//     setName(userData.name || '');
//     setEmail(userData.email || '');
//     setPhone(userData.phone || '');
//     setAddress(userData.address || '');
//     setProfileImageUrl(userData.profileImage || '');
//     setCoverImageUrl(userData.coverImage || '');
//   }, [userData]);

//   // Validate image URLs
//   const isValidImageUrl = (url) => {
//     const regex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|jpeg)$/i;
//     return regex.test(url);
//   };

//   // Email validation
//   const isValidEmail = (email) => {
//     const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return regex.test(email);
//   };

//   // Phone number validation
//   const isValidPhoneNumber = (phone) => {
//     const regex = /^\+?[0-9]{7,15}$/;
//     return regex.test(phone);
//   };

//   const handleSave = () => {
//     // Perform validation
//     if (!name || !email) {
//       // Alert.alert('Validation Error', 'Name and email are required.');
//       setAlertTitle('Validation Error');
//       setAlertMessage('Name and email are required.');
//       setAlertIcon('profile');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => setAlertVisible(false),
//         },
//       ]);
//       setAlertVisible(true);
//       return;
//     }

//     if (email && !isValidEmail(email)) {
//       // Alert.alert('Invalid Email', 'Please enter a valid email address.');
//       setAlertTitle('Invalid Email');
//       setAlertMessage('Please enter a valid email address.');
//       setAlertIcon('profile');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => setAlertVisible(false),
//         },
//       ]);
//       setAlertVisible(true);
//       return;
//     }

//     if (phone && !isValidPhoneNumber(phone)) {
//       // Alert.alert('Invalid Phone Number', 'Please enter a valid phone number.');
//       setAlertTitle('Invalid Phone Number');
//       setAlertMessage('Please enter a valid phone number.');
//       setAlertIcon('profile');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => setAlertVisible(false),
//         },
//       ]);
//       setAlertVisible(true);
//       return;
//     }

//     if (profileImageUrl && !isValidImageUrl(profileImageUrl)) {
//       // Alert.alert('Invalid URL', 'Please enter a valid image URL for the profile image.');
//       setAlertTitle('Invalid URL');
//       setAlertMessage('Please enter a valid image URL for the profile image.');
//       setAlertIcon('profile');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => setAlertVisible(false),
//         },
//       ]);
//       setAlertVisible(true);
//       return;
//     }

//     if (coverImageUrl && !isValidImageUrl(coverImageUrl)) {
//       // Alert.alert('Invalid URL', 'Please enter a valid image URL for the cover image.');
//       setAlertTitle('Invalid URL');
//       setAlertMessage('Please enter a valid image URL for the cover image.');
//       setAlertIcon('profile');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => setAlertVisible(false),
//         },
//       ]);
//       setAlertVisible(true);
//       return;
//     }

//     const updatedData = {
//       ...userData,
//       name: name.trim(),
//       email: email.trim(),
//       phone: phone.trim(),
//       address: address.trim(),
//       profileImage: profileImageUrl.trim(),
//       coverImage: coverImageUrl.trim(),
//     };

//     onSave(updatedData);
//     onClose();

//     // Optional: Provide feedback to the user
//     // Alert.alert('Success', 'Your profile has been updated successfully.');
//   };

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       transparent={true}
//       onRequestClose={onClose}
//     >
//       <KeyboardAvoidingView
//         style={styles.modalContainer}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       >
//         <View style={[styles.modalInnerContainer, { backgroundColor: currentTheme.cardBackground }]}>
//           <ScrollView
//             contentContainerStyle={styles.modalContent}
//             keyboardShouldPersistTaps="handled"
//             showsVerticalScrollIndicator={false}
//           >
//             {/* Header */}
//             <View style={styles.modalHeader}>
//               <Text style={[styles.modalTitle, { color: currentTheme.cardTextColor }]}>
//                 Edit Profile
//               </Text>
//               <TouchableOpacity onPress={onClose} style={styles.closeButton}>
//                 <Ionicons name="close" size={24} color={currentTheme.textColor} />
//               </TouchableOpacity>
//             </View>

//             {/* Profile Image URL */}
//             <View style={styles.inputContainer}>
//               <Text style={[styles.label, { color: currentTheme.textColor }]}>Profile Image URL</Text>
//               {profileImageUrl ? (
//                 <Image
//                   source={{ uri: profileImageUrl }}
//                   style={styles.profileImagePreview}
//                   onError={() => setProfileImageError(true)}
//                 />
//               ) : (
//                 <View style={[styles.placeholderImage, { backgroundColor: currentTheme.backgroundColor }]}>
//                   <Ionicons name="person-outline" size={50} color={currentTheme.placeholderTextColor} />
//                 </View>
//               )}
//               {profileImageError && (
//                 <Text style={styles.errorText}>Failed to load profile image.</Text>
//               )}
//               <TextInput
//                 style={[
//                   styles.input,
//                   {
//                     backgroundColor: currentTheme.backgroundColor,
//                     color: currentTheme.textColor,
//                     borderColor: currentTheme.borderColor,
//                   },
//                 ]}
//                 value={profileImageUrl}
//                 onChangeText={(text) => {
//                   setProfileImageUrl(text);
//                   if (isValidImageUrl(text)) {
//                     setProfileImageError(false);
//                   }
//                 }}
//                 placeholder="Enter profile image URL"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 autoCapitalize="none"
//                 accessibilityLabel="Profile Image URL Input"
//               />
//             </View>

//             {/* Cover Image URL */}
//             <View style={styles.inputContainer}>
//               <Text style={[styles.label, { color: currentTheme.textColor }]}>Cover Image URL</Text>
//               {coverImageUrl ? (
//                 <Image
//                   source={{ uri: coverImageUrl }}
//                   style={styles.coverImagePreview}
//                   onError={() => setCoverImageError(true)}
//                 />
//               ) : (
//                 <View style={[styles.placeholderCoverImage, { backgroundColor: currentTheme.backgroundColor }]}>
//                   <Ionicons name="image-outline" size={50} color={currentTheme.placeholderTextColor} />
//                 </View>
//               )}
//               {coverImageError && (
//                 <Text style={styles.errorText}>Failed to load cover image.</Text>
//               )}
//               <TextInput
//                 style={[
//                   styles.input,
//                   {
//                     backgroundColor: currentTheme.backgroundColor,
//                     color: currentTheme.textColor,
//                     borderColor: currentTheme.borderColor,
//                   },
//                 ]}
//                 value={coverImageUrl}
//                 onChangeText={(text) => {
//                   setCoverImageUrl(text);
//                   if (isValidImageUrl(text)) {
//                     setCoverImageError(false);
//                   }
//                 }}
//                 placeholder="Enter cover image URL"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 autoCapitalize="none"
//                 accessibilityLabel="Cover Image URL Input"
//               />
//             </View>

//             {/* Other Profile Fields */}
//             <View style={styles.inputContainer}>
//               <Text style={[styles.label, { color: currentTheme.textColor }]}>Name</Text>
//               <TextInput
//                 style={[
//                   styles.input,
//                   {
//                     backgroundColor: currentTheme.backgroundColor,
//                     color: currentTheme.textColor,
//                     borderColor: currentTheme.borderColor,
//                   },
//                 ]}
//                 value={name}
//                 onChangeText={setName}
//                 placeholder="Enter your name"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 accessibilityLabel="Name Input"
//               />
//             </View>
//             <View style={styles.inputContainer}>
//               <Text style={[styles.label, { color: currentTheme.textColor }]}>Email</Text>
//               <TextInput
//                 style={[
//                   styles.input,
//                   {
//                     backgroundColor: currentTheme.backgroundColor,
//                     color: currentTheme.textColor,
//                     borderColor: currentTheme.borderColor,
//                   },
//                 ]}
//                 value={email}
//                 onChangeText={setEmail}
//                 placeholder="Enter your email"
//                 keyboardType="email-address"
//                 autoCapitalize="none"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 accessibilityLabel="Email Input"
//               />
//             </View>
//             <View style={styles.inputContainer}>
//               <Text style={[styles.label, { color: currentTheme.textColor }]}>Phone Number</Text>
//               <TextInput
//                 style={[
//                   styles.input,
//                   {
//                     backgroundColor: currentTheme.backgroundColor,
//                     color: currentTheme.textColor,
//                     borderColor: currentTheme.borderColor,
//                   },
//                 ]}
//                 value={phone}
//                 onChangeText={setPhone}
//                 placeholder="Enter your phone number"
//                 keyboardType="phone-pad"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 accessibilityLabel="Phone Number Input"
//               />
//             </View>
//             <View style={styles.inputContainer}>
//               <Text style={[styles.label, { color: currentTheme.textColor }]}>Address</Text>
//               <TextInput
//                 style={[
//                   styles.input,
//                   {
//                     height: 80,
//                     backgroundColor: currentTheme.backgroundColor,
//                     color: currentTheme.textColor,
//                     borderColor: currentTheme.borderColor,
//                   },
//                 ]}
//                 value={address}
//                 onChangeText={setAddress}
//                 placeholder="Enter your address"
//                 multiline
//                 numberOfLines={3}
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 accessibilityLabel="Address Input"
//               />
//             </View>

//             {/* Save Button */}
//             <TouchableOpacity
//               style={[styles.saveButton, { backgroundColor: currentTheme.primaryColor }]}
//               onPress={handleSave}
//               accessibilityLabel="Save Profile"
//               accessibilityRole="button"
//             >
//               <Text style={styles.saveButtonText}>Save</Text>
//             </TouchableOpacity>
//               {/* CustomAlert Component */}
//             <CustomAlert
//               visible={alertVisible}
//               title={alertTitle}
//               message={alertMessage}
//               icon={alertIcon}
//               onClose={() => setAlertVisible(false)}
//               buttons={alertButtons}
//             />
//           </ScrollView>
//         </View>
//       </KeyboardAvoidingView>
//     </Modal>
//   );
// };

// // Styles for EditProfilePopup
// const styles = StyleSheet.create({
//   modalContainer: {
//     flex: 1,
//     backgroundColor: '#000000AA', // Semi-transparent background
//     justifyContent: 'center', // Center vertically
//     alignItems: 'center', // Center horizontally
//   },
//   modalInnerContainer: {
//     borderRadius: 10,
//     padding: 20,
//     elevation: 5,
//     width: '90%',
//     maxHeight: '90%', // Ensure it doesn't exceed screen height
//   },
//   modalContent: {
//     flexGrow: 1,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//   },
//   closeButton: {
//     padding: 5,
//   },
//   inputContainer: {
//     marginTop: 15,
//   },
//   label: {
//     fontSize: 14,
//     marginBottom: 5,
//     fontWeight: '500',
//   },
//   input: {
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     paddingVertical: Platform.OS === 'ios' ? 12 : 8,
//     fontSize: 14,
//     marginBottom: 10,
//   },
//   profileImagePreview: {
//     width: width * 0.3,
//     height: width * 0.3,
//     borderRadius: (width * 0.3) / 2,
//     alignSelf: 'center',
//     marginBottom: 10,
//   },
//   coverImagePreview: {
//     width: '100%',
//     height: 150,
//     borderRadius: 10,
//     alignSelf: 'center',
//     marginBottom: 10,
//   },
//   placeholderImage: {
//     width: width * 0.3,
//     height: width * 0.3,
//     borderRadius: (width * 0.3) / 2,
//     justifyContent: 'center',
//     alignItems: 'center',
//     alignSelf: 'center',
//     marginBottom: 10,
//   },
//   placeholderCoverImage: {
//     width: '100%',
//     height: 150,
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     alignSelf: 'center',
//     marginBottom: 10,
//   },
//   saveButton: {
//     paddingVertical: 12,
//     borderRadius: 8,
//     marginTop: 25,
//     alignItems: 'center',
//   },
//   saveButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   errorText: {
//     color: 'red',
//     fontSize: 12,
//     textAlign: 'center',
//     marginBottom: 5,
//   },
// });

// export default EditProfilePopup;











// // src/components/EditProfilePopup.js

// import React, { useState, useContext, useEffect } from 'react';
// import {
//   View,
//   Text,
//   Modal,
//   TouchableOpacity,
//   TextInput,
//   StyleSheet,
//   Alert,
//   ScrollView,
//   KeyboardAvoidingView,
//   Platform,
//   Image,
//   Dimensions,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import * as ImagePicker from 'expo-image-picker'; // Import ImagePicker
// import { ThemeContext } from '../../ThemeContext'; // Import ThemeContext
// import { lightTheme, darkTheme } from '../../themes'; // Import theme definitions

// const { width, height } = Dimensions.get('window');

// const EditProfilePopup = ({ visible, onClose, userData, onSave }) => {
//   const [name, setName] = useState(userData.name || '');
//   const [email, setEmail] = useState(userData.email || '');
//   const [phone, setPhone] = useState(userData.phone || '');
//   const [address, setAddress] = useState(userData.address || '');

//   // State variables for image URLs and selected images
//   const [profileImage, setProfileImage] = useState(userData.profileImage || '');
//   const [coverImage, setCoverImage] = useState(userData.coverImage || '');
//   const [profileImageUrl, setProfileImageUrl] = useState('');
//   const [coverImageUrl, setCoverImageUrl] = useState('');

//   // State variables for image load errors
//   const [profileImageError, setProfileImageError] = useState(false);
//   const [coverImageError, setCoverImageError] = useState(false);

//   // Access the current theme
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   useEffect(() => {
//     setName(userData.name || '');
//     setEmail(userData.email || '');
//     setPhone(userData.phone || '');
//     setAddress(userData.address || '');
//     setProfileImage(userData.profileImage || '');
//     setCoverImage(userData.coverImage || '');
//   }, [userData]);

//   // Request media library permissions
//   useEffect(() => {
//     (async () => {
//       if (Platform.OS !== 'web') {
//         const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//         if (status !== 'granted') {
//           Alert.alert(
//             'Permission Required',
//             'Sorry, we need camera roll permissions to make this work!'
//           );
//         }
//       }
//     })();
//   }, []);

//   // Function to pick profile image
//   const pickProfileImage = async () => {
//     try {
//       let result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: [1, 1], // Square aspect for profile
//         quality: 0.7,
//       });

//       if (!result.cancelled) {
//         setProfileImage(result.uri);
//         setProfileImageUrl(''); // Clear URL input if image is selected
//         setProfileImageError(false); // Reset error state
//       }
//     } catch (error) {
//       console.error('Error picking profile image:', error);
//       Alert.alert('Error', 'Failed to pick profile image.');
//     }
//   };

//   // Function to pick cover image
//   const pickCoverImage = async () => {
//     try {
//       let result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: [16, 9], // Wide aspect for cover
//         quality: 0.7,
//       });

//       if (!result.cancelled) {
//         setCoverImage(result.uri);
//         setCoverImageUrl(''); // Clear URL input if image is selected
//         setCoverImageError(false); // Reset error state
//       }
//     } catch (error) {
//       console.error('Error picking cover image:', error);
//       Alert.alert('Error', 'Failed to pick cover image.');
//     }
//   };

//   // Validate image URLs
//   const isValidImageUrl = (url) => {
//     const regex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|jpeg)$/i;
//     return regex.test(url);
//   };

//   const handleSave = () => {
//     // Perform validation
//     if (!name || !email) {
//       Alert.alert('Validation Error', 'Name and email are required.');
//       return;
//     }

//     if (email && !isValidEmail(email)) {
//       Alert.alert('Invalid Email', 'Please enter a valid email address.');
//       return;
//     }

//     if (phone && !isValidPhoneNumber(phone)) {
//       Alert.alert('Invalid Phone Number', 'Please enter a valid phone number.');
//       return;
//     }

//     if (profileImageUrl && !isValidImageUrl(profileImageUrl)) {
//       Alert.alert('Invalid URL', 'Please enter a valid image URL for the profile image.');
//       return;
//     }

//     if (coverImageUrl && !isValidImageUrl(coverImageUrl)) {
//       Alert.alert('Invalid URL', 'Please enter a valid image URL for the cover image.');
//       return;
//     }

//     // Determine the final image URLs
//     // Priority: Selected image > URL input > existing userData
//     const finalProfileImage = profileImage || profileImageUrl || userData.profileImage || '';
//     const finalCoverImage = coverImage || coverImageUrl || userData.coverImage || '';

//     const updatedData = {
//       ...userData,
//       name: name.trim(),
//       email: email.trim(),
//       phone: phone.trim(),
//       address: address.trim(),
//       profileImage: finalProfileImage.trim(),
//       coverImage: finalCoverImage.trim(),
//     };

//     onSave(updatedData);
//     onClose();

//     // Optional: Provide feedback to the user
//     Alert.alert('Success', 'Your profile has been updated successfully.');
//   };

//   // Email validation
//   const isValidEmail = (email) => {
//     const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return regex.test(email);
//   };

//   // Phone number validation
//   const isValidPhoneNumber = (phone) => {
//     const regex = /^\+?[0-9]{7,15}$/;
//     return regex.test(phone);
//   };

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       transparent={true}
//       onRequestClose={onClose}
//     >
//       <KeyboardAvoidingView
//         style={styles.modalContainer}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       >
//         <View style={[styles.modalInnerContainer, { backgroundColor: currentTheme.cardBackground }]}>
//           <ScrollView
//             contentContainerStyle={styles.modalContent}
//             keyboardShouldPersistTaps="handled"
//             showsVerticalScrollIndicator={false}
//           >
//             {/* Header */}
//             <View style={styles.modalHeader}>
//               <Text style={[styles.modalTitle, { color: currentTheme.cardTextColor }]}>
//                 Edit Profile
//               </Text>
//               <TouchableOpacity onPress={onClose} style={styles.closeButton}>
//                 <Ionicons name="close" size={24} color={currentTheme.textColor} />
//               </TouchableOpacity>
//             </View>

//             {/* Profile Image Section */}
//             <View style={styles.inputContainer}>
//               <Text style={[styles.label, { color: currentTheme.textColor }]}>Profile Image</Text>
//               {profileImage ? (
//                 <Image
//                   source={{ uri: profileImage }}
//                   style={styles.profileImagePreview}
//                   onError={() => setProfileImageError(true)}
//                 />
//               ) : (
//                 <View style={[styles.placeholderImage, { backgroundColor: currentTheme.backgroundColor }]}>
//                   <Ionicons name="person-outline" size={50} color={currentTheme.placeholderTextColor} />
//                 </View>
//               )}
//               {profileImageError && (
//                 <Text style={styles.errorText}>Failed to load profile image.</Text>
//               )}
//               <TouchableOpacity
//                 style={[styles.imageButton, { backgroundColor: currentTheme.primaryColor }]}
//                 onPress={pickProfileImage}
//                 accessibilityLabel="Pick Profile Image"
//                 accessibilityRole="button"
//               >
//                 <Text style={styles.imageButtonText}>Select Profile Image</Text>
//               </TouchableOpacity>
//               <TextInput
//                 style={[
//                   styles.input,
//                   {
//                     backgroundColor: currentTheme.backgroundColor,
//                     color: currentTheme.textColor,
//                     borderColor: currentTheme.borderColor,
//                   },
//                 ]}
//                 value={profileImageUrl}
//                 onChangeText={setProfileImageUrl}
//                 placeholder="Or enter image URL"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 autoCapitalize="none"
//                 accessibilityLabel="Profile Image URL Input"
//               />
//             </View>

//             {/* Cover Image Section */}
//             <View style={styles.inputContainer}>
//               <Text style={[styles.label, { color: currentTheme.textColor }]}>Cover Image</Text>
//               {coverImage ? (
//                 <Image
//                   source={{ uri: coverImage }}
//                   style={styles.coverImagePreview}
//                   onError={() => setCoverImageError(true)}
//                 />
//               ) : (
//                 <View style={[styles.placeholderCoverImage, { backgroundColor: currentTheme.backgroundColor }]}>
//                   <Ionicons name="image-outline" size={50} color={currentTheme.placeholderTextColor} />
//                 </View>
//               )}
//               {coverImageError && (
//                 <Text style={styles.errorText}>Failed to load cover image.</Text>
//               )}
//               <TouchableOpacity
//                 style={[styles.imageButton, { backgroundColor: currentTheme.primaryColor }]}
//                 onPress={pickCoverImage}
//                 accessibilityLabel="Pick Cover Image"
//                 accessibilityRole="button"
//               >
//                 <Text style={styles.imageButtonText}>Select Cover Image</Text>
//               </TouchableOpacity>
//               <TextInput
//                 style={[
//                   styles.input,
//                   {
//                     backgroundColor: currentTheme.backgroundColor,
//                     color: currentTheme.textColor,
//                     borderColor: currentTheme.borderColor,
//                   },
//                 ]}
//                 value={coverImageUrl}
//                 onChangeText={setCoverImageUrl}
//                 placeholder="Or enter image URL"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 autoCapitalize="none"
//                 accessibilityLabel="Cover Image URL Input"
//               />
//             </View>

//             {/* Other Profile Fields */}
//             <View style={styles.inputContainer}>
//               <Text style={[styles.label, { color: currentTheme.textColor }]}>Name</Text>
//               <TextInput
//                 style={[
//                   styles.input,
//                   {
//                     backgroundColor: currentTheme.backgroundColor,
//                     color: currentTheme.textColor,
//                     borderColor: currentTheme.borderColor,
//                   },
//                 ]}
//                 value={name}
//                 onChangeText={setName}
//                 placeholder="Enter your name"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 accessibilityLabel="Name Input"
//               />
//             </View>
//             <View style={styles.inputContainer}>
//               <Text style={[styles.label, { color: currentTheme.textColor }]}>Email</Text>
//               <TextInput
//                 style={[
//                   styles.input,
//                   {
//                     backgroundColor: currentTheme.backgroundColor,
//                     color: currentTheme.textColor,
//                     borderColor: currentTheme.borderColor,
//                   },
//                 ]}
//                 value={email}
//                 onChangeText={setEmail}
//                 placeholder="Enter your email"
//                 keyboardType="email-address"
//                 autoCapitalize="none"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 accessibilityLabel="Email Input"
//               />
//             </View>
//             <View style={styles.inputContainer}>
//               <Text style={[styles.label, { color: currentTheme.textColor }]}>Phone Number</Text>
//               <TextInput
//                 style={[
//                   styles.input,
//                   {
//                     backgroundColor: currentTheme.backgroundColor,
//                     color: currentTheme.textColor,
//                     borderColor: currentTheme.borderColor,
//                   },
//                 ]}
//                 value={phone}
//                 onChangeText={setPhone}
//                 placeholder="Enter your phone number"
//                 keyboardType="phone-pad"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 accessibilityLabel="Phone Number Input"
//               />
//             </View>
//             <View style={styles.inputContainer}>
//               <Text style={[styles.label, { color: currentTheme.textColor }]}>Address</Text>
//               <TextInput
//                 style={[
//                   styles.input,
//                   {
//                     height: 80,
//                     backgroundColor: currentTheme.backgroundColor,
//                     color: currentTheme.textColor,
//                     borderColor: currentTheme.borderColor,
//                   },
//                 ]}
//                 value={address}
//                 onChangeText={setAddress}
//                 placeholder="Enter your address"
//                 multiline
//                 numberOfLines={3}
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 accessibilityLabel="Address Input"
//               />
//             </View>

//             {/* Save Button */}
//             <TouchableOpacity
//               style={[styles.saveButton, { backgroundColor: currentTheme.primaryColor }]}
//               onPress={handleSave}
//               accessibilityLabel="Save Profile"
//               accessibilityRole="button"
//             >
//               <Text style={styles.saveButtonText}>Save</Text>
//             </TouchableOpacity>
//           </ScrollView>
//         </View>
//       </KeyboardAvoidingView>
//     </Modal>
//   );
// };

// // Styles for EditProfilePopup
// const styles = StyleSheet.create({
//   modalContainer: {
//     flex: 1,
//     backgroundColor: '#000000AA', // Semi-transparent background
//     justifyContent: 'center', // Center vertically
//     alignItems: 'center', // Center horizontally
//   },
//   modalInnerContainer: {
//     borderRadius: 10,
//     padding: 20,
//     elevation: 5,
//     width: '90%',
//     maxHeight: '90%', // Ensure it doesn't exceed screen height
//   },
//   modalContent: {
//     flexGrow: 1,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//   },
//   closeButton: {
//     padding: 5,
//   },
//   inputContainer: {
//     marginTop: 15,
//   },
//   label: {
//     fontSize: 14,
//     marginBottom: 5,
//     fontWeight: '500',
//   },
//   input: {
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     paddingVertical: Platform.OS === 'ios' ? 12 : 8,
//     fontSize: 14,
//     marginBottom: 10,
//   },
//   profileImagePreview: {
//     width: width * 0.3,
//     height: width * 0.3,
//     borderRadius: (width * 0.3) / 2,
//     alignSelf: 'center',
//     marginBottom: 10,
//   },
//   coverImagePreview: {
//     width: '100%',
//     height: 150,
//     borderRadius: 10,
//     alignSelf: 'center',
//     marginBottom: 10,
//   },
//   placeholderImage: {
//     width: width * 0.3,
//     height: width * 0.3,
//     borderRadius: (width * 0.3) / 2,
//     justifyContent: 'center',
//     alignItems: 'center',
//     alignSelf: 'center',
//     marginBottom: 10,
//   },
//   placeholderCoverImage: {
//     width: '100%',
//     height: 150,
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     alignSelf: 'center',
//     marginBottom: 10,
//   },
//   imageButton: {
//     paddingVertical: 10,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   imageButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   saveButton: {
//     paddingVertical: 12,
//     borderRadius: 8,
//     marginTop: 25,
//     alignItems: 'center',
//   },
//   saveButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   errorText: {
//     color: 'red',
//     fontSize: 12,
//     textAlign: 'center',
//     marginBottom: 5,
//   },
// });

// export default EditProfilePopup;
