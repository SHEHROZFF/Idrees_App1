// controllers/reviewController.js

const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Product = require('../models/Product');

/**
 * @desc    Create a new review
 * @route   POST /api/reviews
 * @access  Private
 */
const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;
  console.log(productId, rating, comment);

  // Validate required fields
  if (!productId || !rating || !comment) {
    res.status(400);
    throw new Error('Product ID, rating, and comment are required.');
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found.');
  }

  // Check if the user has already reviewed this product
  const existingReview = await Review.findOne({
    user: req.user._id,
    product: productId,
  });

  if (existingReview) {
    res.status(400);
    throw new Error('You have already reviewed this product.');
  }

  // Create a new review
  const review = new Review({
    user: req.user._id,
    product: productId,
    name: req.user.name,
    rating: Number(rating),
    comment,
  });
  if (review) {
    // Increment the user's reviewsCount
    await req.user.incrementReviews();
  }
  await review.save();

  // Recalculate product ratings and number of reviews
  await Product.calculateRatings(productId);

  res.status(201).json(review);
});

/**
 * @desc    Get all reviews
 * @route   GET /api/reviews
 * @access  Public
 */
const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .populate('user', 'name email')
    .populate('product', 'name');

  res.json(reviews);
});

/**
 * @desc    Get reviews for a specific product
 * @route   GET /api/reviews/product/:productId
 * @access  Public
 */
const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  console.log(productId);

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found.');
  }

  const reviews = await Review.find({ product: productId })
    .populate('user', 'name email profileImage')
    .populate('product', 'name');

  res.json(reviews);
});

/**
 * @desc    Update a review
 * @route   PUT /api/reviews/:id
 * @access  Private
 */
const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  // Find the review
  const review = await Review.findById(id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found.');
  }

  // Check if the user is the owner of the review
  // if (review.user.toString() !== req.user._id.toString()) {
  //   res.status(401);
  //   throw new Error('Not authorized to update this review.');
  // }

  // Update the review fields
  if (rating) review.rating = Number(rating);
  if (comment) review.comment = comment;

  await review.save();

  // Recalculate product ratings and number of reviews
  await Product.calculateRatings(review.product);

  res.json(review);
});

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Private/Admin
 */
// const deleteReview = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   // Find the review
//   const review = await Review.findById(id);

//   if (!review) {
//     res.status(404);
//     throw new Error('Review not found.');
//   }

//   // Check if the user is the owner of the review or an admin
//   if (
//     review.user.toString() !== req.user._id.toString() &&
//     req.user.role !== 'admin'
//   ) {
//     res.status(401);
//     throw new Error('Not authorized to delete this review.');
//   }

//   const productId = review.product;

//   // Delete the review
//   await review.deleteOne();
//   // Decrement the user's reviewsCount
//   await review.user.decrementReviews();

//   // Recalculate product ratings and number of reviews
//   await Product.calculateRatings(productId);

//   res.json({ message: 'Review deleted successfully.' });
// });
const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found.');
  }
  // Check if the user is the owner of the review or an admin
  if (
    review.user.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(401);
    throw new Error('Not authorized to delete this review.');
  }

  const productId = review.product;
  // Use deleteOne() on the document so middleware is triggered
  await review.deleteOne();

  // Since review.user is stored as an ObjectId, retrieve the user document
  const reviewUser = await User.findById(review.user);
  if (reviewUser) {
    await reviewUser.decrementReviews();
  }

  // Recalculate product ratings and number of reviews
  await Product.calculateRatings(productId);
  res.json({ message: 'Review deleted successfully.' });
});
module.exports = {
  createReview,
  getAllReviews,
  getProductReviews,
  updateReview,
  deleteReview,
};





















// // controllers/reviewController.js

// const asyncHandler = require('express-async-handler');
// const Review = require('../models/Review');
// const Product = require('../models/Product');
// const User = require('../models/User');

// /**
//  * @desc    Create a new review
//  * @route   POST /api/reviews
//  * @access  Private
//  */
// const createReview = asyncHandler(async (req, res) => {
//   const { productId, rating, comment } = req.body;
//   console.log(productId, rating, comment);
  
//   // Validate required fields
//   if (!productId || !rating || !comment) {
//     res.status(400);
//     throw new Error('Product ID, rating, and comment are required.');
//   }

//   // Check if product exists
//   const product = await Product.findById(productId);
//   if (!product) {
//     res.status(404);
//     throw new Error('Product not found.');
//   }

//   // Check if the user has already reviewed this product
//   const existingReview = await Review.findOne({
//     user: req.user._id,
//     product: productId,
//   });

//   if (existingReview) {
//     res.status(400);
//     throw new Error('You have already reviewed this product.');
//   }

//   // Create a new review
//   const review = new Review({
//     user: req.user._id,
//     product: productId,
//     name: req.user.name,
//     rating: Number(rating),
//     comment,
//   });

//   await review.save();
//   // Recalculate product ratings and number of reviews
//   await Product.calculateRatings(productId);

//   res.status(201).json(review);
// });

// /**
//  * @desc    Get all reviews
//  * @route   GET /api/reviews
//  * @access  Public
//  */
// const getAllReviews = asyncHandler(async (req, res) => {
//   const reviews = await Review.find()
//     .populate('user', 'name email')
//     .populate('product', 'name');

//   res.json(reviews);
// });

// /**
//  * @desc    Get reviews for a specific product
//  * @route   GET /api/reviews/product/:productId
//  * @access  Public
//  */
// const getProductReviews = asyncHandler(async (req, res) => {
//   const { productId } = req.params;
//   console.log(productId);
  

//   // Check if product exists
//   const product = await Product.findById(productId);
//   if (!product) {
//     res.status(404);
//     throw new Error('Product not found.');
//   }

//   const reviews = await Review.find({ product: productId })
//     .populate('user', 'name email')
//     .populate('product', 'name');

//   res.json(reviews);
// });

// /**
//  * @desc    Update a review
//  * @route   PUT /api/reviews/:id
//  * @access  Private
//  */
// const updateReview = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { rating, comment } = req.body;

//   // Find the review
//   const review = await Review.findById(id);

//   if (!review) {
//     res.status(404);
//     throw new Error('Review not found.');
//   }

//   // Check if the user is the owner of the review
//   if (review.user.toString() !== req.user._id.toString()) {
//     res.status(401);
//     throw new Error('Not authorized to update this review.');
//   }

//   // Update the review fields
//   if (rating) review.rating = Number(rating);
//   if (comment) review.comment = comment;

//   await review.save();

//   res.json(review);
// });

// /**
//  * @desc    Delete a review
//  * @route   DELETE /api/reviews/:id
//  * @access  Private
//  */
// const deleteReview = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   // Check if the user is the owner of the review
//   // if (review.user.toString() !== req.user._id.toString()) {
//   //   res.status(401);
//   //   throw new Error('Not authorized to delete this review.');
//   // }
//   // Find the review
//   const review = await Review.findByIdAndDelete(id);

//   res.json({ message: 'Review deleted successfully.' });
// });

// module.exports = {
//   createReview,
//   getAllReviews,
//   getProductReviews,
//   updateReview,
//   deleteReview,
// };












