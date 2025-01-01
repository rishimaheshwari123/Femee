const bcrypt = require("bcryptjs");
const memberModel = require("../models/memeberModel");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const verifyAccountTemplate = require("../templates/emailVerificationTemplate");




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



const getAllMemberCtrl = async (req, res) => {
  try {
    const members = await memberModel.find().populate("child").exec();
    return res.status(200).json({
      success: true,
      members
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong in get all member api",
    });
  }
};

const memberProfileCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await memberModel.findById(id);
    return res.status(200).json({
      success: true,
      member
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong in geting member api",
    });
  }
};

const verifyMemberCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMember = await memberModel.findByIdAndUpdate(id, { isActive: true }, { new: true })


    if (updatedMember) {
      await mailSender(
        updatedMember?.email,
        "Verification Email",
        verifyAccountTemplate(updatedMember?.userName, updatedMember?.email)
      );
    }
    return res.status(200).json({
      success: true,
      message: "Member Verified Successfully!",
      updatedMember
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong in update verify  member api",
    });
  }
};

const updateTierCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { tier } = req.body;
    const updatedtier = await memberModel.findByIdAndUpdate(id, { tier }, { new: true })
    return res.status(200).json({
      success: true,
      message: "Member Tier Update Successfully!",
      updatedtier
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong in update tier  member api",
    });
  }
};



const updateMemberProfileCtrl = async (req, res) => {
  const { id } = req.params;
  const { fName, lName, email, phone, address, acc, ifsc, bankName, sContact } = req.body;

  try {

    const member = await memberModel.findById(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    member.fName = fName || member.fName;
    member.lName = lName || member.lName;
    member.email = email || member.email;
    member.phone = phone || member.phone;
    member.address = address || member.address;
    member.acc = acc || member.acc;
    member.ifsc = ifsc || member.ifsc;
    member.bankName = bankName || member.bankName;
    member.sContact = sContact || member.sContact;

    await member.save();


    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      updatedMember: member,
    });
  } catch (error) {
    console.error('Error updating member profile:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
    });
  }
};


module.exports = { registerMemberCtrl, loginMemberCtrl, getAllMemberCtrl, verifyMemberCtrl, updateTierCtrl, memberProfileCtrl, updateMemberProfileCtrl };
