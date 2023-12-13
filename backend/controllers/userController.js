import User from "../models/userModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs";
import createToken from "../utils/createToken.js";

const createUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    // throw an error if user input an invalid details;
    throw new Error("Please fill all the inputs.");
  }

  const userExists = await User.findOne({ email }); // to check/warn if an email already exists in the database;
  if (userExists) res.status(400).send("User already exists");

  const salt = await bcrypt.genSalt(10); // to create a random text for password protection
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = new User({ username, email, password: hashedPassword }); // to create a new user

  try {
    await newUser.save(); // allow us to store new user.
    createToken(res, newUser._id); // create a token for cookies
    res // show the user the status
      .status(201)
      .json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      });
  } catch (error) {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// for Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email }); //check if email existed

  if (existingUser) {
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    ); // compare the user input and existing password;

    // if it's true create token as and set as a cookie
    if (isPasswordValid) {
      createToken(res, existingUser._id);
      res // show the user the status
        .status(201)
        .json({
          _id: existingUser._id,
          username: existingUser.username,
          email: existingUser.email,
          isAdmin: existingUser.isAdmin,
        });
      return; // Exit the function after sending the response
    }
  }
});

// for Logout user
const logoutCurrentUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged Out Successfully" });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// get current user profile
const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id); // get the user from database

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
    });
  } else {
    res.status(404);
    throw new Error("User not found.");
  }
});

// update current user profile
const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id); // get the user from database

  if (user) {
    user.username = req.body.username || user.username; // if user provide update it will save to user.username;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10); // to create a random text for password protection
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      user.password = hashedPassword; // if user provide password updata it will save to user.password;
    }

    const updatedUser = await user.save(); // it will save user update to the database;

    // show data to the user
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    // if user not defined
    res.status(404);
    throw new Error("User not found");
  }
});

// delete a user using admin authority;
const deleteUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id); // get the user id from database

  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error("Cannot delete admin user");
    }

    await User.deleteOne({ _id: user._id }); // a mongoose method that allow to delete a user by id;
    res.json({ message: "User removed" }); // log if successfull;
  } else {
    res.status(404);
    throw new Error("User not found.");
  }
});

// get the user data using admin authority;
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password"); // get the user id/data but password is not included

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// update the user data using admin authority;
const updateUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id); // get the user id from database

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);

    const updateUser = await user.save(); // it will save user update to the database;

    res.json({
      // it will log all the changes you put;
      _id: updateUser._id,
      username: updateUser.username,
      email: updateUser.email,
      isAdmin: updateUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export {
  createUser,
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteUserById,
  getUserById,
  updateUserById,
};
