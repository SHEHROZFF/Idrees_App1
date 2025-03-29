// HelpScreen.js

import React, { useContext, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ScrollView,
  SafeAreaView,
  Animated,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';

const { width, height } = Dimensions.get('window');

// Reusable component for the popup content
const HelpModal = ({
  visible,
  onClose,
  title,
  description,
  themeStyles,
  headerBackground,
  headerTextColor,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={[styles.modalContainer, { backgroundColor: themeStyles.cardBackground }]}>
          {/* Modal Header */}
          <LinearGradient
            colors={headerBackground}
            style={styles.modalHeader}
            start={[0, 0]}
            end={[1, 0]}
          >
            <Text style={[styles.modalTitle, { color: headerTextColor }]}>
              {title}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityLabel="Close Popup"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color={headerTextColor} />
            </TouchableOpacity>
          </LinearGradient>

          {/* Modal Body */}
          <ScrollView contentContainerStyle={styles.modalBodyContent}>
            <Text style={[styles.modalDescription, { color: themeStyles.textColor }]}>
              {description}
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const HelpScreen = () => {
  const navigation = useNavigation();

  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  // Animation references for the back button
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  // Interpolate rotation from 0deg to -20deg on press
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-20deg'],
  });

  // Interpolate color from headerTextColor to secondaryColor on press
  const colorInterpolate = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [currentTheme.headerTextColor, currentTheme.secondaryColor],
  });

  const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

  // Animation handlers
  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(colorAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(colorAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start(() => {
      navigation.goBack();
    });
  };

  // State for modal popup
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');

  // Helper function to open the popup with the relevant info
  const openModal = (title, description) => {
    setModalTitle(title);
    setModalDescription(description);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  // Handlers// Example handlers with updated placeholder text.

  const handleFAQPress = () => {
    // Updated dummy FAQ content
    const dummyFAQ = `
  Here are some frequently asked questions:

  1. How do I register?
    - Go to our sign-up page, fill in your details, and verify your email.

  2. How can I reset my password?
    - Click on "Forgot Password" on the login screen and follow the instructions.

  3. What payment methods do you accept?
    - We currently accept credit cards, PayPal, Mastercard etc.

  More details coming soon.
    `;
    openModal('Frequently Asked Questions', dummyFAQ);
  };

  const handleContactUsPress = () => {
    // Updated dummy Contact Us content
    const dummyContact = `
  Feel free to reach out to us if you have any questions or concerns:

  • Email: Idri.gueye@gmail.com
  • Phone (US): 1-800-123-4567
  • Phone (International): +1-234-567-8900

  Our support team is available Monday to Friday, from 9 AM to 6 PM (EST).
  We’re here to help!
    `;
    openModal('Contact Us', dummyContact);
  };

  const handleTermsPress = () => {
    // Updated dummy Terms & Conditions content
    const dummyTerms = `
  Terms and Conditions:

  By using our service, you agree to the following terms:

  1. Eligibility
    - You must be at least 18 years old or have parental consent to use our services.

  2. Service Usage
    - You will not use our service for any illegal or unauthorized purpose.
    - Any violation may result in immediate suspension of your account.

  3. Intellectual Property
    - All content, including logos and designs, are owned by House Of Cert.
    - Unauthorized copying or distribution is prohibited.

  4. Liability
    - We strive to ensure all content is accurate but assume no liability for any damages.

  5. Modifications
    - We reserve the right to update or modify these terms at any time.
    - Continued usage of the service constitutes acceptance of the revised terms.

    `;
    openModal('Terms & Conditions', dummyTerms);
  };

  const handlePrivacyPress = () => {
    // Updated dummy Privacy Policy content
    const dummyPrivacy = `
  Privacy Policy:

  We value your privacy. Here is how we protect and manage your data:

  1. Information We Collect
    - We may collect personal details (name, email, billing info) when you register or purchase our products.

  2. Use of Information
    - We use your data to process orders, improve our services, and send important updates.

  3. Data Security
    - We implement security measures such as encryption and secure servers to safeguard your data.
    - However, no method of transmission is 100% secure.

  4. Changes to this Policy
    - We may update this policy periodically. Check back for any changes.

    `;
    openModal('Privacy Policy', dummyPrivacy);
  };


  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Header with LinearGradient */}
        <LinearGradient
          colors={currentTheme.headerBackground}
          style={styles.header}
          start={[0, 0]}
          end={[0, 1]}
        >
          {/* Animated Back Button (uncomment to use animations on back press) */}
          {/* 
          <TouchableWithoutFeedback
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            accessibilityLabel="Go Back"
            accessibilityRole="button"
          >
            <Animated.View
              style={[
                styles.backButton,
                {
                  transform: [{ scale: scaleAnim }, { rotate: rotateInterpolate }],
                },
              ]}
            >
              <AnimatedIonicons name="arrow-back" size={24} color={colorInterpolate} />
            </Animated.View>
          </TouchableWithoutFeedback>
          */}

          {/* Static Back Button (if you don't want animated) */}
          {/* <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go Back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
          </TouchableOpacity> */}

          <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
            Help & Support
          </Text>
        </LinearGradient>

        <View style={styles.helpContainer}>
          {/* FAQ */}
          <TouchableOpacity
            style={[styles.helpItem, { borderBottomColor: currentTheme.borderColor }]}
            onPress={handleFAQPress}
            activeOpacity={0.7}
          >
            <View style={styles.helpInfo}>
              <Ionicons
                name="help-circle"
                size={24}
                color={currentTheme.primaryColor}
                style={styles.icon}
              />
              <Text style={[styles.helpText, { color: currentTheme.textColor }]}>
                Frequently Asked Questions
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={currentTheme.placeholderTextColor}
            />
          </TouchableOpacity>

          {/* Contact Us */}
          <TouchableOpacity
            style={[styles.helpItem, { borderBottomColor: currentTheme.borderColor }]}
            onPress={handleContactUsPress}
            activeOpacity={0.7}
          >
            <View style={styles.helpInfo}>
              <Ionicons
                name="mail"
                size={24}
                color={currentTheme.primaryColor}
                style={styles.icon}
              />
              <Text style={[styles.helpText, { color: currentTheme.textColor }]}>
                Contact Us
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={currentTheme.placeholderTextColor}
            />
          </TouchableOpacity>

          {/* Terms & Conditions */}
          <TouchableOpacity
            style={[styles.helpItem, { borderBottomColor: currentTheme.borderColor }]}
            onPress={handleTermsPress}
            activeOpacity={0.7}
          >
            <View style={styles.helpInfo}>
              <Ionicons
                name="document-text"
                size={24}
                color={currentTheme.primaryColor}
                style={styles.icon}
              />
              <Text style={[styles.helpText, { color: currentTheme.textColor }]}>
                Terms and Conditions
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={currentTheme.placeholderTextColor}
            />
          </TouchableOpacity>

          {/* Privacy Policy */}
          <TouchableOpacity
            style={[styles.helpItem, { borderBottomColor: currentTheme.borderColor }]}
            onPress={handlePrivacyPress}
            activeOpacity={0.7}
          >
            <View style={styles.helpInfo}>
              <Ionicons
                name="lock-closed"
                size={24}
                color={currentTheme.primaryColor}
                style={styles.icon}
              />
              <Text style={[styles.helpText, { color: currentTheme.textColor }]}>
                Privacy Policy
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={currentTheme.placeholderTextColor}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Reusable Modal to show help details */}
      <HelpModal
        visible={modalVisible}
        onClose={closeModal}
        title={modalTitle}
        description={modalDescription}
        themeStyles={currentTheme}
        headerBackground={currentTheme.headerBackground}
        headerTextColor={currentTheme.headerTextColor}
      />
    </SafeAreaView>
  );
};

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButton: {
    position: 'absolute',
    left: 15,
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  helpContainer: {
    marginTop: 10,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginLeft: 15,
    marginRight: 15,
  },
  helpInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpText: {
    fontSize: 18,
    flexShrink: 1,
  },
  icon: {
    marginRight: 15,
  },

  // Modal Styles
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'left',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBodyContent: {
    paddingHorizontal: 15,
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 22,
  },
});

export default HelpScreen;
