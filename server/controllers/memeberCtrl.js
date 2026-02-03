const bcrypt = require("bcryptjs");
const memberModel = require("../models/memeberModel");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const verifyAccountTemplate = require("../templates/emailVerificationTemplate");
const memeberModel = require("../models/memeberModel");
const accountReject = require("../templates/accountReject");




const registerMemberCtrl = async (req, res) => {
  try {
    let { fName, lName, userName, email, phone, password, images, address, parent } = req.body;
    const imagesArray = typeof images === 'string' ? JSON.parse(images) : images;

    if (!fName || !lName || !userName || !phone || !email || !address || !password || !imagesArray) {
      return res.status(403).send({
        success: false,
        message: "All Fields are required",
      });
    }

    // Clean username: replace spaces with underscores and remove special characters
    userName = userName.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

    // Validate username format (only letters, numbers and underscores)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(userName)) {
      return res.status(400).json({
        success: false,
        message: "Username can only contain letters, numbers and underscores. Special characters are not allowed.",
      });
    }

    // Check minimum length
    if (userName.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Username must be at least 3 characters long.",
      });
    }

    const existingUser = await memberModel.findOne({ userName });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username already exists. Please choose a different username.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if parent is provided
    let parentUser = null;
    if (parent && parent.trim() !== '') {
      // Decode parent username in case it comes URL encoded
      const decodedParent = decodeURIComponent(parent);
      parentUser = await memberModel.findOne({ userName: decodedParent });
      if (!parentUser) {
        return res.status(404).json({
          success: false,
          message: `Parent user with userName "${decodedParent}" not found.`,
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
    // Accept identifier (username, email, or phone) instead of just userName
    const { userName, password } = req.body; // Keep userName for backward compatibility
    const identifier = userName; // userName field will contain username/email/phone

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill out all required fields.",
      });
    }

    // Build query to search by username, email, OR phone
    let query = {};
    
    // Check if identifier is email (contains @)
    if (identifier.includes('@')) {
      query = { email: identifier };
    } 
    // Check if identifier is phone (all digits)
    else if (/^\d+$/.test(identifier)) {
      query = { phone: parseInt(identifier) };
    } 
    // Otherwise treat as username
    else {
      query = { userName: identifier };
    }

    // Find user by username, email, or phone
    const user = await memberModel.findOne(query);

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
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Search parameters
    const search = req.query.search || '';
    const tier = req.query.tier || '';
    const status = req.query.status || '';
    
    // Build query
    let query = {};
    
    // Search filter
    if (search) {
      // Check if search term is a number for phone search
      const isNumeric = /^\d+$/.test(search);
      
      query.$or = [
        { fName: { $regex: search, $options: 'i' } },
        { lName: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
      
      // Only add phone search if search term is numeric
      if (isNumeric) {
        query.$or.push({ phone: parseInt(search) });
      }
    }
    
    // Tier filter
    if (tier && tier !== 'All') {
      query.tier = tier;
    }
    
    // Status filter
    if (status && status !== 'All') {
      query.isActive = status === 'Active';
    }
    
    // Get total count for pagination
    const totalMembers = await memberModel.countDocuments(query);
    const totalPages = Math.ceil(totalMembers / limit);
    
    // Fetch members with pagination
    const members = await memberModel.find(query)
      .populate({
        path: "parent",
        select: "fName lName userName"
      })
      .populate({
        path: "child",
        select: "fName lName userName"
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    // Add referral chain info to each member
    const membersWithChain = await Promise.all(
      members.map(async (member) => {
        const memberObj = member.toObject();
        
        // Get downline count (all children recursively)
        const downlineCount = await getDownlineCount(member._id);
        
        return {
          ...memberObj,
          downlineCount,
          parentInfo: member.parent ? {
            id: member.parent._id,
            name: `${member.parent.fName} ${member.parent.lName}`,
            userName: member.parent.userName
          } : null,
          childInfo: member.child.map(c => ({
            id: c._id,
            name: `${c.fName} ${c.lName}`,
            userName: c.userName
          }))
        };
      })
    );

    res.status(200).json({
      success: true,
      members: membersWithChain,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalMembers: totalMembers,
        limit: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error in getAllMemberCtrl:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch members",
      error: error.message
    });
  }
};

// Helper function to get downline count
async function getDownlineCount(userId) {
  let count = 0;
  
  async function countChildren(id) {
    const user = await memberModel.findById(id).select('child').lean();
    if (!user || !user.child || user.child.length === 0) return;
    
    count += user.child.length;
    
    for (let childId of user.child) {
      await countChildren(childId);
    }
  }
  
  await countChildren(userId);
  return count;
}

const memberProfileCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await memberModel
      .findById(id)
      .populate({
        path: "child",
        populate: {
          path: "parent",
          select: "fName lName", // Populate the parent within the child
        },
      })
      .populate({
        path: "parent",
        select: "fName lName", // Populate the parent of the member
      })
      .exec();

    return res.status(200).json({
      success: true,
      member,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong in getting member API",
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

const deleteMemberCtrl = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await memberModel.findById(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    if (member.parent) {
      await memberModel.findByIdAndUpdate(
        member.parent,
        { $pull: { child: id } },
        { new: true }
      );
    }


    await memberModel.findByIdAndDelete(id);

    if (member.email) {
      await mailSender(
        member.email,
        "Account Rejected",
        accountReject(member.userName)
      );
    }

    return res.status(200).json({
      success: true,
      message: "Member account rejected and deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting member:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong in the delete member API.",
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
  const { fName, lName, userName, email, phone, address, acc, ifsc, bankName, sContact, bankHolderName } = req.body;

  try {
    const member = await memberModel.findById(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    // Handle profile image upload if provided
    if (req.files && req.files.profileImage) {
      const { uploadImageToCloudinary } = require("../config/imageUploader");
      const profileImage = req.files.profileImage;

      // Validate file type
      const supportedTypes = ["jpg", "jpeg", "png", "gif"];
      const fileType = profileImage.name.split(".").pop().toLowerCase();

      if (!supportedTypes.includes(fileType)) {
        return res.status(400).json({
          success: false,
          message: "File format not supported. Please upload jpg, jpeg, png, or gif",
        });
      }

      // Upload to Cloudinary
      const uploadedImage = await uploadImageToCloudinary(
        profileImage,
        "profile_images",
        1000,
        80
      );

      // Update member images array
      member.images = [{
        public_id: uploadedImage.public_id,
        url: uploadedImage.secure_url,
      }];
    }

    member.fName = fName || member.fName;
    member.lName = lName || member.lName;
    member.userName = userName || member.userName;
    member.email = email || member.email;
    member.phone = phone || member.phone;
    member.address = address || member.address;
    member.acc = acc || member.acc;
    member.ifsc = ifsc || member.ifsc;
    member.bankName = bankName || member.bankName;
    member.bankHolderName = bankHolderName || member.bankHolderName;
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



const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedPassword = await memberModel.findByIdAndUpdate(id, { password: hashedPassword }, { new: true })
    return res.status(200).json({
      success: true,
      message: "Password update successfully",
      updatedPassword
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong in update tier  member api",
    });
  }
};

// Get Complete Referral Tree (Upline + Downline)
const getReferralTreeCtrl = async (req, res) => {
  try {
    const { id } = req.params;

    // Get upline (parent chain)
    const upline = await getUpline(id);

    // Get downline (children tree)
    const downline = await getDownline(id);

    return res.status(200).json({
      success: true,
      upline,
      downline
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong in getting referral tree",
    });
  }
};

// Get Upline (Parent → Parent → Parent...)
async function getUpline(userId) {
  const result = [];
  let current = await memberModel.findById(userId).lean();

  while (current && current.parent) {
    const parent = await memberModel.findById(current.parent).lean();
    if (!parent) break;

    result.push({
      id: parent._id,
      name: `${parent.fName} ${parent.lName}`,
      userName: parent.userName,
      tier: parent.tier
    });

    current = parent;
  }

  return result;
}

// Get Downline (All children recursively with levels)
async function getDownline(userId) {
  const result = [];

  async function fetchChildren(id, level = 0) {
    const user = await memberModel.findById(id).lean();
    if (!user) return;

    if (level > 0) {
      result.push({
        id: user._id,
        name: `${user.fName} ${user.lName}`,
        userName: user.userName,
        tier: user.tier,
        level,
        childCount: user.child ? user.child.length : 0
      });
    }

    if (user.child && user.child.length > 0) {
      for (let childId of user.child) {
        await fetchChildren(childId, level + 1);
      }
    }
  }

  await fetchChildren(userId);
  return result;
}

// Get member by username (for referral verification)
const getMemberByUsernameCtrl = async (req, res) => {
  try {
    const { userName } = req.params;
    
    // Decode username in case it's URL encoded
    const decodedUserName = decodeURIComponent(userName);
    
    const member = await memberModel.findOne({ userName: decodedUserName })
      .select('fName lName userName email isActive')
      .lean();

    if (!member) {
      return res.status(404).json({
        success: false,
        message: `Member with username "${decodedUserName}" not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      member: {
        id: member._id,
        name: `${member.fName} ${member.lName}`,
        userName: member.userName,
        email: member.email,
        isActive: member.isActive
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching member",
    });
  }
};

module.exports = { registerMemberCtrl, loginMemberCtrl, getAllMemberCtrl, verifyMemberCtrl, updateTierCtrl, memberProfileCtrl, updateMemberProfileCtrl, deleteMemberCtrl, updatePassword, getReferralTreeCtrl, getMemberByUsernameCtrl };
