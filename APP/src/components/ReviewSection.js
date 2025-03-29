// components/ReviewSection.js

import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';

const ReviewSection = ({ productId }) => {
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  // Sample reviews data
  const reviews = [
    {
      id: '1',
      userName: 'Alice Johnson',
      rating: 5,
      comment: 'This course was extremely helpful and well-structured.',
      date: 'September 20, 2023',
    },
    // Add more reviews as needed
  ];

  const renderReviewItem = ({ item }) => (
    <View
      style={[
        styles.reviewItem,
        { backgroundColor: currentTheme.cardBackground },
      ]}
    >
      <View style={styles.reviewHeader}>
        <Text style={[styles.userName, { color: currentTheme.textColor }]}>
          {item.userName}
        </Text>
        <View style={styles.ratingContainer}>
          {Array.from({ length: 5 }, (_, index) => (
            <Ionicons
              key={index}
              name={index < Math.floor(item.rating) ? 'star' : 'star-outline'}
              size={16}
              color="#FFD700"
            />
          ))}
        </View>
      </View>
      <Text style={[styles.reviewDate, { color: currentTheme.textColor }]}>
        {item.date}
      </Text>
      <Text style={[styles.reviewComment, { color: currentTheme.textColor }]}>
        {item.comment}
      </Text>
    </View>
  );

  return (
    <View style={styles.reviewSection}>
      <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>
        Reviews
      </Text>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReviewItem}
        contentContainerStyle={styles.reviewList}
        ListEmptyComponent={
          <Text style={[styles.noReviewsText, { color: currentTheme.textColor }]}>
            No reviews yet. Be the first to review!
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  reviewSection: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  reviewList: {
    paddingBottom: 20,
  },
  reviewItem: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  reviewDate: {
    fontSize: 12,
    marginVertical: 5,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  noReviewsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ReviewSection;
