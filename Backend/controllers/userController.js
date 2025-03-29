// controllers/userController.js

const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.status(200).json({ success: true, count: users.length, data: users });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({ success: true, data: user });
});

// @desc    Create new user
// @route   POST /api/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  if (user) {
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const { name, email, role, password } = req.body;

  let user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.role = role || user.role;
  if (password) {
    user.password = password;
  }

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
    },
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
// const deleteUser = asyncHandler(async (req, res) => {
//   const userId = req.params.id; // Extract the user ID from route parameters
//   const user = await User.findByIdAndDelete(userId);

//   console.log(`Deleting user with ID: ${userId}`); // Enhanced log message

//   if (!user) {
//     res.status(404);
//     throw new Error('User not found');
//   }

//   // Include the deleted user ID within a 'data' property
//   res.status(200).json({ success: true, message: 'User removed', data: { _id: userId } });
// });
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  console.log(`Deleting user with ID: ${req.params.id}`);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  await user.deleteOne(); // triggers pre('deleteOne') middleware
  res.status(200).json({
    success: true,
    message: 'User removed',
    data: { _id: req.params.id },
  });
});



// @desc    Get current logged in user
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  res.status(200).json({ success: true, data: user });
});

// @desc    Update logged in user details
// @route   PUT /api/users/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const { name, email, role, password,profileImage,coverImage,phone,address } = req.body;
  console.log(profileImage,coverImage,phone,address);
  
  let user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.profileImage = profileImage 
  user.coverImage = coverImage 
  user.phone = phone 
  user.address = address 

  // if (password) {
  //   user.password = password;
  // }

  const updatedUser = await user.save();
  console.log(updatedUser);
  

  res.status(200).json({
    success: true,
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profileImage:updatedUser.profileImage,
      coverImage:updatedUser.coverImage,
      phone:updatedUser.phone,
      address:updatedUser.address,
      createdAt: updatedUser.createdAt,
    },
  });
});

/**
 * @desc    Change user password
 * @route   POST /api/auth/change-password
 * @access  Private (requires authentication)
 * @param   {string} oldPassword - Current/old password
 * @param   {string} newPassword - The new password to set
 */

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // 1) Validate required fields
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both oldPassword and newPassword.',
      });
    }
    

    // 2) Find the user by ID (assuming req.user contains the logged-in user's ID)
    //    Make sure to select the password field, as we set select:false in the model
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // 3) Check if the old password matches the user's current password
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Old password is incorrect.',
      });
    }

    // 4) Update the user's password to the new password
    user.password = newPassword;
    await user.save(); // Will trigger the 'pre save' hook to re-hash

    // 5) Return success response
    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    console.error('Change Password Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to change password.',
    });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getMe,
  updateMe,
  changePassword
};



