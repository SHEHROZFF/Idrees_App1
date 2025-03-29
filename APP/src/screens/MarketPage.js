// src/screens/MarketPage.js

import React, { useState, useContext, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { debounce } from 'lodash';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';
import { CartContext } from '../contexts/CartContext';
import { FavouritesContext } from '../contexts/FavouritesContext';
import CustomHeader from '../components/CustomHeader';
import CustomAlert from '../components/CustomAlert';

import { fetchProducts } from '../services/api';

const MarketPage = () => {
  const navigation = useNavigation();

  // Theme
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  // Cart & Favourites
  const { addToCart } = useContext(CartContext);
  const { favouriteItems, addToFavourites, removeFromFavourites } =
    useContext(FavouritesContext);

  // Product Data
  const [products, setProducts] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Default');
  const [sortModalVisible, setSortModalVisible] = useState(false);

  // Loading, Error, Refresh
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Alert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertIcon, setAlertIcon] = useState('');
  const [alertButtons, setAlertButtons] = useState([]);

  // For responsive columns
  const { width } = useWindowDimensions();

  // Fetch All Products
  const fetchAllProducts = async (isRefreshing = false) => {
    try {
      if (isRefreshing) setRefreshing(true);
      else setLoading(true);

      const response = await fetchProducts();

      if (isRefreshing) setRefreshing(false);
      else setLoading(false);

      if (response.success) {
        setProducts(response.data.data);
        setFilteredData(sortData(response.data.data, sortOption));
        setError(null);
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setLoading(false);
      setRefreshing(false);

      // Show error alert with retry
      setAlertTitle('Error');
      setAlertMessage(err.message || 'Failed to fetch products.');
      setAlertIcon('alert-circle');
      setAlertButtons([
        {
          text: 'Retry',
          onPress: () => {
            setAlertVisible(false);
            fetchAllProducts(isRefreshing);
          },
        },
      ]);
      setAlertVisible(true);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Responsive Columns
  const getNumberOfColumns = () => {
    if (width <= 375) return 1; // Small screens
    if (width <= 800) return 2; // Medium screens
    if (width <= 1200) return 3; // Large screens
    return 4; // Extra large screens
  };

  const numColumns = getNumberOfColumns();

  // Sorting
  const sortData = (dataToSort, option) => {
    let sortedData = [...dataToSort];
    if (option === 'Name (A-Z)') {
      sortedData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (option === 'Name (Z-A)') {
      sortedData.sort((a, b) => b.name.localeCompare(a.name));
    } else if (option === 'Price (Low to High)') {
      sortedData.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (option === 'Price (High to Low)') {
      sortedData.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }
    return sortedData;
  };

  const handleSortOption = (option) => {
    setSortOption(option);
    setFilteredData(sortData(filteredData, option));
    setSortModalVisible(false);
  };

  // Debounced Search
  const filterData = (text) => {
    const newData = products.filter((item) => {
      const itemData = `
        ${item.subjectName.toUpperCase()}
        ${item.subjectCode.toUpperCase()}
        ${item.name.toUpperCase()}
      `;
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    setFilteredData(sortData(newData, sortOption));
  };

  const debouncedFilter = useCallback(debounce(filterData, 300), [products, sortOption]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    debouncedFilter(text);
  };

  // Add to Cart
  const handleAddToCart = (item) => {
    const added = addToCart(item);
    if (added) {
      setAlertTitle('Success');
      setAlertMessage(`${item.name} has been added to your cart.`);
      setAlertIcon('cart');
    } else {
      setAlertTitle('Info');
      setAlertMessage(`${item.name} is already in your cart.`);
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

  // Toggle Favorite
  const handleToggleFavorite = (item) => {
    const isFavourite = favouriteItems.some((favItem) => favItem._id === item._id);
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

  // Render a single product card
  const renderItem = ({ item }) => {
    const isFavorite = favouriteItems.some((favItem) => favItem._id === item._id);

    return (
      <View style={[styles.card, { backgroundColor: currentTheme.cardBackground, width: getCardWidth() }]}>
        {/* Touchable area for details */}
        <TouchableOpacity
          onPress={() => navigation.navigate('ProductPage', { item })}
          activeOpacity={0.8}
          style={styles.cardTouchable}
        >
          <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />

          {/* Favorite Icon */}
          <TouchableOpacity
            style={styles.favoriteIcon}
            onPress={() => handleToggleFavorite(item)}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? '#E91E63' : currentTheme.placeholderTextColor}
            />
          </TouchableOpacity>

          {/* Content */}
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: currentTheme.cardTextColor }]}>
              {item.name}
            </Text>
            <Text style={[styles.cardSubtitle, { color: currentTheme.textColor }]}>
              {item.subjectName} ({item.subjectCode})
            </Text>

            {/* Rating */}
            <View style={styles.ratingContainer}>
              {Array.from({ length: 5 }, (_, index) => (
                <Ionicons
                  key={index}
                  name={index < Math.floor(item.ratings) ? 'star' : 'star-outline'}
                  size={16}
                  color="#FFD700"
                />
              ))}
              <Text style={[styles.reviewCount, { color: currentTheme.textColor }]}>
                ({item.numberOfReviews})
              </Text>
            </View>

            {/* Price */}
            <Text style={[styles.cardPrice, { color: currentTheme.cardTextColor }]}>
              ${item.price}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Cart Icon (Add to Cart) */}
        <TouchableOpacity
          style={[styles.cartIcon, { backgroundColor: currentTheme.primaryColor }]}
          onPress={() => handleAddToCart(item)}
        >
          <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  };

  // Compute dynamic card width
  const getCardWidth = () => {
    const totalMargin = 20 * (numColumns + 1); // horizontal margin between cards
    const availableWidth = width - totalMargin;
    return availableWidth / numColumns;
  };

  useEffect(() => {
    // Sort initially based on default
    setFilteredData(sortData(products, sortOption));
    // Cleanup
    return () => {
      debouncedFilter.cancel();
    };
  }, [products]);

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      <StatusBar
        backgroundColor={currentTheme.headerBackground[1]}
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
      />

      {/* Optional Custom Header */}
      <CustomHeader />

      {/* Header Title Section */}
      <View style={styles.header}>
        <LinearGradient
          colors={currentTheme.headerBackground}
          style={styles.headerGradient}
          start={[0, 0]}
          end={[0, 1]}
        />
        <Text style={[styles.title, { color: currentTheme.headerTextColor }]}>
          Marketplace
        </Text>
        <Text style={[styles.subTitle, { color: currentTheme.headerTextColor }]}>
          Discover amazing exams & study materials
        </Text>
      </View>

      {/* Search & Sort */}
      <View style={styles.searchSortContainer}>
        <View style={[styles.searchContainer, { backgroundColor: currentTheme.cardBackground }]}>
          <Ionicons
            name="search"
            size={20} // slightly smaller icon
            color={currentTheme.placeholderTextColor}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: currentTheme.textColor }]}
            placeholder="Subject, Code, or Exam Name"
            placeholderTextColor={currentTheme.placeholderTextColor}
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
            multiline={false}        // ensure single line
            textAlignVertical="center"
            numberOfLines={1}       // keep placeholder in one line
            allowFontScaling={false}
          />
        </View>
        <TouchableOpacity
          style={[styles.sortButton, { backgroundColor: currentTheme.primaryColor }]}
          onPress={() => setSortModalVisible(true)}
        >
          <MaterialIcons name="sort" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Sort Modal */}
      {sortModalVisible && (
        <Modal
          visible={sortModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setSortModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback onPress={() => setSortModalVisible(false)}>
              <View style={styles.modalOverlay} />
            </TouchableWithoutFeedback>
            <View style={[styles.modalContent, { backgroundColor: currentTheme.cardBackground }]}>
              <Text style={[styles.modalLabel, { color: currentTheme.cardTextColor }]}>
                Sort By
              </Text>
              <TouchableOpacity style={styles.modalOption} onPress={() => handleSortOption('Name (A-Z)')}>
                <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>Name (A-Z)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalOption} onPress={() => handleSortOption('Name (Z-A)')}>
                <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>Name (Z-A)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => handleSortOption('Price (Low to High)')}
              >
                <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>
                  Price (Low to High)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => handleSortOption('Price (High to Low)')}
              >
                <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>
                  Price (High to Low)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalOption} onPress={() => handleSortOption('Default')}>
                <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>Default</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={currentTheme.primaryColor} />
        </View>
      )}

      {/* Error View (Inline) */}
      {error && !loading && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: currentTheme.errorTextColor }]}>{error}</Text>
          <TouchableOpacity
            onPress={() => fetchAllProducts()}
            style={[styles.retryButton, { backgroundColor: currentTheme.primaryColor }]}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Product List */}
      {!error && (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            numColumns === 1 && styles.singleColumnContent,
          ]}
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="search"
                  size={80}
                  color={currentTheme.placeholderTextColor}
                />
                <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
                  No results found.
                </Text>
              </View>
            )
          }
          numColumns={numColumns}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          key={numColumns}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchAllProducts(true)}
              tintColor={currentTheme.primaryColor}
            />
          }
        />
      )}

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        icon={alertIcon}
        onClose={() => setAlertVisible(false)}
        buttons={alertButtons}
      />
    </View>
  );
};

export default MarketPage;

/* -------------------------------------------
   Styles
------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header
  header: {
    position: 'relative',
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    zIndex: 1,
  },
  subTitle: {
    fontSize: 14,
    marginTop: 6,
    zIndex: 1,
  },
  // Search & Sort
  searchSortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -30,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    borderRadius: 30,
    paddingHorizontal: 15,
    alignItems: 'center',
    flex: 1,
    height: 55,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,             // ensures the input can expand
    minWidth: 0,         // allows placeholder to shrink
    flexShrink: 1,       // prevents text from truncating
    fontSize: 14,        // slightly bigger font for clarity
    lineHeight: 18,      // helps with vertical centering
    paddingVertical: 0,
  },
  sortButton: {
    marginLeft: 10,
    padding: 14,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
  },
  // Modal (Sort)
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 15,
    padding: 20,
    elevation: 10,
    alignItems: 'center',
  },
  modalLabel: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
  },
  modalOption: {
    width: '100%',
    paddingVertical: 10,
  },
  modalOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  // Products List
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 10,
    paddingTop: 5,
  },
  singleColumnContent: {
    alignItems: 'center',
  },
  // Card
  card: {
    borderRadius: 10,
    marginBottom: 15,
    marginHorizontal: 10,
    elevation: 3,
    minHeight: 300,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  cardTouchable: {
    flex: 1,
  },
  cardImage: {
    width: '100%',
    height: 140,
  },
  favoriteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    padding: 5,
  },
  cardContent: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCount: {
    fontSize: 12,
    marginLeft: 5,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 6,
  },
  cartIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    borderRadius: 20,
    padding: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
  },
  // Loading Overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
    zIndex: 999,
  },
  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Empty List
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 15,
  },
});
