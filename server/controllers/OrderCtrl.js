// const instance = require ("../config/razorpay")
const Order = require("../models/Order")
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require('uuid');
const Product = require("../models/Product")
const { instance } = require("../config/razorpay")
const mongoose = require("mongoose");
const { retryTransaction } = require("../utils/retryWithBackoff");
const { generateOrderNumber } = require("../utils/orderNumberGenerator");

const crypto = require("crypto")


const Coupon = require("../models/Coupon")
const User = require("../models/memeberModel")
const RegularUser = require("../models/userModel")




const capturePayment = async (req, res) => {
  const { products, coupon } = req.body



  if (products.length === 0) {
    return res.json({ success: false, message: "Please Provide Course ID" })
  }

  let total_amount = 0;


  for (const item of products) {
    const product_id = item.product._id;
    let product;

    try {
      product = await Product.findById(product_id);

      if (!product) {
        return res.status(200).json({ success: false, message: "Could not find the Product" });
      }

      total_amount += product.price * item.quantity;
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }

  }



  if (coupon !== "") {
    const couponValue = await Coupon.findOne({ name: coupon.toUpperCase() });

    if (couponValue) {
      total_amount -= couponValue.discount

    }
  }
  const options = {
    amount: total_amount * 100,
    currency: "INR",
    // receipt: Math.random(Date.now()).toString(),
  }

  try {
    // Initiate the payment using Razorpay
    const paymentResponse = await instance.orders.create(options)
    console.log(paymentResponse)
    res.json({
      success: true,
      data: paymentResponse,
    })

    console.log(paymentResponse)
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ success: false, message: "Could not initiate order." })
  }
}


const paymentVerification = async (req, res) => {
  const razorpay_order_id = req.body?.razorpay_order_id
  const razorpay_payment_id = req.body?.razorpay_payment_id
  const razorpay_signature = req.body?.razorpay_signature
  const product = req.body?.products
  const address = req.body?.address
  const payable = req.body?.payable

  const userId = req.user.id

  let body = razorpay_order_id + "|" + razorpay_payment_id

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex")

  if (expectedSignature === razorpay_signature) {
    try {
      // Call the createOrder function
      await createOrder(product, userId, address, razorpay_order_id, razorpay_payment_id, payable, res);

      // Send the response after the order is successfully created
      return res.status(200).json({ success: true, message: "Payment Verified" });
    } catch (error) {
      // Handle any errors that occur during order creation
      console.error("Error creating order:", error);
      return res.status(500).json({ success: false, message: "Error creating order" });
    }
  }


  return res.status(200).json({ success: false, message: "Payment Failed" })
};






const createOrder = asyncHandler(async (req, res) => {
  // Simplified order creation for better performance
  try {
    // Start a MongoDB session for transaction
    const session = await mongoose.startSession();
    
    try {
      // Start transaction
      session.startTransaction();

      const { products, userId, address, payable, referrerId } = req.body;
      
      // Define the specific product IDs that require setNumber FIRST
      const setNumberProductIds = ['6974e56fb4cd79b66bc76118', '6974e699b4cd79b66bc76130'];
      
      // Check if any product in the order requires setNumber
      const hasSetNumberProduct = products.some(item => 
        setNumberProductIds.includes(item.product.toString())
      );
      
      console.log("Creating order for:", { userId, products: products.length, payable, hasSetNumber: hasSetNumberProduct });
      
      // Validate if address is present
      if (!address || !address.billingCity || !address.billingPincode || !address.billingState || !address.billingAddress) {
        await session.abortTransaction();
        session.endSession();
        throw new Error("Missing address fields. Please provide complete address.");
      }

      // Destructure address fields
      const { billingCity, billingPincode, billingState, billingAddress, utr, phone1, phone2, setNumber } = address;

      // Find user by ID - check both member and regular user models
      let userDetails = await User.findById(userId).session(session);
      if (!userDetails) {
        // If not found in member model, try regular user model
        userDetails = await RegularUser.findById(userId).session(session);
        if (!userDetails) {
          await session.abortTransaction();
          session.endSession();
          throw new Error("User not found");
        }
      }

      // Process each product for order items
      const processedOrderItems = [];
      let currentSetNumber = null;
      
      // Handle setNumber logic FIRST (before complex operations)
      if (hasSetNumberProduct) {
        console.log("Processing setNumber for user:", userId);
        
        // Try to find user in member model first (members have setNumber field)
        let userForSetNumber = await User.findById(userId).session(session);
        if (!userForSetNumber) {
          // If not a member, check if it's a regular user
          const regularUser = await RegularUser.findById(userId).session(session);
          if (regularUser) {
            // Regular users don't have setNumber, so we'll skip setNumber logic
            console.log("Regular user detected, skipping setNumber logic");
            currentSetNumber = null;
          }
        } else {
          // User is a member, process setNumber normally
          const manualSetNumber = setNumber ? parseInt(setNumber) : null;
          
          if (manualSetNumber && manualSetNumber > 0) {
            // Use the manually entered setNumber and update user's setNumber
            currentSetNumber = manualSetNumber;
            userForSetNumber.setNumber = manualSetNumber;
            await userForSetNumber.save({ session });
            console.log("Set manual setNumber:", manualSetNumber);
          } else {
            // If no manual input, increment existing setNumber
            const existingSetNumber = userForSetNumber.setNumber || 0;
            currentSetNumber = existingSetNumber + 1;
            userForSetNumber.setNumber = currentSetNumber;
            await userForSetNumber.save({ session });
            console.log("Auto-incremented setNumber to:", currentSetNumber);
          }
        }
      }
      
      // Process products for order items (simplified)
      for (const item of products) {
        const productId = item.product;
        const quantity = item.quantity;
        
        // Get product details
        const product = await Product.findById(productId).session(session);
        if (!product) {
          await session.abortTransaction();
          session.endSession();
          throw new Error(`Product with ID ${productId} not found`);
        }

        // Check stock availability
        if (product.quantity < quantity) {
          await session.abortTransaction();
          session.endSession();
          throw new Error(`Not enough stock for product: ${product.title}`);
        }

        // Update product stock immediately
        product.sold += quantity;
        product.quantity -= quantity;
        await product.save({ session });

        // Prepare simplified order item
        const orderItem = {
          product: productId,
          quantity: quantity,
          price: product.price,
          referrerId: referrerId || null,
          isFirstPurchase: false, // Simplified for now
          placedInLeg: 'none'
        };

        processedOrderItems.push(orderItem);
      }

      // Create Order with processed items (within transaction)
      // Generate unique order number (with sequence and encrypted display)
      const orderNumberData = await generateOrderNumber();
      
      const orderData = {
        orderNumber: orderNumberData.displayNumber,
        sequenceNumber: orderNumberData.sequenceNumber,
        internalNumber: orderNumberData.internalNumber,
        user: userId,
        shippingInfo: {
          name: `${userDetails.fName} ${userDetails.lName}`,
          address: billingAddress,
          city: billingCity,
          state: billingState,
          pincode: billingPincode,
          phone1,
          phone2
        },
        paymentInfo: { utr },
        orderItems: processedOrderItems,
        totalPrice: payable,
        month: new Date().getMonth() + 1,
        setNumber: currentSetNumber // Save setNumber if applicable
      };

      const orders = await Order.create([orderData], { session });
      const order = orders[0];

      console.log("Order created successfully:", order._id);

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      // Return the order for the response
      return res.status(201).json({
        success: true,
        message: "Order placed successfully",
        order: order,
      });

    } catch (error) {
      // Rollback transaction on any error
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      session.endSession();
      throw error;
    }

  } catch (error) {
    console.error("Error creating order:", error);
    
    // Determine appropriate status code based on error message
    let statusCode = 500;
    if (error.message.includes('not found')) {
      statusCode = 404;
    } else if (error.message.includes('Missing') || error.message.includes('stock')) {
      statusCode = 400;
    }
    
    return res.status(statusCode).json({ 
      success: false, 
      message: error.message || "Failed to create order",
    });
  }
});


const getAllOrder = async (req, res) => {
  try {

    const userId = req.user.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: `User is not Found`,
      })
    }

    const orders = await Order.find({ user: userId })
      .populate({
        path: 'orderItems.product',
        model: 'Product',
      })
      .sort({ createdAt: -1 }) // Sort by creation date descending (latest first)
      .lean() // Convert to plain objects
      .exec();

    // Manually populate user data from both models
    for (let order of orders) {
      let userData = await User.findById(order.user).lean();
      if (!userData) {
        userData = await RegularUser.findById(order.user).lean();
      }
      if (userData) {
        console.log("User data found for member order:", { 
          id: userData._id, 
          userName: userData.userName, 
          fName: userData.fName, 
          lName: userData.lName, 
          role: userData.role,
          phone: userData.phone
        });
        // Attach user data to order
        order.user = userData;
      } else {
        console.log("No user data found for member order:", order._id);
        order.user = null;
      }
    }

    return res.status(200).json({
      orders,
      success: true,
      message: `Fetch Orders Successfully`,
    })

  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: `Error During fetch order`,
    })
  }
}



module.exports = {
  capturePayment,
  paymentVerification,
  createOrder,
  getAllOrder
};
