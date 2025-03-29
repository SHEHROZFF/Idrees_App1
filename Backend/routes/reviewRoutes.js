// routes/reviewRoutes.js

const express = require('express');
const router = express.Router();
const {
  createReview,
  getAllReviews,
  getProductReviews,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Create a new review
router.post('/', protect, createReview);

// Get all reviews
router.get('/', getAllReviews);

// Get reviews for a specific product
router.get('/product/:productId', getProductReviews);

// Update a review
router.put('/:id', protect, updateReview);

// Delete a review
router.delete('/:id', protect, deleteReview);

module.exports = router;














// // routes/reviewRoutes.js

// const express = require('express');
// const router = express.Router();
// const {
//   addOrUpdateReview,
//   getProductReviews,
//   deleteReview,
// } = require('../controllers/reviewController');

// const { protect, admin } = require('../middleware/authMiddleware');

// // Route to add or update a review
// router.post('/', protect, addOrUpdateReview);

// // Route to get all reviews for a product
// router.get('/:productId', getProductReviews);

// // Route to delete a review
// router.delete('/:reviewId', protect, deleteReview);

// module.exports = router;
