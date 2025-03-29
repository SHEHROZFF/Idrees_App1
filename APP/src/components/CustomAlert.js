// src/components/CustomAlert.js

import React, { useContext } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for icons
import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';

const { width } = Dimensions.get('window');

const CustomAlert = ({ visible, title, message, onClose, icon, buttons }) => {
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
    >
      <View style={styles.modalBackground}>
        <View
          style={[
            styles.alertContainer,
            { backgroundColor: currentTheme.cardBackground },
          ]}
        >
          {icon && (
            <Ionicons
              name={icon}
              size={48}
              color={currentTheme.primaryColor}
              style={{ marginBottom: 10 }}
            />
          )}
          <Text
            style={[styles.alertTitle, { color: currentTheme.cardTextColor }]}
          >
            {title}
          </Text>
          <Text
            style={[styles.alertMessage, { color: currentTheme.textColor }]}
          >
            {message}
          </Text>
          <View style={styles.buttonContainer}>
            {buttons && buttons.length > 0 ? (
              buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.alertButton,
                    {
                      backgroundColor:
                        button.backgroundColor || currentTheme.primaryColor,
                    },
                  ]}
                  onPress={button.onPress}
                  accessibilityLabel={button.text}
                  accessibilityRole="button"
                >
                  <Text style={styles.alertButtonText}>{button.text}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  { backgroundColor: currentTheme.primaryColor },
                ]}
                onPress={onClose}
                accessibilityLabel="Close Alert"
                accessibilityRole="button"
              >
                <Text style={styles.closeButtonText}>OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: width * 0.8,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%', // Ensure buttons take up full width of alert
  },
  alertButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 5,
    minWidth: 100, // Ensure a minimum width for buttons
  },
  alertButtonText: {
    color: '#FFFFFF',
    fontSize: 16, // Reduced font size to accommodate longer text
    fontWeight: 'bold',
  },
  closeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    backgroundColor: '#007BFF', // Default primary color if not provided
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16, // Reduced font size
    fontWeight: 'bold',
  },
});

export default CustomAlert;







// // src/components/CustomAlert.js

// import React, { useContext } from 'react';
// import {
//   Modal,
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for icons
// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// const { width } = Dimensions.get('window');

// const CustomAlert = ({ visible, title, message, onClose, icon, buttons }) => {
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   return (
//     <Modal
//       visible={visible}
//       animationType="fade"
//       transparent={true}
//       onRequestClose={onClose}
//       accessibilityViewIsModal={true}
//     >
//       <View style={styles.modalBackground}>
//         <View
//           style={[
//             styles.alertContainer,
//             { backgroundColor: currentTheme.cardBackground },
//           ]}
//         >
//           {icon && (
//             <Ionicons
//               name={icon}
//               size={48}
//               color={currentTheme.primaryColor}
//               style={{ marginBottom: 10 }}
//             />
//           )}
//           <Text
//             style={[styles.alertTitle, { color: currentTheme.cardTextColor }]}
//           >
//             {title}
//           </Text>
//           <Text
//             style={[styles.alertMessage, { color: currentTheme.textColor }]}
//           >
//             {message}
//           </Text>
//           <View style={styles.buttonContainer}>
//             {buttons && buttons.length > 0 ? (
//               buttons.map((button, index) => (
//                 <TouchableOpacity
//                   key={index}
//                   style={[
//                     styles.alertButton,
//                     {
//                       backgroundColor:
//                         button.backgroundColor || currentTheme.primaryColor,
//                     },
//                   ]}
//                   onPress={button.onPress}
//                   accessibilityLabel={button.text}
//                   accessibilityRole="button"
//                 >
//                   <Text style={styles.alertButtonText}>{button.text}</Text>
//                 </TouchableOpacity>
//               ))
//             ) : (
//               <TouchableOpacity
//                 style={[
//                   styles.closeButton,
//                   { backgroundColor: currentTheme.primaryColor },
//                 ]}
//                 onPress={onClose}
//                 accessibilityLabel="Close Alert"
//                 accessibilityRole="button"
//               >
//                 <Text style={styles.closeButtonText}>OK</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// // Styles for the component
// const styles = StyleSheet.create({
//   modalBackground: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   alertContainer: {
//     width: width * 0.8,
//     borderRadius: 20,
//     padding: 20,
//     alignItems: 'center',
//   },
//   alertTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   alertMessage: {
//     fontSize: 16,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   alertButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 25,
//     alignItems: 'center',
//     marginHorizontal: 5,
//   },
//   alertButtonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   closeButton: {
//     width: '50%',
//     paddingVertical: 12,
//     borderRadius: 25,
//     alignItems: 'center',
//   },
//   closeButtonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
// });

// export default CustomAlert;
