// src/screens/FavouritesPage.js

import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';
import { FavouritesContext } from '../contexts/FavouritesContext';
import CustomAlert from '../components/CustomAlert';

const { width } = Dimensions.get('window');

const FavouritesPage = () => {
  const navigation = useNavigation();

  // Theme
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  // Favourites
  const { favouriteItems, removeFromFavourites, clearFavourites } =
    useContext(FavouritesContext);

  // CustomAlert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertIcon, setAlertIcon] = useState('');
  const [alertButtons, setAlertButtons] = useState([]);

  // Hide header
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Render single favourite item
  const renderItem = ({ item }) => (
    <View
      style={[styles.itemContainer, { backgroundColor: currentTheme.cardBackground }]}
    >
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={[styles.itemName, { color: currentTheme.cardTextColor }]}>
          {item.examName}
        </Text>
        <Text style={[styles.itemSubtitle, { color: currentTheme.textColor }]}>
          {item.subjectName} ({item.subjectCode})
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => removeFromFavourites(item._id)}
        accessibilityLabel={`Remove ${item.examName} from favourites`}
      >
        <Ionicons name="heart-dislike-outline" size={24} color="#E53935" />
      </TouchableOpacity>
    </View>
  );

  // Clear all favourites
  const handleClearFavourites = () => {
    setAlertTitle('Clear Favourites');
    setAlertMessage('Are you sure you want to clear all favourite items?');
    setAlertIcon('heart-dislike-outline');
    setAlertButtons([
      {
        text: 'Cancel',
        onPress: () => setAlertVisible(false),
        backgroundColor: '#AAAAAA',
      },
      {
        text: 'Yes',
        onPress: () => {
          clearFavourites();
          setAlertVisible(false);
        },
      },
    ]);
    setAlertVisible(true);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}
    >
      <StatusBar
        backgroundColor={currentTheme.headerBackground[1]}
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
      />
      {/* Header */}
      <LinearGradient
        colors={currentTheme.headerBackground}
        style={styles.header}
        start={[0, 0]}
        end={[0, 1]}
      >
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
            Your Favourites
          </Text>
          <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}>
            Browse your favourite items
          </Text>
        </View>
      </LinearGradient>

      {/* Favourites List */}
      <FlatList
        data={favouriteItems}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={80} color={currentTheme.placeholderTextColor} />
            <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
              You have no favourite items.
            </Text>
          </View>
        }
      />

      {/* Clear Favourites Button */}
      {favouriteItems.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: currentTheme.primaryColor }]}
            onPress={handleClearFavourites}
          >
            <Text style={[styles.clearButtonText, { color: '#FFFFFF' }]}>
              Clear Favourites
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* CustomAlert */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
        icon={alertIcon}
        buttons={alertButtons}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    padding: 20,
    paddingBottom: 80,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 15,
    alignItems: 'center',
  },
  clearButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
  },
});

export default FavouritesPage;



















// // src/screens/FavouritesPage.js

// import React, { useContext, useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   StatusBar,
//   SafeAreaView,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { FavouritesContext } from '../contexts/FavouritesContext';
// import CustomAlert from '../components/CustomAlert'; // Import CustomAlert

// const { width, height } = Dimensions.get('window');

// const FavouritesPage = () => {
//   const navigation = useNavigation();

//   // Access theme from context
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Access favourites context
//   const { favouriteItems, removeFromFavourites, clearFavourites } = useContext(FavouritesContext);

//   // State for controlling the CustomAlert
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   // Hide the default header provided by React Navigation
//   useEffect(() => {
//     navigation.setOptions({
//       headerShown: false,
//     });
//   }, [navigation]);

//   // Render individual favourite item
//   const renderItem = ({ item }) => (
//     <View style={[styles.itemContainer, { backgroundColor: currentTheme.cardBackground }]}>
//       <Image source={{ uri: item.image }} style={styles.itemImage} />
//       <View style={styles.itemDetails}>
//         <Text style={[styles.itemName, { color: currentTheme.cardTextColor }]}>
//           {item.examName}
//         </Text>
//         <Text style={[styles.itemSubtitle, { color: currentTheme.textColor }]}>
//           {item.subjectName} ({item.subjectCode})
//         </Text>
//       </View>
//       <TouchableOpacity
//         onPress={() => removeFromFavourites(item._id)}
//         accessibilityLabel={`Remove ${item.examName} from favourites`}
//         accessibilityRole="button"
//       >
//         <Ionicons name="heart-dislike-outline" size={24} color="#E53935" />
//       </TouchableOpacity>
//     </View>
//   );

//   const handleClearFavourites = () => {
//     setAlertTitle('Clear Favourites');
//     setAlertMessage('Are you sure you want to clear all favourite items?');
//     setAlertIcon('heart-dislike-outline');
//     setAlertButtons([
//       {
//         text: 'Cancel',
//         onPress: () => setAlertVisible(false),
//         backgroundColor: '#AAAAAA',
//       },
//       {
//         text: 'Yes',
//         onPress: () => {
//           clearFavourites();
//           setAlertVisible(false);
//         },
//       },
//     ]);
//     setAlertVisible(true);
//   };

//   return (
//     <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[1]}
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />
//       {/* Header */}
//       <LinearGradient
//         colors={currentTheme.headerBackground}
//         style={styles.header}
//         start={[0, 0]}
//         end={[0, 1]}
//       >
//         {/* Header Title and Subtitle */}
//         <View style={styles.headerTitleContainer}>
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//             Your Favourites
//           </Text>
//           <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}>
//             Browse your favourite items
//           </Text>
//         </View>
//       </LinearGradient>

//       {/* Favourite Items List */}
//       <FlatList
//         data={favouriteItems}
//         keyExtractor={(item) => item._id.toString()}
//         renderItem={renderItem}
//         contentContainerStyle={styles.listContent}
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Ionicons
//               name="heart-outline"
//               size={80}
//               color={currentTheme.placeholderTextColor}
//             />
//             <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//               You have no favourite items.
//             </Text>
//           </View>
//         }
//       />

//       {/* Clear Favourites Button */}
//       {favouriteItems.length > 0 && (
//         <View style={styles.footer}>
//           <TouchableOpacity
//             style={[styles.clearButton, { backgroundColor: currentTheme.primaryColor }]}
//             onPress={handleClearFavourites}
//             accessibilityLabel="Clear Favourites"
//             accessibilityRole="button"
//           >
//             <Text style={[styles.clearButtonText, { color: '#FFFFFF' }]}>Clear Favourites</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* CustomAlert Component */}
//       <CustomAlert
//         visible={alertVisible}
//         title={alertTitle}
//         message={alertMessage}
//         onClose={() => setAlertVisible(false)}
//         icon={alertIcon}
//         buttons={alertButtons}
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//     safeArea: {
//       flex: 1,
//     },
//     header: {
//       width: '100%',
//       paddingVertical: 5,
//       paddingHorizontal: 15,
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',
//       elevation: 4,
//       shadowColor: '#000',
//       shadowOffset: {
//         width: 0,
//         height: 2,
//       },
//       shadowOpacity: 0.25,
//       shadowRadius: 3.84,
//     },
//     backButton: {
//       position: 'absolute',
//       left: 15,
//       top: 10,
//       padding: 8,
//     },
//     headerTitleContainer: {
//       alignItems: 'center',
//     },
//     headerTitle: {
//       fontSize: 24,
//       fontWeight: '700',
//     },
//     headerSubtitle: {
//       fontSize: 16,
//       fontWeight: '400',
//       marginTop: 4,
//     },
//     listContent: {
//       padding: 20,
//       paddingBottom: 100,
//     },
//     itemContainer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       padding: 10,
//       marginBottom: 15,
//       borderRadius: 10,
//       borderWidth: 1,
//       borderColor: '#E0E0E0',
//     },
//     itemImage: {
//       width: 60,
//       height: 60,
//       borderRadius: 10,
//       marginRight: 10,
//     },
//     itemDetails: {
//       flex: 1,
//     },
//     itemName: {
//       fontSize: 16,
//       fontWeight: 'bold',
//     },
//     itemSubtitle: {
//       fontSize: 14,
//       color: '#757575',
//     },
//     footer: {
//       position: 'absolute',
//       bottom: 0,
//       width: '100%',
//       padding: 15,
//       alignItems: 'center',
//     },
//     clearButton: {
//       paddingVertical: 10,
//       paddingHorizontal: 20,
//       borderRadius: 30,
//     },
//     clearButtonText: {
//       fontSize: 16,
//       fontWeight: 'bold',
//     },
//     emptyContainer: {
//       alignItems: 'center',
//       marginTop: 50,
//     },
//     emptyText: {
//       fontSize: 18,
//       marginTop: 15,
//     },
//   });


// export default FavouritesPage;















// // src/screens/FavouritesPage.js

// import React, { useContext, useEffect } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   StatusBar,
//   SafeAreaView,
//   Alert,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { FavouritesContext } from '../contexts/FavouritesContext';

// const { width, height } = Dimensions.get('window');

// const FavouritesPage = () => {
//   const navigation = useNavigation();

//   // Access theme from context
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Access favourites context
//   const { favouriteItems, removeFromFavourites, clearFavourites } = useContext(FavouritesContext);

//   // Hide the default header provided by React Navigation
//   useEffect(() => {
//     navigation.setOptions({
//       headerShown: false,
//     });
//   }, [navigation]);

//   // Render individual favourite item
//   const renderItem = ({ item }) => (
//     <View style={[styles.itemContainer, { backgroundColor: currentTheme.cardBackground }]}>
//       <Image source={{ uri: item.image }} style={styles.itemImage} />
//       <View style={styles.itemDetails}>
//         <Text style={[styles.itemName, { color: currentTheme.cardTextColor }]}>
//           {item.examName}
//         </Text>
//         <Text style={[styles.itemSubtitle, { color: currentTheme.textColor }]}>
//           {item.subjectName} ({item.subjectCode})
//         </Text>
//       </View>
//       <TouchableOpacity
//         onPress={() => removeFromFavourites(item._id)}
//         accessibilityLabel={`Remove ${item.examName} from favourites`}
//         accessibilityRole="button"
//       >
//         <Ionicons name="heart-dislike-outline" size={24} color="#E53935" />
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[1]}
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />
//       {/* Header */}
//       <LinearGradient
//         colors={currentTheme.headerBackground}
//         style={styles.header}
//         start={[0, 0]}
//         end={[0, 1]}
//       >
//         {/* Back Button */}
//         {/* <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//           accessibilityLabel="Go Back"
//           accessibilityRole="button"
//         >
//           <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity> */}

//         {/* Header Title and Subtitle */}
//         <View style={styles.headerTitleContainer}>
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//             Your Favourites
//           </Text>
//           <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}>
//             Browse your favourite items
//           </Text>
//         </View>
//       </LinearGradient>

//       {/* Favourite Items List */}
//       <FlatList
//         data={favouriteItems}
//         keyExtractor={(item) => item._id.toString()}
//         renderItem={renderItem}
//         contentContainerStyle={styles.listContent}
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Ionicons
//               name="heart-outline"
//               size={80}
//               color={currentTheme.placeholderTextColor}
//             />
//             <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//               You have no favourite items.
//             </Text>
//           </View>
//         }
//       />

//       {/* Clear Favourites Button */}
//       {favouriteItems.length > 0 && (
//         <View style={styles.footer}>
//           <TouchableOpacity
//             style={[styles.clearButton, { backgroundColor: currentTheme.primaryColor }]}
//             onPress={() => {
//               Alert.alert(
//                 'Clear Favourites',
//                 'Are you sure you want to clear all favourite items?',
//                 [
//                   { text: 'Cancel', style: 'cancel' },
//                   { text: 'Yes', onPress: () => clearFavourites() },
//                 ],
//                 { cancelable: true }
//               );
//             }}
//             accessibilityLabel="Clear Favourites"
//             accessibilityRole="button"
//           >
//             <Text style={[styles.clearButtonText, { color: '#FFFFFF' }]}>Clear Favourites</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };

// // Styles for the components
// const styles = StyleSheet.create({
//     safeArea: {
//       flex: 1,
//     },
//     header: {
//       width: '100%',
//       paddingVertical: 5,
//       paddingHorizontal: 15,
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',
//       elevation: 4,
//       shadowColor: '#000',
//       shadowOffset: {
//         width: 0,
//         height: 2,
//       },
//       shadowOpacity: 0.25,
//       shadowRadius: 3.84,
//     },
//     backButton: {
//       position: 'absolute',
//       left: 15,
//       top: 10,
//       padding: 8,
//     },
//     headerTitleContainer: {
//       alignItems: 'center',
//     },
//     headerTitle: {
//       fontSize: 24,
//       fontWeight: '700',
//     },
//     headerSubtitle: {
//       fontSize: 16,
//       fontWeight: '400',
//       marginTop: 4,
//     },
//     listContent: {
//       padding: 20,
//       paddingBottom: 100,
//     },
//     itemContainer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       padding: 10,
//       marginBottom: 15,
//       borderRadius: 10,
//       borderWidth: 1,
//       borderColor: '#E0E0E0',
//     },
//     itemImage: {
//       width: 60,
//       height: 60,
//       borderRadius: 10,
//       marginRight: 10,
//     },
//     itemDetails: {
//       flex: 1,
//     },
//     itemName: {
//       fontSize: 16,
//       fontWeight: 'bold',
//     },
//     itemSubtitle: {
//       fontSize: 14,
//       color: '#757575',
//     },
//     footer: {
//       position: 'absolute',
//       bottom: 0,
//       width: '100%',
//       padding: 15,
//       alignItems: 'center',
//     },
//     clearButton: {
//       paddingVertical: 10,
//       paddingHorizontal: 20,
//       borderRadius: 30,
//     },
//     clearButtonText: {
//       fontSize: 16,
//       fontWeight: 'bold',
//     },
//     emptyContainer: {
//       alignItems: 'center',
//       marginTop: 50,
//     },
//     emptyText: {
//       fontSize: 18,
//       marginTop: 15,
//     },
//   });

// export default FavouritesPage;
