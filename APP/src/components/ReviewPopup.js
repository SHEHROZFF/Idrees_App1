// components/ReviewPopup.js

import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';
import api from '../services/api';
import { UserContext } from '../contexts/UserContext';
import CustomAlert from './CustomAlert';

const { width, height } = Dimensions.get('window');
const placeholderAvatar =
  'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

const ReviewPopup = ({ closePopup, productId }) => {
  // Theming
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  // Navigation
  const navigation = useNavigation();

  // Review Data
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add Review Form
  const [showAddReviewForm, setShowAddReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Alert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertIcon, setAlertIcon] = useState('');
  const [alertButtons, setAlertButtons] = useState([]);

  // Authentication
  const { isAuthenticated } = useContext(UserContext);

  // Fetch reviews on component mount or productId change
  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.getProductReviewsAPI(productId);
      console.log(response.data);
      

      if (response.data) {
        setReviews(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch reviews.');
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while fetching reviews.');
      setLoading(false);
    }
  };

  // Handle Add Review button
  const handleAddReviewClick = () => {
    if (!isAuthenticated) {
      // Show alert requiring login
      setAlertTitle('Authentication Required');
      setAlertMessage('You need to be logged in to add a review.');
      setAlertIcon('warning');
      setAlertButtons([
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setAlertVisible(false),
        },
        {
          text: 'Login',
          onPress: () => {
            setShowAddReviewForm(false);
            closePopup();
            navigation.navigate('Login');
            setAlertVisible(false);
          },
        },
      ]);
      setAlertVisible(true);
      return;
    }
    setShowAddReviewForm(true);
  };

  // Handle submitting the new review
  const handleSubmitReview = async () => {
    if (rating < 1 || rating > 5) {
      setAlertTitle('Error');
      setAlertMessage('Please provide a rating between 1 and 5.');
      setAlertIcon('alert-circle-outline');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
      return;
    }
    if (!comment.trim()) {
      setAlertTitle('Empty Comment');
      setAlertMessage('Please enter a comment.');
      setAlertIcon('information-circle');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.addOrUpdateReview(productId, rating, comment);

      if (response.success) {
        // Refresh list
        await fetchReviews();
        // Reset form
        setRating(0);
        setComment('');
        setShowAddReviewForm(false);

        setAlertTitle('Success');
        setAlertMessage('Your review has been submitted.');
        setAlertIcon('checkmark-circle');
        setAlertButtons([
          {
            text: 'OK',
            onPress: () => {
              setAlertVisible(false);
              closePopup(); // Close after successful submission
            },
          },
        ]);
        setAlertVisible(true);
      } else {
        setAlertTitle('Error');
        setAlertMessage(response.message || 'Failed to submit review.');
        setAlertIcon('close-circle');
        setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
        setAlertVisible(true);
      }
    } catch (err) {
      console.error('Review submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Render a single review item
  const renderReview = (review) => (
    <View
      key={review._id}
      style={[styles.reviewItem, { backgroundColor: currentTheme.cardBackground }]}
    >
      <View style={styles.reviewHeader}>
        <Image source={{ uri: review.user?.profileImage || placeholderAvatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: currentTheme.textColor }]}>
            {review.user?.name || 'Anonymous'}
          </Text>
          <View style={styles.ratingContainer}>
            {Array.from({ length: 5 }, (_, index) => (
              <Ionicons
                key={index}
                name={index < Math.floor(review.rating) ? 'star' : 'star-outline'}
                size={16}
                color="#FFD700"
              />
            ))}
          </View>
        </View>
      </View>
      <Text style={[styles.reviewDate, { color: currentTheme.placeholderTextColor }]}>
        {new Date(review.createdAt).toLocaleDateString()}
      </Text>
      <Text style={[styles.reviewComment, { color: currentTheme.textColor }]}>
        {review.comment}
      </Text>
    </View>
  );

  // Render the form for adding a new review
  const renderAddReviewForm = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.formContainer}
    >
      <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>
        Add a Review
      </Text>

      {/* Rating */}
      <View style={styles.ratingInputContainer}>
        <Text style={[styles.label, { color: currentTheme.textColor }]}>Your Rating:</Text>
        <View style={styles.starRatingContainer}>
          {Array.from({ length: 5 }, (_, index) => (
            <TouchableOpacity key={index} onPress={() => setRating(index + 1)}>
              <Ionicons
                name={index < rating ? 'star' : 'star-outline'}
                size={32}
                color="#FFD700"
                style={styles.starIcon}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Comment */}
      <View style={styles.commentInputContainer}>
        <Text style={[styles.label, { color: currentTheme.textColor }]}>Your Comment:</Text>
        <TextInput
          style={[
            styles.commentInput,
            {
              borderColor: currentTheme.borderColor,
              color: currentTheme.textColor,
              backgroundColor: currentTheme.backgroundColor || '#fff',
            },
          ]}
          multiline
          numberOfLines={4}
          placeholder="Write your review here..."
          placeholderTextColor={currentTheme.placeholderTextColor}
          value={comment}
          onChangeText={setComment}
        />
      </View>

      {/* Buttons */}
      <View style={styles.formButtonsContainer}>
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: currentTheme.primaryColor }]}
          onPress={handleSubmitReview}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Review</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: currentTheme.cancelButtonColor || '#888' }]}
          onPress={() => {
            setShowAddReviewForm(false);
            setRating(0);
            setComment('');
          }}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.modalBackground}>
        <View style={[styles.modalContainer, { backgroundColor: currentTheme.cardBackground }]}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.topRightCloseButton}
            onPress={closePopup}
            accessibilityLabel="Close Reviews"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={24} color={currentTheme.textColor} />
          </TouchableOpacity>

          {/* Main ScrollView for both reviews & form */}
          {loading ? (
            <ActivityIndicator
              size="large"
              color={currentTheme.primaryColor}
              style={{ flex: 1, justifyContent: 'center' }}
            />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: currentTheme.errorColor }]}>{error}</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {/* Toggle: If showAddReviewForm = true, show form, else show reviews */}
              {showAddReviewForm ? (
                renderAddReviewForm()
              ) : (
                <>
                  <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>
                    Reviews
                  </Text>
                  {reviews.length > 0 ? (
                    reviews.map(renderReview)
                  ) : (
                    <Text style={[styles.noReviewsText, { color: currentTheme.textColor }]}>
                      No reviews yet. Be the first to share your feedback!
                    </Text>
                  )}
                </>
              )}
            </ScrollView>
          )}

          {/* Add Review button if not currently showing the form */}
          {!showAddReviewForm && !loading && !error && (
            <TouchableOpacity
              style={[styles.addReviewButton, { backgroundColor: currentTheme.primaryColor }]}
              onPress={handleAddReviewClick}
              accessibilityLabel="Add a Review"
              accessibilityRole="button"
            >
              <Ionicons name="star" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.addReviewButtonText}>Add a Review</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* CustomAlert for errors, warnings, etc. */}
        <CustomAlert
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          icon={alertIcon}
          onClose={() => setAlertVisible(false)}
          buttons={alertButtons}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: height * 0.9,
    borderRadius: 20,
    padding: 20,
    position: 'relative',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Android elevation
    elevation: 5,
  },
  topRightCloseButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 8,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    zIndex: 1,
  },
  modalScroll: {
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  reviewItem: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2.22,
    // Android elevation
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginTop: 3,
  },
  reviewDate: {
    fontSize: 12,
    marginBottom: 6,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  noReviewsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
  },
  addReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 10,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Android elevation
    elevation: 3,
  },
  addReviewButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    marginHorizontal: 10,
    textAlign: 'center',
  },
  // Add Review Form
  formContainer: {
    paddingBottom: 20,
  },
  ratingInputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  starRatingContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    marginHorizontal: 5,
  },
  commentInputContainer: {
    marginBottom: 20,
  },
  commentInput: {
    height: 100,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  formButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submitButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 25,
    marginRight: 5,
    elevation: 2,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 25,
    marginLeft: 5,
    backgroundColor: '#888',
    elevation: 2,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReviewPopup;















// // components/ReviewPopup.js

// import React, { useContext, useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Dimensions,
//   ScrollView,
//   Image,
//   ActivityIndicator,
//   TextInput,
//   KeyboardAvoidingView,
//   Platform,
//   SafeAreaView,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import api from '../services/api';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import CustomAlert from './CustomAlert';
// import { UserContext } from '../contexts/UserContext';

// const { width, height } = Dimensions.get('window');

// const placeholderAvatar =
//   'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

// const ReviewPopup = ({ closePopup, productId }) => {
//   // Theming
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Navigation
//   const navigation = useNavigation();

//   // Review Data
//   const [reviews, setReviews] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Add Review Form
//   const [showAddReviewForm, setShowAddReviewForm] = useState(false);
//   const [rating, setRating] = useState(0);
//   const [comment, setComment] = useState('');
//   const [submitting, setSubmitting] = useState(false);

//   // Alert State
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   // Authentication
//   const { isAuthenticated } = useContext(UserContext);

//   // Fetch all reviews on mount or when productId changes
//   useEffect(() => {
//     fetchReviews();
//   }, [productId]);

//   const fetchReviews = async () => {
//     try {
//       setLoading(true);
//       const response = await api.getProductReviewsAPI(productId);

//       if (response.data) {
//         setReviews(response.data);
//       } else {
//         throw new Error(response.message || 'Failed to fetch reviews.');
//       }
//       setLoading(false);
//     } catch (err) {
//       console.error(err);
//       setError(err.message || 'An error occurred while fetching reviews.');
//       setLoading(false);
//     }
//   };

//   // Handle Add Review button
//   const handleAddReviewClick = async () => {
//     if (!isAuthenticated) {
//       setAlertTitle('Authentication Required');
//       setAlertMessage('You need to be logged in to add a review.');
//       setAlertIcon('warning');
//       setAlertButtons([
//         {
//           text: 'Cancel',
//           style: 'cancel',
//           onPress: () => setAlertVisible(false),
//         },
//         {
//           text: 'Login',
//           onPress: () => {
//             setShowAddReviewForm(false);
//             closePopup();
//             navigation.navigate('Login');
//             setAlertVisible(false);
//           },
//         },
//       ]);
//       setAlertVisible(true);
//       return;
//     }
//     setShowAddReviewForm(true);
//   };

//   // Submit New Review
//   const handleSubmitReview = async () => {
//     if (rating < 1 || rating > 5) {
//       setAlertTitle('Error');
//       setAlertMessage('Please provide a rating between 1 and 5.');
//       setAlertIcon('alert-circle-outline');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//       return;
//     }
//     if (!comment.trim()) {
//       setAlertTitle('Empty Comment');
//       setAlertMessage('Please enter a comment.');
//       setAlertIcon('information-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//       return;
//     }

//     try {
//       setSubmitting(true);
//       const response = await api.addOrUpdateReview(productId, rating, comment);

//       if (response.success) {
//         await fetchReviews(); // Refresh reviews
//         setRating(0);
//         setComment('');
//         setShowAddReviewForm(false);

//         setAlertTitle('Success');
//         setAlertMessage('Your review has been submitted.');
//         setAlertIcon('checkmark-circle');
//         setAlertButtons([
//           {
//             text: 'OK',
//             onPress: () => {
//               setAlertVisible(false);
//               closePopup(); // Close popup after success
//             },
//           },
//         ]);
//         setAlertVisible(true);
//       } else {
//         setAlertTitle('Error');
//         setAlertMessage(response.message || 'Failed to submit review.');
//         setAlertIcon('close-circle');
//         setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//         setAlertVisible(true);
//       }
//     } catch (err) {
//       console.error('Review submission error:', err);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Render single review
//   const renderReview = (review) => {
//     return (
//       <View
//         key={review._id}
//         style={[
//           styles.reviewItem,
//           { backgroundColor: currentTheme.cardBackground },
//         ]}
//       >
//         <View style={styles.reviewHeader}>
//           <Image source={{ uri: placeholderAvatar }} style={styles.avatar} />
//           <View style={styles.userInfo}>
//             <Text style={[styles.userName, { color: currentTheme.textColor }]}>
//               {review.user?.name || 'Anonymous'}
//             </Text>
//             <View style={styles.ratingContainer}>
//               {Array.from({ length: 5 }, (_, index) => (
//                 <Ionicons
//                   key={index}
//                   name={index < Math.floor(review.rating) ? 'star' : 'star-outline'}
//                   size={16}
//                   color="#FFD700"
//                 />
//               ))}
//             </View>
//           </View>
//         </View>
//         <Text style={[styles.reviewDate, { color: currentTheme.placeholderTextColor }]}>
//           {new Date(review.createdAt).toLocaleDateString()}
//         </Text>
//         <Text style={[styles.reviewComment, { color: currentTheme.textColor }]}>
//           {review.comment}
//         </Text>
//       </View>
//     );
//   };

//   // Render new review form
//   const renderAddReviewForm = () => (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//       style={styles.formContainer}
//     >
//       <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>
//         Add a Review
//       </Text>

//       {/* Rating Input */}
//       <View style={styles.ratingInputContainer}>
//         <Text style={[styles.label, { color: currentTheme.textColor }]}>Your Rating:</Text>
//         <View style={styles.starRatingContainer}>
//           {Array.from({ length: 5 }, (_, index) => (
//             <TouchableOpacity key={index} onPress={() => setRating(index + 1)}>
//               <Ionicons
//                 name={index < rating ? 'star' : 'star-outline'}
//                 size={32}
//                 color="#FFD700"
//                 style={styles.starIcon}
//               />
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>

//       {/* Comment Input */}
//       <View style={styles.commentInputContainer}>
//         <Text style={[styles.label, { color: currentTheme.textColor }]}>Your Comment:</Text>
//         <TextInput
//           style={[
//             styles.commentInput,
//             {
//               borderColor: currentTheme.borderColor,
//               color: currentTheme.textColor,
//               backgroundColor: currentTheme.backgroundColor || '#fff',
//             },
//           ]}
//           multiline
//           numberOfLines={4}
//           placeholder="Write your review here..."
//           placeholderTextColor={currentTheme.placeholderTextColor}
//           value={comment}
//           onChangeText={setComment}
//         />
//       </View>

//       {/* Submit & Cancel Buttons */}
//       <View style={styles.formButtonsContainer}>
//         <TouchableOpacity
//           style={[styles.submitButton, { backgroundColor: currentTheme.primaryColor }]}
//           onPress={handleSubmitReview}
//           disabled={submitting}
//         >
//           {submitting ? (
//             <ActivityIndicator color="#FFFFFF" />
//           ) : (
//             <Text style={styles.submitButtonText}>Submit Review</Text>
//           )}
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[
//             styles.cancelButton,
//             { backgroundColor: currentTheme.cancelButtonColor || '#888' },
//           ]}
//           onPress={() => {
//             setShowAddReviewForm(false);
//             setRating(0);
//             setComment('');
//           }}
//         >
//           <Text style={styles.cancelButtonText}>Cancel</Text>
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.modalBackground}>
//         <View style={[styles.modalContainer, { backgroundColor: currentTheme.cardBackground }]}>
//           {/* Close Button */}
//           <TouchableOpacity
//             style={styles.topRightCloseButton}
//             onPress={closePopup}
//             accessibilityLabel="Close Reviews"
//             accessibilityRole="button"
//           >
//             <Ionicons name="close" size={24} color={currentTheme.textColor} />
//           </TouchableOpacity>

//           {loading ? (
//             <ActivityIndicator
//               size="large"
//               color={currentTheme.primaryColor}
//               style={{ flex: 1, justifyContent: 'center' }}
//             />
//           ) : error ? (
//             <View style={styles.errorContainer}>
//               <Text style={[styles.errorText, { color: currentTheme.errorColor }]}>
//                 {error}
//               </Text>
//             </View>
//           ) : showAddReviewForm ? (
//             <ScrollView contentContainerStyle={styles.modalContent}>{renderAddReviewForm()}</ScrollView>
//           ) : (
//             // Review List
//             <ScrollView contentContainerStyle={styles.modalContent}>
//               <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>
//                 Reviews
//               </Text>
//               {reviews.length > 0 ? (
//                 reviews.map(renderReview)
//               ) : (
//                 <Text style={[styles.noReviewsText, { color: currentTheme.textColor }]}>
//                   No reviews yet. Be the first to share your feedback!
//                 </Text>
//               )}
//             </ScrollView>
//           )}

//           {/* Footer Button (Add Review or Return) */}
//           {showAddReviewForm ? null : (
//             <TouchableOpacity
//               style={[styles.addReviewButton, { backgroundColor: currentTheme.primaryColor }]}
//               onPress={handleAddReviewClick}
//               accessibilityLabel="Add a Review"
//               accessibilityRole="button"
//             >
//               <Ionicons name="star" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
//               <Text style={styles.addReviewButtonText}>Add a Review</Text>
//             </TouchableOpacity>
//           )}
//         </View>

//         {/* CustomAlert */}
//         <CustomAlert
//           visible={alertVisible}
//           title={alertTitle}
//           message={alertMessage}
//           icon={alertIcon}
//           onClose={() => setAlertVisible(false)}
//           buttons={alertButtons}
//         />
//       </View>
//     </SafeAreaView>
//   );
// };

// // Enhanced Styles
// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   modalBackground: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent dark overlay
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     width: width * 0.9,
//     maxHeight: height * 0.9,
//     borderRadius: 20,
//     padding: 20,
//     position: 'relative', // for the close button
//     // iOS Shadow
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     // Android Elevation
//     elevation: 4,
//   },
//   topRightCloseButton: {
//     position: 'absolute',
//     top: 15,
//     right: 15,
//     padding: 8,
//     borderRadius: 15,
//     backgroundColor: 'rgba(0, 0, 0, 0.1)',
//     zIndex: 1,
//   },
//   modalContent: {
//     paddingTop: 20,
//     paddingBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   reviewItem: {
//     borderRadius: 15,
//     padding: 15,
//     marginBottom: 15,
//     // iOS Shadow
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.08,
//     shadowRadius: 2.22,
//     // Android Elevation
//     elevation: 2,
//   },
//   reviewHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   avatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//   },
//   userInfo: {
//     marginLeft: 15,
//     flex: 1,
//   },
//   userName: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     marginTop: 3,
//   },
//   reviewDate: {
//     fontSize: 12,
//     marginBottom: 6,
//   },
//   reviewComment: {
//     fontSize: 14,
//     lineHeight: 20,
//   },
//   noReviewsText: {
//     fontSize: 16,
//     textAlign: 'center',
//     marginTop: 40,
//   },
//   addReviewButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 14,
//     borderRadius: 25,
//     marginTop: 10,
//     marginBottom: 5,
//     // iOS Shadow
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     // Android Elevation
//     elevation: 3,
//   },
//   addReviewButtonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorText: {
//     fontSize: 16,
//     marginHorizontal: 10,
//     textAlign: 'center',
//   },
//   formContainer: {
//     paddingHorizontal: 10,
//     paddingBottom: 20,
//   },
//   ratingInputContainer: {
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 8,
//   },
//   starRatingContainer: {
//     flexDirection: 'row',
//   },
//   starIcon: {
//     marginHorizontal: 5,
//   },
//   commentInputContainer: {
//     marginBottom: 20,
//   },
//   commentInput: {
//     height: 100,
//     borderWidth: 1,
//     borderRadius: 10,
//     padding: 10,
//     textAlignVertical: 'top',
//     fontSize: 16,
//   },
//   formButtonsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   submitButton: {
//     flex: 1,
//     alignItems: 'center',
//     paddingVertical: 14,
//     borderRadius: 25,
//     marginRight: 5,
//     elevation: 2,
//   },
//   submitButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   cancelButton: {
//     flex: 1,
//     alignItems: 'center',
//     paddingVertical: 14,
//     borderRadius: 25,
//     marginLeft: 5,
//     backgroundColor: '#888',
//     elevation: 2,
//   },
//   cancelButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

// export default ReviewPopup;



















// // components/ReviewPopup.js

// import React, { useContext, useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Dimensions,
//   ScrollView,
//   Image,
//   Alert,
//   SafeAreaView,
//   ActivityIndicator,
//   TextInput,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import api from '../services/api';
// import { useNavigation } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import CustomAlert from '../components/CustomAlert'; // Import CustomAlert
// import { UserContext } from '../contexts/UserContext';


// // Get device dimensions
// const { width, height } = Dimensions.get('window');

// // Placeholder avatar image
// const placeholderAvatar =
//   'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

// const ReviewPopup = ({ closePopup, productId }) => {
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const navigation = useNavigation();

//   const [reviews, setReviews] = useState([]); // State to hold reviews
//   const [loading, setLoading] = useState(true); // Loading state
//   const [error, setError] = useState(null); // Error state
//   const [showAddReviewForm, setShowAddReviewForm] = useState(false); // State to toggle between list and form
//   const [rating, setRating] = useState(0); // Rating input
//   const [comment, setComment] = useState(''); // Comment input
//   const [submitting, setSubmitting] = useState(false); // Submitting state

//   // State for controlling the CustomAlert
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   const { isAuthenticated } = useContext(UserContext); // Consume UserContext

//   useEffect(() => {
//     fetchReviews();
//   }, [productId]);

//   // Fetch reviews using the API module
//   const fetchReviews = async () => {
//     try {
//       setLoading(true);
//       const response = await api.getProductReviewsAPI(productId);

//       if (response.data) {
//         setReviews(response.data);
//       } else {
//         throw new Error(response.message || 'Failed to fetch reviews.');
//       }

//       setLoading(false);
//     } catch (err) {
//       console.error(err);
//       setError(err.message || 'An error occurred while fetching reviews.');
//       setLoading(false);
//     }
//   };

//   // Handle Add Review button click
//   const handleAddReviewClick = async () => {
//     // const token = await AsyncStorage.getItem('token');
//     // console.log(isAuthenticated);
    
//     if (!isAuthenticated) {
//       setAlertTitle('Authentication Required');
//       setAlertMessage('You need to be logged in to add a review.');
//       setAlertIcon('warning');
//       setAlertButtons([
//         {
//           text: 'Cancel',
//           style: 'cancel',
//           onPress: () => setAlertVisible(false),
//         },
//         {
//           text: 'Login',
//           onPress: () => {
//             setShowAddReviewForm(false);
//             closePopup();
//             navigation.navigate('Login');
//             setAlertVisible(false);
//           },
//         },
//       ]);
//       setAlertVisible(true);
//       return;
//     }
//     setShowAddReviewForm(true);
//   };
  

//   // Handle submitting the new review
//   const handleSubmitReview = async () => {
//     // Input validation
//     if (rating < 1 || rating > 5) {
//       setAlertTitle('Error');
//       setAlertMessage('Please provide both a rating and a review.');
//       setAlertIcon('alert-circle-outline');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => setAlertVisible(false),
//         },
//       ]);
//       setAlertVisible(true);
//       return;
//     }
//     if (!comment.trim()) {
//       setAlertTitle('Empty Comment');
//       setAlertMessage('Please enter a comment.');
//       setAlertIcon('information-circle');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => setAlertVisible(false),
//         },
//       ]);
//       setAlertVisible(true);
//       // Alert.alert('Empty Comment', 'Please enter a comment.');
//       return;
//     }

//     try {
//       setSubmitting(true);
//       const response = await api.addOrUpdateReview(productId, rating, comment);

//       if (response.success) {
//         // Refresh the reviews list
//         await fetchReviews();
//         // Reset the form
//         setRating(0);
//         setComment('');
//         setShowAddReviewForm(false);
//         setAlertTitle('Success');
//         setAlertMessage('Your review has been submitted.');
//         setAlertIcon('checkmark-circle');
//         setAlertButtons([
//           {
//             text: 'OK',
//             onPress: () => {
//               setAlertVisible(false);
//               closePopup(); // Close the popup after submission
//             },
//           },
//         ]);
//         setAlertVisible(true);

//         // Alert.alert('Success', 'Your review has been submitted.');
//       } else {
//         setAlertTitle('Error');
//         setAlertMessage(response.message || 'Failed to submit review.');
//         setAlertIcon('close-circle');
//         setAlertButtons([
//           {
//             text: 'OK',
//             onPress: () => setAlertVisible(false),
//           },
//         ]);
//         setAlertVisible(true);

//         // Alert.alert('Error', response.message || 'Failed to submit review.');
//         // throw new Error(response.message || 'Failed to submit review.');
//       }
//     } catch (err) {
//       // console.error(err);
//       // throw new Error(response.message || 'Failed to submit review.');
//       // Alert.alert('Error', err.message || 'Failed to submit review.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Render individual review item
//   const renderReview = (review) => {
//     return (
//       <View
//         key={review._id}
//         style={[
//           styles.reviewItem,
//           { backgroundColor: currentTheme.backgroundColor },
//         ]}
//       >
//         <View style={styles.reviewHeader}>
//           <Image
//             source={{ uri: placeholderAvatar }}
//             style={styles.avatar}
//           />
//           <View style={styles.userInfo}>
//             <Text style={[styles.userName, { color: currentTheme.textColor }]}>
//               {review.user?.name || 'Anonymous'}
//             </Text>
//             <View style={styles.ratingContainer}>
//               {Array.from({ length: 5 }, (_, index) => (
//                 <Ionicons
//                   key={index}
//                   name={index < Math.floor(review.rating) ? 'star' : 'star-outline'}
//                   size={16}
//                   color="#FFD700"
//                 />
//               ))}
//             </View>
//           </View>
//         </View>
//         <Text
//           style={[
//             styles.reviewDate,
//             { color: currentTheme.placeholderTextColor },
//           ]}
//         >
//           {new Date(review.createdAt).toLocaleDateString()}
//         </Text>
//         <Text style={[styles.reviewComment, { color: currentTheme.textColor }]}>
//           {review.comment}
//         </Text>
//       </View>
//     );
//   };

//   // Render the Add Review Form
//   const renderAddReviewForm = () => {
//     return (
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//         style={styles.formContainer}
//       >
//         <Text
//           style={[styles.sectionTitle, { color: currentTheme.textColor }]}
//         >
//           Add a Review
//         </Text>
//         {/* Rating Input */}
//         <View style={styles.ratingInputContainer}>
//           <Text style={[styles.label, { color: currentTheme.textColor }]}>
//             Your Rating:
//           </Text>
//           <View style={styles.starRatingContainer}>
//             {Array.from({ length: 5 }, (_, index) => (
//               <TouchableOpacity
//                 key={index}
//                 onPress={() => setRating(index + 1)}
//               >
//                 <Ionicons
//                   name={index < rating ? 'star' : 'star-outline'}
//                   size={32}
//                   color="#FFD700"
//                   style={styles.starIcon}
//                 />
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>
//         {/* Comment Input */}
//         <View style={styles.commentInputContainer}>
//           <Text style={[styles.label, { color: currentTheme.textColor }]}>
//             Your Comment:
//           </Text>
//           <TextInput
//             style={[
//               styles.commentInput,
//               {
//                 borderColor: currentTheme.borderColor,
//                 color: currentTheme.textColor,
//                 backgroundColor: currentTheme.backgroundColor || '#fff',
//               },
//             ]}
//             multiline
//             numberOfLines={4}
//             placeholder="Write your review here..."
//             placeholderTextColor={currentTheme.placeholderTextColor}
//             value={comment}
//             onChangeText={setComment}
//           />
//         </View>
//         {/* Submit and Cancel Buttons */}
//         <View style={styles.formButtonsContainer}>
//           <TouchableOpacity
//             style={[
//               styles.submitButton,
//               { backgroundColor: currentTheme.primaryColor },
//             ]}
//             onPress={handleSubmitReview}
//             disabled={submitting}
//           >
//             {submitting ? (
//               <ActivityIndicator color="#FFFFFF" />
//             ) : (
//               <Text style={styles.submitButtonText}>Submit Review</Text>
//             )}
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[
//               styles.cancelButton,
//               { backgroundColor: currentTheme.cancelButtonColor || '#888' },
//             ]}
//             onPress={() => {
//               setShowAddReviewForm(false);
//               setRating(0);
//               setComment('');
//             }}
//           >
//             <Text style={styles.cancelButtonText}>Cancel</Text>
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.modalBackground}>
//         <View
//           style={[
//             styles.modalContainer,
//             { backgroundColor: currentTheme.cardBackground },
//           ]}
//         >
//           {/* Close Button */}
//           <TouchableOpacity
//             style={styles.topRightCloseButton}
//             onPress={closePopup}
//             accessibilityLabel="Close Reviews"
//             accessibilityRole="button"
//           >
//             <Ionicons name="close" size={24} color={currentTheme.textColor} />
//           </TouchableOpacity>

//           {loading ? (
//             <ActivityIndicator
//               size="large"
//               color={currentTheme.primaryColor}
//               style={{ flex: 1, justifyContent: 'center' }}
//             />
//           ) : error ? (
//             <View style={styles.errorContainer}>
//               <Text
//                 style={[styles.errorText, { color: currentTheme.errorColor }]}
//               >
//                 {error}
//               </Text>
//             </View>
//           ) : showAddReviewForm ? (
//             // Render Add Review Form
//             <ScrollView contentContainerStyle={styles.modalContent}>
//               {renderAddReviewForm()}
//             </ScrollView>
//           ) : (
//             // Render Reviews List
//             <ScrollView contentContainerStyle={styles.modalContent}>
//               <Text
//                 style={[styles.sectionTitle, { color: currentTheme.textColor }]}
//               >
//                 Reviews
//               </Text>
//               {reviews.length > 0 ? (
//                 reviews.map(renderReview)
//               ) : (
//                 <Text
//                   style={[
//                     styles.noReviewsText,
//                     { color: currentTheme.textColor },
//                   ]}
//                 >
//                   No reviews yet. Be the first to review!
//                 </Text>
//               )}
//             </ScrollView>
//           )}

//           {/* Conditional rendering of Add Review or Back to Reviews Button */}
//           {showAddReviewForm ? null : (
//             <TouchableOpacity
//               style={[
//                 styles.addReviewButton,
//                 { backgroundColor: currentTheme.primaryColor },
//               ]}
//               onPress={handleAddReviewClick}
//               accessibilityLabel="Add a Review"
//               accessibilityRole="button"
//             >
//               <Ionicons
//                 name="star"
//                 size={20}
//                 color="#FFFFFF"
//                 style={{ marginRight: 8 }}
//               />
//               <Text style={styles.addReviewButtonText}>Add a Review</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//         <CustomAlert
//         visible={alertVisible}
//         title={alertTitle}
//         message={alertMessage}
//         icon={alertIcon}
//         onClose={() => setAlertVisible(false)}
//         buttons={alertButtons}
//       />
//       </View>
//     </SafeAreaView>
//   );
// };

// // Styles for the ReviewPopup component
// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   modalBackground: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     width: width * 0.9,
//     maxHeight: height * 0.9,
//     borderRadius: 20,
//     padding: 20,
//     position: 'relative', // To position the close button
//   },
//   topRightCloseButton: {
//     position: 'absolute',
//     top: 15,
//     right: 15,
//     padding: 5,
//     borderRadius: 15,
//     backgroundColor: 'rgba(0, 0, 0, 0.1)', // Slightly darker background
//     zIndex: 1, // Ensure it's above other elements
//   },
//   modalContent: {
//     paddingTop: 20, // To prevent content from being hidden behind the close button
//     paddingBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   reviewItem: {
//     borderRadius: 15,
//     padding: 15,
//     marginBottom: 15,
//     // Shadow for iOS
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3.84,
//     // Elevation for Android
//     elevation: 2,
//   },
//   reviewHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   avatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//   },
//   userInfo: {
//     marginLeft: 15,
//     flex: 1,
//   },
//   userName: {
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     marginTop: 5,
//   },
//   reviewDate: {
//     fontSize: 12,
//     color: '#757575',
//     marginBottom: 10,
//   },
//   reviewComment: {
//     fontSize: 16,
//     lineHeight: 22,
//   },
//   noReviewsText: {
//     fontSize: 16,
//     textAlign: 'center',
//     marginTop: 50,
//   },
//   addReviewButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 14,
//     borderRadius: 25,
//     marginTop: 10,
//     marginBottom: 5,
//     elevation: 3,
//     // Shadow for iOS
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   addReviewButtonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorText: {
//     fontSize: 16,
//   },
//   formContainer: {
//     paddingHorizontal: 10,
//     paddingBottom: 20,
//   },
//   ratingInputContainer: {
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 10,
//   },
//   starRatingContainer: {
//     flexDirection: 'row',
//   },
//   starIcon: {
//     marginHorizontal: 5,
//   },
//   commentInputContainer: {
//     marginBottom: 20,
//   },
//   commentInput: {
//     height: 100,
//     borderWidth: 1,
//     borderRadius: 10,
//     padding: 10,
//     textAlignVertical: 'top',
//     fontSize: 16,
//   },
//   formButtonsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   submitButton: {
//     flex: 1,
//     alignItems: 'center',
//     paddingVertical: 14,
//     borderRadius: 25,
//     marginRight: 5,
//     elevation: 2,
//   },
//   submitButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   cancelButton: {
//     flex: 1,
//     alignItems: 'center',
//     paddingVertical: 14,
//     borderRadius: 25,
//     marginLeft: 5,
//     backgroundColor: '#888',
//     elevation: 2,
//   },
//   cancelButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

// export default ReviewPopup;






















// // components/ReviewPopup.js

// import React, { useContext, useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Dimensions,
//   ScrollView,
//   Image,
//   Alert,
//   SafeAreaView,
//   ActivityIndicator,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import api from '../services/api'; // Import your API module

// // Get device dimensions
// const { width, height } = Dimensions.get('window');

// // Placeholder avatar image
// const placeholderAvatar =
//   'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

// const ReviewPopup = ({ closePopup, productId }) => {
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   const [reviews, setReviews] = useState([]); // State to hold reviews
//   const [loading, setLoading] = useState(true); // Loading state
//   const [error, setError] = useState(null); // Error state

//   useEffect(() => {
//     // Fetch reviews using the API module
//     const fetchReviews = async () => {
//       try {
//         const response = await api.getProductReviewsAPI(productId);

//         if (response.data) {
//           setReviews(response.data);
//         } else {
//           throw new Error(response.message || 'Failed to fetch reviews.');
//         }

//         setLoading(false);
//       } catch (err) {
//         console.error(err);
//         setError(err.message || 'An error occurred while fetching reviews.');
//         setLoading(false);
//       }
//     };

//     fetchReviews();
//   }, [productId]);

//   // Render individual review item
//   const renderReview = (review) => {
//     return (
//       <View
//         key={review._id}
//         style={[
//           styles.reviewItem,
//           { backgroundColor: currentTheme.backgroundColor },
//         ]}
//       >
//         <View style={styles.reviewHeader}>
//           <Image
//             source={{ uri: placeholderAvatar }} // Placeholder avatar
//             style={styles.avatar}
//           />
//           <View style={styles.userInfo}>
//             <Text style={[styles.userName, { color: currentTheme.textColor }]}>
//               {review.user?.name || 'Anonymous'}
//             </Text>
//             <View style={styles.ratingContainer}>
//               {Array.from({ length: 5 }, (_, index) => (
//                 <Ionicons
//                   key={index}
//                   name={index < Math.floor(review.rating) ? 'star' : 'star-outline'}
//                   size={16}
//                   color="#FFD700"
//                 />
//               ))}
//             </View>
//           </View>
//         </View>
//         <Text
//           style={[
//             styles.reviewDate,
//             { color: currentTheme.placeholderTextColor },
//           ]}
//         >
//           {new Date(review.createdAt).toLocaleDateString()}
//         </Text>
//         <Text style={[styles.reviewComment, { color: currentTheme.textColor }]}>
//           {review.comment}
//         </Text>
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.modalBackground}>
//         <View
//           style={[
//             styles.modalContainer,
//             { backgroundColor: currentTheme.cardBackground },
//           ]}
//         >
//           {/* Close Button */}
//           <TouchableOpacity
//             style={styles.topRightCloseButton}
//             onPress={closePopup}
//             accessibilityLabel="Close Reviews"
//             accessibilityRole="button"
//           >
//             <Ionicons name="close" size={24} color={currentTheme.textColor} />
//           </TouchableOpacity>

//           {loading ? (
//             <ActivityIndicator
//               size="large"
//               color={currentTheme.primaryColor}
//               style={{ flex: 1, justifyContent: 'center' }}
//             />
//           ) : error ? (
//             <View style={styles.errorContainer}>
//               <Text
//                 style={[styles.errorText, { color: currentTheme.errorColor }]}
//               >
//                 {error}
//               </Text>
//             </View>
//           ) : (
//             <ScrollView contentContainerStyle={styles.modalContent}>
//               <Text
//                 style={[styles.sectionTitle, { color: currentTheme.textColor }]}
//               >
//                 Reviews
//               </Text>
//               {reviews.length > 0 ? (
//                 reviews.map(renderReview)
//               ) : (
//                 <Text
//                   style={[
//                     styles.noReviewsText,
//                     { color: currentTheme.textColor },
//                   ]}
//                 >
//                   No reviews yet. Be the first to review!
//                 </Text>
//               )}
//             </ScrollView>
//           )}

//           {/* Add Review Button */}
//           <TouchableOpacity
//             style={[
//               styles.addReviewButton,
//               { backgroundColor: currentTheme.primaryColor },
//             ]}
//             onPress={() => {
//               // Implement add review functionality or navigate to a review form
//               Alert.alert('Feature Coming Soon', 'You can add a review shortly.');
//             }}
//             accessibilityLabel="Add a Review"
//             accessibilityRole="button"
//           >
//             <Ionicons
//               name="star"
//               size={20}
//               color="#FFFFFF"
//               style={{ marginRight: 8 }}
//             />
//             <Text style={styles.addReviewButtonText}>Add a Review</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// };

// // Styles for the ReviewPopup component
// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   modalBackground: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     width: width * 0.9,
//     maxHeight: height * 0.8,
//     borderRadius: 20,
//     padding: 20,
//     position: 'relative', // To position the close button
//   },
//   topRightCloseButton: {
//     position: 'absolute',
//     top: 15,
//     right: 15,
//     padding: 5,
//     borderRadius: 15,
//     backgroundColor: 'rgba(255, 255, 255, 0.3)', // Semi-transparent background
//     zIndex: 1, // Ensure it's above other elements
//   },
//   modalContent: {
//     paddingTop: 20, // To prevent content from being hidden behind the close button
//     paddingBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   reviewItem: {
//     borderRadius: 15,
//     padding: 15,
//     marginBottom: 15,
//   },
//   reviewHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//   },
//   userInfo: {
//     marginLeft: 10,
//     flex: 1,
//   },
//   userName: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     marginTop: 2,
//   },
//   reviewDate: {
//     fontSize: 12,
//     color: '#757575',
//     marginBottom: 5,
//   },
//   reviewComment: {
//     fontSize: 14,
//     lineHeight: 20,
//   },
//   noReviewsText: {
//     fontSize: 16,
//     textAlign: 'center',
//     marginTop: 20,
//   },
//   addReviewButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     borderRadius: 25,
//     marginTop: 10,
//     elevation: 3,
//     // Shadow for iOS
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   addReviewButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorText: {
//     fontSize: 16,
//   },
// });

// export default ReviewPopup;


















