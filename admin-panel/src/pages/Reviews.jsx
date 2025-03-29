// src/pages/Reviews.jsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllReviews,
  deleteReview,
  updateReview,
  createReview,
} from '../redux/slices/reviewsSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import { Transition } from '@headlessui/react';

const Reviews = () => {
  const dispatch = useDispatch();
  const { reviews, loading, error } = useSelector((state) => state.reviews);

  const [showForm, setShowForm] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;

  // Fetch reviews on component mount
  useEffect(() => {
    dispatch(fetchAllReviews());
  }, [dispatch]);

  // Formik setup for edit/add review
  const formik = useFormik({
    initialValues: {
      productId: currentReview ? currentReview.product._id : '',
      rating: currentReview ? currentReview.rating : 5,
      comment: currentReview ? currentReview.comment : '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      productId: Yup.string().required('Product ID is required'),
      rating: Yup.number()
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating cannot exceed 5')
        .required('Rating is required'),
      comment: Yup.string().required('Comment is required'),
    }),
    onSubmit: (values) => {
      if (currentReview) {
        // Update review
        const reviewData = {
          productId: values.productId,
          rating: values.rating,
          comment: values.comment,
        };
        dispatch(updateReview({ id: currentReview._id, reviewData }));
      } else {
        // Create a new review
        const reviewData = {
          productId: values.productId,
          rating: values.rating,
          comment: values.comment,
        };
        dispatch(createReview(reviewData));
      }
      setShowForm(false);
      setCurrentReview(null);
      formik.resetForm();
      setCurrentPage(1); // Reset to first page on update
    },
  });

  // Handle edit button click
  const handleEdit = (review) => {
    setCurrentReview(review);
    setShowForm(true);
  };

  // Handle delete button click
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      dispatch(deleteReview(id));

      // Adjust current page if necessary
      const indexOfLastReview = currentPage * reviewsPerPage;
      const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
      const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
      if (currentReviews.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  // Calculate pagination details
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* Reviews Management Title */}
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Reviews Management
      </h2>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      {/* Add Review Button */}
      <button
        onClick={() => {
          setCurrentReview(null);
          setShowForm(true);
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-6 flex items-center"
        aria-label="Add Review"
      >
        <FaPlus className="mr-2" />
        Add Review
      </button>

      {/* Reviews Table */}
      {loading ? (
        <div className="text-gray-800 dark:text-gray-200">Loading...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Review ID
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Comment
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentReviews.map((review) => (
                  <tr
                    key={review._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
                      {review._id}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
                      {review.user.name} ({review.user.email})
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
                      {review.product.name}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }, (_, index) => (
                          <span key={index} className="text-yellow-500">
                            {index < Math.floor(review.rating) ? '★' : '☆'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
                      {review.comment}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200 flex items-center">
                      <button
                        onClick={() => handleEdit(review)}
                        className="text-blue-500 hover:underline flex items-center mr-2"
                        aria-label={`Edit review ${review._id}`}
                      >
                        <FaEdit className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="text-red-500 hover:underline flex items-center"
                        aria-label={`Delete review ${review._id}`}
                      >
                        <FaTrash className="mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {currentReviews.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-4 px-6 text-center text-gray-600 dark:text-gray-400"
                    >
                      No reviews found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {reviews.length > reviewsPerPage && (
            <div className="flex justify-center mt-6">
              <nav aria-label="Page navigation">
                <ul className="inline-flex -space-x-px">
                  {/* Previous Page Button */}
                  <li>
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 ml-0 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        currentPage === 1
                          ? 'cursor-not-allowed opacity-50'
                          : ''
                      }`}
                      aria-label="Previous Page"
                    >
                      <FaChevronLeft />
                    </button>
                  </li>

                  {/* Page Numbers */}
                  {[...Array(totalPages)].map((_, index) => (
                    <li key={index + 1}>
                      <button
                        onClick={() => paginate(index + 1)}
                        className={`px-3 py-2 leading-tight border border-gray-300 dark:border-gray-700 ${
                          currentPage === index + 1
                            ? 'text-blue-600 bg-blue-50 dark:bg-gray-700 dark:text-white'
                            : 'text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        aria-label={`Go to page ${index + 1}`}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}

                  {/* Next Page Button */}
                  <li>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        currentPage === totalPages
                          ? 'cursor-not-allowed opacity-50'
                          : ''
                      }`}
                      aria-label="Next Page"
                    >
                      <FaChevronRight />
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}

          {/* Add/Edit Review Modal */}
          <Transition
            show={showForm}
            enter="transition ease-out duration-300 transform"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-200 transform"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-4 overflow-y-auto">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                  {currentReview ? 'Edit Review' : 'Add New Review'}
                </h3>
                <form onSubmit={formik.handleSubmit}>
                  {/* Product ID Field */}
                  <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-200">
                      Product ID
                    </label>
                    <input
                      type="text"
                      name="productId"
                      className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                        formik.touched.productId && formik.errors.productId
                          ? 'border-red-500 focus:ring-red-200'
                          : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                      }`}
                      value={formik.values.productId}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter Product ID"
                    />
                    {formik.touched.productId && formik.errors.productId && (
                      <div className="text-red-500 text-sm mt-1">
                        {formik.errors.productId}
                      </div>
                    )}
                  </div>

                  {/* Rating Field */}
                  <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-200">
                      Rating
                    </label>
                    <select
                      name="rating"
                      className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                        formik.touched.rating && formik.errors.rating
                          ? 'border-red-500 focus:ring-red-200'
                          : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                      }`}
                      value={formik.values.rating}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <option value={5}>5 - Excellent</option>
                      <option value={4}>4 - Very Good</option>
                      <option value={3}>3 - Good</option>
                      <option value={2}>2 - Fair</option>
                      <option value={1}>1 - Poor</option>
                    </select>
                    {formik.touched.rating && formik.errors.rating && (
                      <div className="text-red-500 text-sm mt-1">
                        {formik.errors.rating}
                      </div>
                    )}
                  </div>

                  {/* Comment Field */}
                  <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-200">
                      Comment
                    </label>
                    <textarea
                      name="comment"
                      rows="3"
                      className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                        formik.touched.comment && formik.errors.comment
                          ? 'border-red-500 focus:ring-red-200'
                          : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                      }`}
                      value={formik.values.comment}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Your feedback here..."
                    ></textarea>
                    {formik.touched.comment && formik.errors.comment && (
                      <div className="text-red-500 text-sm mt-1">
                        {formik.errors.comment}
                      </div>
                    )}
                  </div>

                  {/* Form Buttons */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setCurrentReview(null);
                        formik.resetForm();
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    >
                      {currentReview ? 'Update' : 'Add'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </Transition>
        </>
      )}
    </div>
  );
};

export default Reviews;






























// // src/pages/Reviews.jsx

// import React, { useEffect, useState } from 'react';
// // import { useDispatch, useSelector } from 'react-redux'; // Redux hooks (commented out since backend is not connected)
// // import {
// //   fetchAllReviews,
// //   approveReview,
// //   deleteReview,
// //   updateReview,
// // } from '../redux/slices/reviewsSlice'; // Redux actions (commented out since backend is not connected)
// import { useFormik } from 'formik';
// import * as Yup from 'yup';
// import {
//   FaPlus,
//   FaEdit,
//   FaTrash,
//   FaChevronLeft,
//   FaChevronRight,
//   FaCheck,
// } from 'react-icons/fa';
// import { Transition } from '@headlessui/react'; // For smooth modal transitions

// const Reviews = () => {
//   // const dispatch = useDispatch();
//   // const { reviews, loading, error } = useSelector((state) => state.reviews); // Backend connected

//   // Dummy data for reviews
//   const initialReviews = [
//     {
//       _id: '1',
//       reviewId: 'REV1001',
//       user: { name: 'John Doe', email: 'john@example.com' },
//       product: { name: 'Mathematics Exam' },
//       rating: 5,
//       comment: 'Excellent exam! Very comprehensive and well-structured.',
//       approved: false,
//       createdAt: '2024-04-20T10:30:00Z',
//     },
//     {
//       _id: '2',
//       reviewId: 'REV1002',
//       user: { name: 'Jane Smith', email: 'jane@example.com' },
//       product: { name: 'Physics Exam' },
//       rating: 4,
//       comment: 'Good exam, but some questions were a bit tricky.',
//       approved: true,
//       createdAt: '2024-04-21T14:15:00Z',
//     },
//     {
//       _id: '3',
//       reviewId: 'REV1003',
//       user: { name: 'Alice Johnson', email: 'alice@example.com' },
//       product: { name: 'Chemistry Exam' },
//       rating: 3,
//       comment: 'Average exam. Could have included more practical questions.',
//       approved: false,
//       createdAt: '2024-04-22T09:45:00Z',
//     },
//     // Add more dummy reviews as needed for testing pagination
//     {
//       _id: '4',
//       reviewId: 'REV1004',
//       user: { name: 'Bob Williams', email: 'bob@example.com' },
//       product: { name: 'Biology Exam' },
//       rating: 5,
//       comment: 'Outstanding exam! Covered all necessary topics thoroughly.',
//       approved: true,
//       createdAt: '2024-04-23T11:20:00Z',
//     },
//     {
//       _id: '5',
//       reviewId: 'REV1005',
//       user: { name: 'Carol Davis', email: 'carol@example.com' },
//       product: { name: 'English Exam' },
//       rating: 4,
//       comment: 'Good exam overall, but time management was a bit challenging.',
//       approved: false,
//       createdAt: '2024-04-24T16:05:00Z',
//     },
//     {
//       _id: '6',
//       reviewId: 'REV1006',
//       user: { name: 'David Martinez', email: 'david@example.com' },
//       product: { name: 'Computer Science Exam' },
//       rating: 5,
//       comment: 'Excellent exam! Great balance of theoretical and practical questions.',
//       approved: true,
//       createdAt: '2024-04-25T13:50:00Z',
//     },
//     {
//       _id: '7',
//       reviewId: 'REV1007',
//       user: { name: 'Eva Green', email: 'eva@example.com' },
//       product: { name: 'History Exam' },
//       rating: 4,
//       comment: 'Good exam, well-structured with relevant questions.',
//       approved: false,
//       createdAt: '2024-04-26T08:30:00Z',
//     },
//     {
//       _id: '8',
//       reviewId: 'REV1008',
//       user: { name: 'Frank Harris', email: 'frank@example.com' },
//       product: { name: 'Geography Exam' },
//       rating: 3,
//       comment: 'Average exam. Some questions were unclear.',
//       approved: true,
//       createdAt: '2024-04-27T12:10:00Z',
//     },
//     {
//       _id: '9',
//       reviewId: 'REV1009',
//       user: { name: 'Grace Lee', email: 'grace@example.com' },
//       product: { name: 'Economics Exam' },
//       rating: 5,
//       comment: 'Outstanding exam! Very challenging and fair.',
//       approved: false,
//       createdAt: '2024-04-28T17:25:00Z',
//     },
//     {
//       _id: '10',
//       reviewId: 'REV1010',
//       user: { name: 'Henry Adams', email: 'henry@example.com' },
//       product: { name: 'Art Exam' },
//       rating: 4,
//       comment: 'Good exam, creative questions that encouraged critical thinking.',
//       approved: true,
//       createdAt: '2024-04-29T15:40:00Z',
//     },
//     // ... add more reviews as needed
//   ];

//   const [reviews, setReviews] = useState([]); // Local state for reviews
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const [showForm, setShowForm] = useState(false); // Controls form visibility
//   const [currentReview, setCurrentReview] = useState(null); // Holds review data for editing

//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   const reviewsPerPage = 5; // Adjust as needed

//   // Fetch reviews (dummy fetch)
//   useEffect(() => {
//     // Commenting out backend dispatches since backend is not connected
//     // dispatch(fetchAllReviews());

//     // Simulate fetching data with dummy reviews
//     setLoading(true);
//     setTimeout(() => {
//       setReviews(initialReviews);
//       setLoading(false);
//     }, 1000); // Simulate network delay
//   }, []);

//   // Formik setup for edit review
//   const formik = useFormik({
//     initialValues: {
//       reviewId: currentReview ? currentReview.reviewId : '',
//       userName: currentReview ? currentReview.user.name : '',
//       userEmail: currentReview ? currentReview.user.email : '',
//       productName: currentReview ? currentReview.product.name : '',
//       rating: currentReview ? currentReview.rating : 5,
//       comment: currentReview ? currentReview.comment : '',
//       approved: currentReview ? currentReview.approved : false,
//       createdAt: currentReview ? currentReview.createdAt.split('T')[0] : '',
//     },
//     enableReinitialize: true, // Reinitialize form when currentReview changes
//     validationSchema: Yup.object({
//       reviewId: Yup.string().required('Review ID is required'),
//       userName: Yup.string().required('User Name is required'),
//       userEmail: Yup.string().email('Invalid Email').required('User Email is required'),
//       productName: Yup.string().required('Product/Exam Name is required'),
//       rating: Yup.number()
//         .min(1, 'Rating must be at least 1')
//         .max(5, 'Rating cannot exceed 5')
//         .required('Rating is required'),
//       comment: Yup.string().required('Comment is required'),
//       approved: Yup.boolean().required('Approval status is required'),
//       createdAt: Yup.date().required('Creation Date is required'),
//     }),
//     onSubmit: (values) => {
//       if (currentReview) {
//         // Update review
//         const updatedReview = {
//           ...currentReview,
//           reviewId: values.reviewId,
//           user: { name: values.userName, email: values.userEmail },
//           product: { name: values.productName },
//           rating: values.rating,
//           comment: values.comment,
//           approved: values.approved,
//           createdAt: values.createdAt,
//         };
//         // dispatch(updateReview({ id: currentReview._id, reviewData: updatedReview })); // Backend connected

//         // For dummy data, update local state
//         setReviews((prevReviews) =>
//           prevReviews.map((review) =>
//             review._id === currentReview._id ? updatedReview : review
//           )
//         );
//       }
//       setShowForm(false);
//       setCurrentReview(null);
//       formik.resetForm();
//       setCurrentPage(1); // Reset to first page on update
//     },
//   });

//   // Handle approve button click
//   const handleApprove = (id) => {
//     // dispatch(approveReview(id)); // Backend connected

//     // For dummy data, update local state
//     setReviews((prevReviews) =>
//       prevReviews.map((review) =>
//         review._id === id ? { ...review, approved: true } : review
//       )
//     );
//   };

//   // Handle edit button click
//   const handleEdit = (review) => {
//     setCurrentReview(review);
//     setShowForm(true);
//   };

//   // Handle delete button click
//   const handleDelete = (id) => {
//     if (window.confirm('Are you sure you want to delete this review?')) {
//       // dispatch(deleteReview(id)); // Backend connected

//       // For dummy data, remove from local state
//       setReviews((prevReviews) => prevReviews.filter((review) => review._id !== id));

//       // Adjust current page if necessary
//       const indexOfLastReview = currentPage * reviewsPerPage;
//       const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
//       const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
//       if (currentReviews.length === 1 && currentPage > 1) {
//         setCurrentPage(currentPage - 1);
//       }
//     }
//   };

//   // Calculate pagination details
//   const indexOfLastReview = currentPage * reviewsPerPage;
//   const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
//   const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
//   const totalPages = Math.ceil(reviews.length / reviewsPerPage);

//   // Handle page change
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   return (
//     <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
//       {/* Reviews Management Title */}
//       <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
//         Reviews Management
//       </h2>

//       {/* Error Message */}
//       {error && (
//         <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       {/* Add Review Button (Optional) */}
//       {/* Reviews are typically user-generated; adding this for demonstration purposes */}
//       <button
//         onClick={() => setShowForm(true)}
//         className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-6 flex items-center"
//         aria-label="Add Review"
//       >
//         <FaPlus className="mr-2" />
//         Add Review
//       </button>

//       {/* Reviews Table */}
//       {loading ? (
//         <div className="text-gray-800 dark:text-gray-200">Loading...</div>
//       ) : (
//         <>
//           <div className="overflow-x-auto">
//             <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
//               <thead className="bg-gray-50 dark:bg-gray-700">
//                 <tr>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Review ID
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     User
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Product/Exam
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Rating
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Comment
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Date
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                 {currentReviews.map((review) => (
//                   <tr
//                     key={review._id}
//                     className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//                   >
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {review.reviewId}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {review.user.name} ({review.user.email})
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {review.product.name}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200 flex items-center">
//                       {Array.from({ length: review.rating }).map((_, index) => (
//                         <FaCheck key={index} className="text-yellow-400 mr-1" />
//                       ))}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {review.comment}
//                     </td>
//                     <td className="py-4 px-6 text-sm capitalize text-gray-800 dark:text-gray-200">
//                       {review.approved ? 'Approved' : 'Pending'}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {new Date(review.createdAt).toLocaleDateString()}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200 flex items-center">
//                       {!review.approved && (
//                         <button
//                           onClick={() => handleApprove(review._id)}
//                           className="text-green-500 hover:underline flex items-center mr-2"
//                           aria-label={`Approve review ${review.reviewId}`}
//                         >
//                           <FaCheck className="mr-1" />
//                           Approve
//                         </button>
//                       )}
//                       <button
//                         onClick={() => handleDelete(review._id)}
//                         className="text-red-500 hover:underline flex items-center"
//                         aria-label={`Delete review ${review.reviewId}`}
//                       >
//                         <FaTrash className="mr-1" />
//                         Delete
//                       </button>
//                       <button
//                         onClick={() => handleEdit(review)}
//                         className="text-blue-500 hover:underline flex items-center ml-2"
//                         aria-label={`Edit review ${review.reviewId}`}
//                       >
//                         <FaEdit className="mr-1" />
//                         Edit
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//                 {currentReviews.length === 0 && (
//                   <tr>
//                     <td
//                       colSpan="8"
//                       className="py-4 px-6 text-center text-gray-600 dark:text-gray-400"
//                     >
//                       No reviews found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination Controls */}
//           {reviews.length > reviewsPerPage && (
//             <div className="flex justify-center mt-6">
//               <nav aria-label="Page navigation">
//                 <ul className="inline-flex -space-x-px">
//                   {/* Previous Page Button */}
//                   <li>
//                     <button
//                       onClick={() => paginate(currentPage - 1)}
//                       disabled={currentPage === 1}
//                       className={`px-3 py-2 ml-0 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
//                         currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''
//                       }`}
//                       aria-label="Previous Page"
//                     >
//                       <FaChevronLeft />
//                     </button>
//                   </li>

//                   {/* Page Numbers */}
//                   {[...Array(totalPages)].map((_, index) => (
//                     <li key={index + 1}>
//                       <button
//                         onClick={() => paginate(index + 1)}
//                         className={`px-3 py-2 leading-tight border border-gray-300 dark:border-gray-700 ${
//                           currentPage === index + 1
//                             ? 'text-blue-600 bg-blue-50 dark:bg-gray-700 dark:text-white'
//                             : 'text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
//                         }`}
//                         aria-label={`Go to page ${index + 1}`}
//                       >
//                         {index + 1}
//                       </button>
//                     </li>
//                   ))}

//                   {/* Next Page Button */}
//                   <li>
//                     <button
//                       onClick={() => paginate(currentPage + 1)}
//                       disabled={currentPage === totalPages}
//                       className={`px-3 py-2 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
//                         currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''
//                       }`}
//                       aria-label="Next Page"
//                     >
//                       <FaChevronRight />
//                     </button>
//                   </li>
//                 </ul>
//               </nav>
//             </div>
//           )}

//           {/* Add/Edit Review Modal */}
//           <Transition
//             show={showForm}
//             enter="transition ease-out duration-300 transform"
//             enterFrom="opacity-0 scale-95"
//             enterTo="opacity-100 scale-100"
//             leave="transition ease-in duration-200 transform"
//             leaveFrom="opacity-100 scale-100"
//             leaveTo="opacity-0 scale-95"
//           >
//             <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//               <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-4 overflow-y-auto">
//                 <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
//                   {currentReview ? 'Edit Review' : 'Add New Review'}
//                 </h3>
//                 <form onSubmit={formik.handleSubmit}>
//                   {/* Review ID Field */}
//                   <div className="mb-4">
//                     <label className="block text-gray-700 dark:text-gray-200">Review ID</label>
//                     <input
//                       type="text"
//                       name="reviewId"
//                       className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                         formik.touched.reviewId && formik.errors.reviewId
//                           ? 'border-red-500 focus:ring-red-200'
//                           : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                       }`}
//                       value={formik.values.reviewId}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="REV1001"
//                     />
//                     {formik.touched.reviewId && formik.errors.reviewId && (
//                       <div className="text-red-500 text-sm mt-1">{formik.errors.reviewId}</div>
//                     )}
//                   </div>

//                   {/* User Name Field */}
//                   <div className="mb-4">
//                     <label className="block text-gray-700 dark:text-gray-200">User Name</label>
//                     <input
//                       type="text"
//                       name="userName"
//                       className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                         formik.touched.userName && formik.errors.userName
//                           ? 'border-red-500 focus:ring-red-200'
//                           : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                       }`}
//                       value={formik.values.userName}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="John Doe"
//                     />
//                     {formik.touched.userName && formik.errors.userName && (
//                       <div className="text-red-500 text-sm mt-1">{formik.errors.userName}</div>
//                     )}
//                   </div>

//                   {/* User Email Field */}
//                   <div className="mb-4">
//                     <label className="block text-gray-700 dark:text-gray-200">User Email</label>
//                     <input
//                       type="email"
//                       name="userEmail"
//                       className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                         formik.touched.userEmail && formik.errors.userEmail
//                           ? 'border-red-500 focus:ring-red-200'
//                           : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                       }`}
//                       value={formik.values.userEmail}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="john@example.com"
//                     />
//                     {formik.touched.userEmail && formik.errors.userEmail && (
//                       <div className="text-red-500 text-sm mt-1">{formik.errors.userEmail}</div>
//                     )}
//                   </div>

//                   {/* Product/Exam Name Field */}
//                   <div className="mb-4">
//                     <label className="block text-gray-700 dark:text-gray-200">Product/Exam Name</label>
//                     <input
//                       type="text"
//                       name="productName"
//                       className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                         formik.touched.productName && formik.errors.productName
//                           ? 'border-red-500 focus:ring-red-200'
//                           : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                       }`}
//                       value={formik.values.productName}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="Mathematics Exam"
//                     />
//                     {formik.touched.productName && formik.errors.productName && (
//                       <div className="text-red-500 text-sm mt-1">{formik.errors.productName}</div>
//                     )}
//                   </div>

//                   {/* Rating Field */}
//                   <div className="mb-4">
//                     <label className="block text-gray-700 dark:text-gray-200">Rating</label>
//                     <select
//                       name="rating"
//                       className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                         formik.touched.rating && formik.errors.rating
//                           ? 'border-red-500 focus:ring-red-200'
//                           : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                       }`}
//                       value={formik.values.rating}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                     >
//                       <option value={5}>5 - Excellent</option>
//                       <option value={4}>4 - Very Good</option>
//                       <option value={3}>3 - Good</option>
//                       <option value={2}>2 - Fair</option>
//                       <option value={1}>1 - Poor</option>
//                     </select>
//                     {formik.touched.rating && formik.errors.rating && (
//                       <div className="text-red-500 text-sm mt-1">{formik.errors.rating}</div>
//                     )}
//                   </div>

//                   {/* Comment Field */}
//                   <div className="mb-4">
//                     <label className="block text-gray-700 dark:text-gray-200">Comment</label>
//                     <textarea
//                       name="comment"
//                       rows="3"
//                       className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                         formik.touched.comment && formik.errors.comment
//                           ? 'border-red-500 focus:ring-red-200'
//                           : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                       }`}
//                       value={formik.values.comment}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="Your feedback here..."
//                     ></textarea>
//                     {formik.touched.comment && formik.errors.comment && (
//                       <div className="text-red-500 text-sm mt-1">{formik.errors.comment}</div>
//                     )}
//                   </div>

//                   {/* Approved Field */}
//                   <div className="mb-4 flex items-center">
//                     <input
//                       type="checkbox"
//                       name="approved"
//                       checked={formik.values.approved}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                       id="approved"
//                     />
//                     <label htmlFor="approved" className="block text-gray-700 dark:text-gray-200">
//                       Approved
//                     </label>
//                   </div>
//                   {formik.touched.approved && formik.errors.approved && (
//                     <div className="text-red-500 text-sm mt-1">{formik.errors.approved}</div>
//                   )}

//                   {/* Created At Field */}
//                   <div className="mb-4">
//                     <label className="block text-gray-700 dark:text-gray-200">Creation Date</label>
//                     <input
//                       type="date"
//                       name="createdAt"
//                       className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                         formik.touched.createdAt && formik.errors.createdAt
//                           ? 'border-red-500 focus:ring-red-200'
//                           : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                       }`}
//                       value={formik.values.createdAt}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                     />
//                     {formik.touched.createdAt && formik.errors.createdAt && (
//                       <div className="text-red-500 text-sm mt-1">{formik.errors.createdAt}</div>
//                     )}
//                   </div>

//                   {/* Form Buttons */}
//                   <div className="flex justify-end">
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setShowForm(false);
//                         setCurrentReview(null);
//                         formik.resetForm();
//                       }}
//                       className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
//                     >
//                       {currentReview ? 'Update' : 'Add'}
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </Transition>
//         </>
//       )}
//     </div>
//   );
// };

// export default Reviews;







// // src/pages/Reviews.jsx
// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   fetchAllReviews,
//   approveReview,
//   deleteReview,
// } from '../redux/slices/reviewsSlice';
// import { FaCheck, FaTrash } from 'react-icons/fa'; // React Icons

// const Reviews = () => {
//   const dispatch = useDispatch();
//   const { reviews, loading, error } = useSelector((state) => state.reviews);

//   useEffect(() => {
//     dispatch(fetchAllReviews());
//     // eslint-disable-next-line
//   }, []);

//   const handleApprove = (id) => {
//     dispatch(approveReview(id));
//   };

//   const handleDelete = (id) => {
//     if (window.confirm('Are you sure you want to delete this review?')) {
//       dispatch(deleteReview(id));
//     }
//   };

//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Reviews Management</h2>
//       {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
//       {loading ? (
//         <div className="text-gray-800 dark:text-gray-200">Loading...</div>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
//             <thead>
//               <tr>
//                 <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-200">Review ID</th>
//                 <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-200">User</th>
//                 <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-200">Product/Exam</th>
//                 <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-200">Rating</th>
//                 <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-200">Comment</th>
//                 <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-200">Status</th>
//                 <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-200">Date</th>
//                 <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-200">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {reviews.map((review) => (
//                 <tr key={review._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
//                   <td className="py-2 px-4 border-b text-gray-800 dark:text-gray-200">{review._id}</td>
//                   <td className="py-2 px-4 border-b text-gray-800 dark:text-gray-200">
//                     {review.user.name} ({review.user.email})
//                   </td>
//                   <td className="py-2 px-4 border-b text-gray-800 dark:text-gray-200">{review.product.name}</td>
//                   <td className="py-2 px-4 border-b text-gray-800 dark:text-gray-200 flex items-center">
//                     {Array.from({ length: review.rating }).map((_, index) => (
//                       <FaCheck key={index} className="text-yellow-400 mr-1" />
//                     ))}
//                   </td>
//                   <td className="py-2 px-4 border-b text-gray-800 dark:text-gray-200">{review.comment}</td>
//                   <td className="py-2 px-4 border-b capitalize text-gray-800 dark:text-gray-200">
//                     {review.approved ? 'Approved' : 'Pending'}
//                   </td>
//                   <td className="py-2 px-4 border-b text-gray-800 dark:text-gray-200">
//                     {new Date(review.createdAt).toLocaleDateString()}
//                   </td>
//                   <td className="py-2 px-4 border-b">
//                     {!review.approved && (
//                       <button
//                         onClick={() => handleApprove(review._id)}
//                         className="text-green-500 hover:underline flex items-center mr-2"
//                       >
//                         <FaCheck className="mr-1" />
//                         Approve
//                       </button>
//                     )}
//                     <button
//                       onClick={() => handleDelete(review._id)}
//                       className="text-red-500 hover:underline flex items-center"
//                     >
//                       <FaTrash className="mr-1" />
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               {reviews.length === 0 && (
//                 <tr>
//                   <td colSpan="8" className="text-center py-4 text-gray-600 dark:text-gray-400">
//                     No reviews found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Reviews;
