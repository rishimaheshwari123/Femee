const bcrypt = require("bcryptjs");
const memberModel = require("../models/memeberModel");
const jwt = require("jsonwebtoken");




const registerMemberCtrl = async (req, res) => {
  try {
    const { fName, lName, userName, email, phone, password, images, address, parent } = req.body;
    const imagesArray = typeof images === 'string' ? JSON.parse(images) : images;

    if (!fName || !lName || !userName || !phone || !email || !address || !password || !imagesArray) {
      return res.status(403).send({
        success: false,
        message: "All Fields are required",
      });
    }

    const existingUser = await memberModel.findOne({ userName });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if parent is provided
    let parentUser = null;
    if (parent) {
      parentUser = await memberModel.findOne({ userName: parent });
      if (!parentUser) {
        return res.status(404).json({
          success: false,
          message: `Parent user with userName "${parent}" not found.`,
        });
      }
    }

    // Create the user
    const user = await memberModel.create({
      fName,
      lName,
      userName,
      email,
      phone,
      images: imagesArray,
      address,
      password: hashedPassword,
      parent: parentUser ? parentUser._id : null,
    });

    if (parentUser) {
      await memberModel.findByIdAndUpdate(parentUser._id, { $push: { child: user._id } });
    }

    return res.status(200).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    });
  }
};



const loginMemberCtrl = async (req, res) => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill out all required fields.",
      });
    }

    const user = await memberModel.findOne({ userName });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered. Please sign up to continue.",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Your account is not verified yet.",
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
