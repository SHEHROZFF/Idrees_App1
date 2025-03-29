// src/screens/ProductPage.js

import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import ReviewPopup from '../components/ReviewPopup';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';
import { CartContext } from '../contexts/CartContext';
import { FavouritesContext } from '../contexts/FavouritesContext';
import CustomAlert from '../components/CustomAlert';

const { width } = Dimensions.get('window');

const ProductPage = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { item } = route.params;

  const [isReviewPopupVisible, setReviewPopupVisible] = React.useState(false);
  const { cartItems, addToCart } = useContext(CartContext);

  // FavouritesContext
  const { favouriteItems, addToFavourites, removeFromFavourites } = useContext(FavouritesContext);
  const isFavourite = favouriteItems.some((favItem) => favItem._id === item._id);

  // Theme
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertIcon, setAlertIcon] = useState('');
  const [alertButtons, setAlertButtons] = useState([]);

  const openReviewPopup = () => {
    setReviewPopupVisible(true);
  };

  const closeReviewPopup = () => {
    setReviewPopupVisible(false);
  };

  const toggleFavorite = () => {
    if (isFavourite) {
      removeFromFavourites(item._id);
      setAlertTitle('Removed from Favourites');
      setAlertMessage(`${item.name} has been removed from your favourites.`);
      setAlertIcon('heart-dislike-outline');
    } else {
      addToFavourites(item);
      setAlertTitle('Added to Favourites');
      setAlertMessage(`${item.name} has been added to your favourites.`);
      setAlertIcon('heart');
    }
    setAlertButtons([
      {
        text: 'OK',
        onPress: () => setAlertVisible(false),
      },
    ]);
    setAlertVisible(true);
  };

  const handleAddToCart = (productItem) => {
    const added = addToCart(productItem);
    if (added) {
      setAlertTitle('Success');
      setAlertMessage(`${productItem.name} has been added to your cart.`);
      setAlertIcon('cart');
    } else {
      setAlertTitle('Info');
      setAlertMessage(`${productItem.name} is already in your cart.`);
      setAlertIcon('information-circle');
    }
    setAlertButtons([
      {
        text: 'OK',
        onPress: () => setAlertVisible(false),
      },
    ]);
    setAlertVisible(true);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
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
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go Back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
        </TouchableOpacity>

        {/* Header Title Container */}
        <View style={styles.headerTitleContainer}>
          <Text
            style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.name}
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.subjectName} ({item.subjectCode})
          </Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.productImage} />
          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={toggleFavorite}
            accessibilityLabel={isFavourite ? 'Remove from favorites' : 'Add to favorites'}
            accessibilityRole="button"
          >
            <Ionicons
              name={isFavourite ? 'heart' : 'heart-outline'}
              size={28}
              color={isFavourite ? '#E91E63' : currentTheme.placeholderTextColor}
            />
          </TouchableOpacity>
        </View>

        {/* Details Container */}
        <View style={[styles.detailsContainer, { backgroundColor: currentTheme.cardBackground }]}>
          <Text style={[styles.productTitle, { color: currentTheme.cardTextColor }]}>
            {item.name}
          </Text>
          <Text style={[styles.productSubtitle, { color: currentTheme.textColor }]}>
            {item.subjectName} ({item.subjectCode})
          </Text>

          {/* Subheading for clarity */}
          <Text style={[styles.subHeading, { color: currentTheme.textColor }]}>
            Explore the details below and share your thoughts!
          </Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            {Array.from({ length: 5 }, (_, index) => (
              <Ionicons
                key={index}
                name={index < Math.floor(item.ratings) ? 'star' : 'star-outline'}
                size={20}
                color="#FFD700"
              />
            ))}
            <TouchableOpacity onPress={openReviewPopup}>
              <Text style={[styles.reviewCount, { color: currentTheme.cardTextColor }]}>
                ({item.numberOfReviews} reviews)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Price */}
          <Text style={[styles.productPrice, { color: currentTheme.priceColor }]}>
            ${item.price}
          </Text>

          {/* Description */}
          <Text style={[styles.sectionTitle, { color: currentTheme.cardTextColor }]}>
            Description
          </Text>
          <Text style={[styles.productDescription, { color: currentTheme.textColor }]}>
            {item.description}
          </Text>

          {/* Add to Cart Button */}
          <TouchableOpacity
            style={[styles.addToCartButton, { backgroundColor: currentTheme.primaryColor }]}
            onPress={() => handleAddToCart(item)}
            accessibilityLabel="Add to Cart"
            accessibilityRole="button"
          >
            <MaterialIcons name="add-shopping-cart" size={24} color="#FFFFFF" />
            <Text style={styles.addToCartButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>

        {/* Review Popup */}
        <Modal
          visible={isReviewPopupVisible}
          animationType="slide"
          onRequestClose={closeReviewPopup}
          transparent={true}
        >
          <ReviewPopup closePopup={closeReviewPopup} productId={item._id} />
        </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Android Elevation
    elevation: 4,
  },
  backButton: {
    position: 'absolute',
    left: 15,
    padding: 8,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    width: width * 0.7, // Restrict width to truncate gracefully
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    marginTop: 2,
    width: width * 0.7, // Restrict width to truncate gracefully
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#FFFFFFAA',
    borderRadius: 30,
    padding: 8,
  },
  detailsContainer: {
    padding: 20,
    marginTop: -20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Android Elevation
    elevation: 5,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 5,
  },
  productSubtitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  subHeading: {
    fontSize: 14,
    marginBottom: 15,
    fontStyle: 'italic',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  reviewCount: {
    fontSize: 16,
    marginLeft: 10,
    textDecorationLine: 'underline',
  },
  productPrice: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 30,
  },
  addToCartButton: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Android Elevation
    elevation: 3,
  },
  addToCartButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default ProductPage;

























// // src/screens/ProductPage.js

// import React, { useContext, useState } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Modal,
//   Dimensions,
//   StatusBar,
//   SafeAreaView,
// } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import ReviewPopup from '../components/ReviewPopup';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { CartContext } from '../contexts/CartContext';
// import { FavouritesContext } from '../contexts/FavouritesContext'; // Import FavouritesContext
// import CustomAlert from '../components/CustomAlert'; // Import CustomAlert

// const { width } = Dimensions.get('window');

// const ProductPage = () => {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { item } = route.params;

//   const [isReviewPopupVisible, setReviewPopupVisible] = React.useState(false);
//   const { cartItems, addToCart } = useContext(CartContext);

//   // Access FavouritesContext
//   const { favouriteItems, addToFavourites, removeFromFavourites } = useContext(FavouritesContext);

//   // Determine if the item is a favourite
//   const isFavourite = favouriteItems.some((favItem) => favItem._id === item._id);

//   // Get theme from context
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // State for controlling the CustomAlert
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   const openReviewPopup = () => {
//     setReviewPopupVisible(true);
//   };

//   const closeReviewPopup = () => {
//     setReviewPopupVisible(false);
//   };

//   const toggleFavorite = () => {
//     if (isFavourite) {
//       removeFromFavourites(item._id);
//       setAlertTitle('Removed from Favourites');
//       setAlertMessage(`${item.name} has been removed from your favourites.`);
//       setAlertIcon('heart-dislike-outline');
//     } else {
//       addToFavourites(item);
//       setAlertTitle('Added to Favourites');
//       setAlertMessage(`${item.name} has been added to your favourites.`);
//       setAlertIcon('heart');
//     }
//     setAlertButtons([
//       {
//         text: 'OK',
//         onPress: () => setAlertVisible(false),
//       },
//     ]);
//     setAlertVisible(true);
//   };

//   const handleAddToCart = (item) => {
//     const added = addToCart(item);
//     if (added) {
//       setAlertTitle('Success');
//       setAlertMessage(`${item.name} has been added to your cart.`);
//       setAlertIcon('cart');
//     } else {
//       setAlertTitle('Info');
//       setAlertMessage(`${item.name} is already in your cart.`);
//       setAlertIcon('information-circle');
//     }
//     setAlertButtons([
//       {
//         text: 'OK',
//         onPress: () => setAlertVisible(false),
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
//         {/* Back Button */}
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//           accessibilityLabel="Go Back"
//           accessibilityRole="button"
//         >
//           <Ionicons name="arrow-back" size={28} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>

//         {/* Header Title */}
//         <View style={styles.headerTitleContainer}>
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//             {item.name}
//           </Text>
//           <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}>
//             {item.subjectName} ({item.subjectCode})
//           </Text>
//         </View>
//       </LinearGradient>

//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         {/* Product Image */}
//         <View style={styles.imageContainer}>
//           <Image source={{ uri: item.image }} style={styles.productImage} />
//           {/* Favorite Button */}
//           <TouchableOpacity
//             style={styles.favoriteButton}
//             onPress={toggleFavorite}
//             accessibilityLabel={isFavourite ? 'Remove from favorites' : 'Add to favorites'}
//             accessibilityRole="button"
//           >
//             <Ionicons
//               name={isFavourite ? 'heart' : 'heart-outline'}
//               size={28}
//               color={isFavourite ? '#E91E63' : currentTheme.placeholderTextColor}
//             />
//           </TouchableOpacity>
//         </View>

//         {/* Product Details */}
//         <View style={[styles.detailsContainer, { backgroundColor: currentTheme.cardBackground }]}>
//           <Text style={[styles.productTitle, { color: currentTheme.cardTextColor }]}>
//             {item.name}
//           </Text>
//           <Text style={[styles.productSubtitle, { color: currentTheme.textColor }]}>
//             {item.subjectName} ({item.subjectCode})
//           </Text>

//           {/* Rating */}
//           <View style={styles.ratingContainer}>
//             {Array.from({ length: 5 }, (_, index) => (
//               <Ionicons
//                 key={index}
//                 name={index < Math.floor(item.ratings) ? 'star' : 'star-outline'}
//                 size={20}
//                 color="#FFD700"
//               />
//             ))}
//             <TouchableOpacity onPress={openReviewPopup}>
//               <Text style={[styles.reviewCount, { color: currentTheme.secondaryColor }]}>
//                 ({item.numberOfReviews} reviews)
//               </Text>
//             </TouchableOpacity>
//           </View>

//           {/* Price */}
//           <Text style={[styles.productPrice, { color: currentTheme.priceColor }]}>
//             ${item.price}
//           </Text>

//           {/* Description */}
//           <Text style={[styles.sectionTitle, { color: currentTheme.cardTextColor }]}>
//             Description
//           </Text>
//           <Text style={[styles.productDescription, { color: currentTheme.textColor }]}>
//             {item.description}
//           </Text>

//           {/* Add to Cart Button */}
//           <TouchableOpacity
//             style={[styles.addToCartButton, { backgroundColor: currentTheme.primaryColor }]}
//             onPress={() => handleAddToCart(item)}
//             accessibilityLabel="Add to Cart"
//             accessibilityRole="button"
//           >
//             <MaterialIcons name="add-shopping-cart" size={24} color="#FFFFFF" />
//             <Text style={styles.addToCartButtonText}>Add to Cart</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Review Popup */}
//         <Modal
//           visible={isReviewPopupVisible}
//           animationType="slide"
//           onRequestClose={closeReviewPopup}
//           transparent={true}
//         >
//           <ReviewPopup closePopup={closeReviewPopup} productId={item._id} />
//         </Modal>
//       </ScrollView>

//       {/* CustomAlert Component */}
//       <CustomAlert
//         visible={alertVisible}
//         title={alertTitle}
//         message={alertMessage}
//         icon={alertIcon}
//         onClose={() => setAlertVisible(false)}
//         buttons={alertButtons}
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   header: {
//     width: '100%',
//     paddingVertical: 5,
//     paddingHorizontal: 15,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   backButton: {
//     position: 'absolute',
//     left: 15,
//     top: 10,
//     padding: 8,
//   },
//   headerTitleContainer: {
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//   },
//   headerSubtitle: {
//     fontSize: 16,
//     fontWeight: '400',
//     marginTop: 4,
//   },
//   scrollContent: {
//     paddingBottom: 20,
//   },
//   imageContainer: {
//     position: 'relative',
//   },
//   productImage: {
//     width: width,
//     height: 300,
//     resizeMode: 'cover',
//   },
//   favoriteButton: {
//     position: 'absolute',
//     top: 20,
//     right: 20,
//     backgroundColor: '#FFFFFFAA',
//     borderRadius: 30,
//     padding: 8,
//   },
//   detailsContainer: {
//     padding: 20,
//     marginTop: -20,
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     elevation: 5,
//   },
//   productTitle: {
//     fontSize: 26,
//     fontWeight: '700',
//     marginBottom: 5,
//   },
//   productSubtitle: {
//     fontSize: 18,
//     marginBottom: 10,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   reviewCount: {
//     fontSize: 16,
//     marginLeft: 5,
//     textDecorationLine: 'underline',
//   },
//   productPrice: {
//     fontSize: 24,
//     fontWeight: '700',
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 10,
//   },
//   productDescription: {
//     fontSize: 16,
//     lineHeight: 24,
//     marginBottom: 30,
//   },
//   addToCartButton: {
//     flexDirection: 'row',
//     paddingVertical: 15,
//     borderRadius: 30,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   addToCartButtonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: '600',
//     marginLeft: 10,
//   },
// });

// export default ProductPage;








// // src/screens/ProductPage.js

// import React, { useContext } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Modal,
//   Dimensions,
//   StatusBar,
//   SafeAreaView,
//   Alert,
// } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import ReviewPopup from '../components/ReviewPopup';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { CartContext } from '../contexts/CartContext';
// import { FavouritesContext } from '../contexts/FavouritesContext'; // Import FavouritesContext

// const { width } = Dimensions.get('window');

// const ProductPage = () => {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { item } = route.params;

//   const [isReviewPopupVisible, setReviewPopupVisible] = React.useState(false);
//   const { cartItems, addToCart } = useContext(CartContext);

//   // Access FavouritesContext
//   const { favouriteItems, addToFavourites, removeFromFavourites } = useContext(FavouritesContext);

//   // Determine if the item is a favourite
//   const isFavourite = favouriteItems.some((favItem) => favItem._id === item._id);

//   // Get theme from context
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   const openReviewPopup = () => {
//     setReviewPopupVisible(true);
//   };

//   const closeReviewPopup = () => {
//     setReviewPopupVisible(false);
//   };

//   const toggleFavorite = () => {
//     if (isFavourite) {
//       removeFromFavourites(item._id);
//       Alert.alert('Removed from Favourites', `${item.name} has been removed from your favourites.`);
//     } else {
//       addToFavourites(item);
//       Alert.alert('Added to Favourites', `${item.name} has been added to your favourites.`);
//     }
//   };

//   const handleAddToCart = (item) => {
//     const added = addToCart(item);
//     if (added) {
//       Alert.alert('Success', `${item.name} has been added to your cart.`);
//     } else {
//       Alert.alert('Info', `${item.name} is already in your cart.`);
//     }
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
//         {/* Back Button */}
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//           accessibilityLabel="Go Back"
//           accessibilityRole="button"
//         >
//           <Ionicons name="arrow-back" size={28} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>

//         {/* Header Title */}
//         <View style={styles.headerTitleContainer}>
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//             {item.name}
//           </Text>
//           <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}>
//             {item.subjectName} ({item.subjectCode})
//           </Text>
//         </View>
//       </LinearGradient>

//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         {/* Product Image */}
//         <View style={styles.imageContainer}>
//           <Image source={{ uri: item.image }} style={styles.productImage} />
//           {/* Favorite Button */}
//           <TouchableOpacity
//             style={styles.favoriteButton}
//             onPress={toggleFavorite}
//             accessibilityLabel={isFavourite ? 'Remove from favorites' : 'Add to favorites'}
//             accessibilityRole="button"
//           >
//             <Ionicons
//               name={isFavourite ? 'heart' : 'heart-outline'}
//               size={28}
//               color={isFavourite ? '#E91E63' : currentTheme.placeholderTextColor}
//             />
//           </TouchableOpacity>
//         </View>

//         {/* Product Details */}
//         <View style={[styles.detailsContainer, { backgroundColor: currentTheme.cardBackground }]}>
//           <Text style={[styles.productTitle, { color: currentTheme.cardTextColor }]}>
//             {item.name}
//           </Text>
//           <Text style={[styles.productSubtitle, { color: currentTheme.textColor }]}>
//             {item.subjectName} ({item.subjectCode})
//           </Text>

//           {/* Rating */}
//           <View style={styles.ratingContainer}>
//             {Array.from({ length: 5 }, (_, index) => (
//               <Ionicons
//                 key={index}
//                 name={index < Math.floor(item.ratings) ? 'star' : 'star-outline'}
//                 size={20}
//                 color="#FFD700"
//               />
//             ))}
//             <TouchableOpacity onPress={openReviewPopup}>
//               <Text style={[styles.reviewCount, { color: currentTheme.secondaryColor }]}>
//                 ({item.numberOfReviews} reviews)
//               </Text>
//             </TouchableOpacity>
//           </View>

//           {/* Price */}
//           <Text style={[styles.productPrice, { color: currentTheme.priceColor }]}>
//             ${item.price}
//           </Text>

//           {/* Description */}
//           <Text style={[styles.sectionTitle, { color: currentTheme.cardTextColor }]}>
//             Description
//           </Text>
//           <Text style={[styles.productDescription, { color: currentTheme.textColor }]}>
//             {item.description}
//           </Text>

//           {/* Add to Cart Button */}
//           <TouchableOpacity
//             style={[styles.addToCartButton, { backgroundColor: currentTheme.primaryColor }]}
//             onPress={() => handleAddToCart(item)}
//             accessibilityLabel="Add to Cart"
//             accessibilityRole="button"
//           >
//             <MaterialIcons name="add-shopping-cart" size={24} color="#FFFFFF" />
//             <Text style={styles.addToCartButtonText}>Add to Cart</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Review Popup */}
//         <Modal
//           visible={isReviewPopupVisible}
//           animationType="slide"
//           onRequestClose={closeReviewPopup}
//           transparent={true}
//         >
//           <ReviewPopup closePopup={closeReviewPopup} productId={item._id} />
//         </Modal>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// // Styles for the components
// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   header: {
//     width: '100%',
//     paddingVertical: 5,
//     paddingHorizontal: 15,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   backButton: {
//     position: 'absolute',
//     left: 15,
//     top: 10,
//     padding: 8,
//   },
//   headerTitleContainer: {
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//   },
//   headerSubtitle: {
//     fontSize: 16,
//     fontWeight: '400',
//     marginTop: 4,
//   },
//   scrollContent: {
//     paddingBottom: 20,
//   },
//   imageContainer: {
//     position: 'relative',
//   },
//   productImage: {
//     width: width,
//     height: 300,
//     resizeMode: 'cover',
//   },
//   favoriteButton: {
//     position: 'absolute',
//     top: 20,
//     right: 20,
//     backgroundColor: '#FFFFFFAA',
//     borderRadius: 30,
//     padding: 8,
//   },
//   detailsContainer: {
//     padding: 20,
//     marginTop: -20,
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     elevation: 5,
//   },
//   productTitle: {
//     fontSize: 26,
//     fontWeight: '700',
//     marginBottom: 5,
//   },
//   productSubtitle: {
//     fontSize: 18,
//     marginBottom: 10,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   reviewCount: {
//     fontSize: 16,
//     marginLeft: 5,
//     textDecorationLine: 'underline',
//   },
//   productPrice: {
//     fontSize: 24,
//     fontWeight: '700',
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 10,
//   },
//   productDescription: {
//     fontSize: 16,
//     lineHeight: 24,
//     marginBottom: 30,
//   },
//   addToCartButton: {
//     flexDirection: 'row',
//     paddingVertical: 15,
//     borderRadius: 30,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   addToCartButtonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: '600',
//     marginLeft: 10,
//   },
// });

// export default ProductPage;
