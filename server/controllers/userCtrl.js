const bcrypt = require("bcryptjs");
const memberModel = require("../models/userModel");
const jwt = require("jsonwebtoken");




const registerMemberCtrl = async (req, res) => {
  try {
    const { fName, lName, email, password, phone, address } = req.body;

    // Validate required fields
    if (!fName || !lName || !email || !password || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if the user already exists
    const existingUser = await memberModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      });
    }

    // Hash the password and create the user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await memberModel.create({
      fName,
      lName,
      email,
      phone,
      address,
      password: hashedPassword,
    });

    // Generate a JWT token
    const token = jwt.sign(
      { email: user.email, id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    // Set the token in an HTTP-only cookie
    res.cookie("token", token, {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    });

    // Respond with success
    return res.status(201).json({
      success: true,
      token,
      user,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("REGISTER MEMBER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "User registration failed. Please try again later.",
    });
  }
};




const loginMemberCtrl = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill out all required fields.",
      });
    }

    const user = await memberModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered. Please sign up to continue.",
      });
    }


    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password.",
      });
    }

    const token = jwt.sign(
      { email: user.email, id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    user.token = token;
    user.password = undefined; // Remove password from response

    const options = {
      httpOnly: true, // For security purposes
    };

    res.cookie("token", token, options).status(200).json({
      success: true,
      token,
      user,
      message: "User login successful.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again later.",
    });
  }
};





module.exports = { registerMemberCtrl, loginMemberCtrl };
