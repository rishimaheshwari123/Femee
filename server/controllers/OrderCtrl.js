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
  // Wrap the entire order creation in retry logic to handle concurrent updates
  try {
    const result = await retryTransaction(async () => {
      // Start a MongoDB session for transaction
      const session = await mongoose.startSession();
      
      try {
        // Start transaction
        session.startTransaction();

        const { products, userId, address, payable, referrerId } = req.body;
        console.log(req.body)
        
        // Validate referrerId if provided (server-side validation)
        let validatedReferrerId = null;
        if (referrerId) {
          try {
            // Check valid ObjectId format
            if (!mongoose.Types.ObjectId.isValid(referrerId)) {
              console.warn(`Invalid referrer ID format: ${referrerId}`);
            }
            // Check not self-referral
            else if (referrerId.toString() === userId.toString()) {
              console.warn(`Self-referral attempt blocked for user ${userId}`);
            }
            // Check referrer exists
            else {
              const referrerExists = await User.findById(referrerId).session(session);
              if (!referrerExists) {
                console.warn(`Referrer not found: ${referrerId}`);
              } else {
                validatedReferrerId = referrerId;
              }
            }
          } catch (validationError) {
            console.error(`Referrer validation error:`, validationError);
          }
        }
        
        // Validate if address is present
        if (!address || !address.billingCity || !address.billingPincode || !address.billingState || !address.billingAddress) {
          await session.abortTransaction();
          session.endSession();
          throw new Error("Missing address fields. Please provide complete address.");
        }

        // Destructure address fields
        const { billingCity, billingPincode, billingState, billingAddress, utr, phone1, phone2 } = address;

        // Find user by ID
        const userDetails = await User.findById(userId).session(session);
        if (!userDetails) {
          await session.abortTransaction();
          session.endSession();
          throw new Error("User not found");
        }

        // Import services for product-wise processing
        const BinaryTreeService = require("../services/BinaryTreeService");
        const VolumeService = require("../services/VolumeService");
        const MatchingBonusService = require("../services/MatchingBonusService");

        // Process each product separately for binary tree tracking
        const processedOrderItems = [];
        
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

          // Calculate item amount
          const itemAmount = product.price * quantity;

          // Check if this is the first purchase of this product for the user
          const isFirstPurchase = await BinaryTreeService.isFirstPurchaseOfProduct(userId, productId);

          // Prepare order item with referral tracking (use validated referrer)
          const orderItem = {
            product: productId,
            quantity: quantity,
            price: product.price, // Store price at time of purchase
            referrerId: validatedReferrerId || null,
            isFirstPurchase: isFirstPurchase,
            placedInLeg: 'none' // Will be updated during binary placement
          };

          processedOrderItems.push({
            orderItem,
            productId,
            itemAmount,
            isFirstPurchase
          });
        }

        // Create Order with processed items (within transaction)
        // Generate unique order number (with sequence and encrypted display)
        const orderNumberData = await generateOrderNumber();
        
        const orderData = {
          orderNumber: orderNumberData.displayNumber,        // FEME-7A2K9 (customer sees this)
          sequenceNumber: orderNumberData.sequenceNumber,    // 1, 2, 3... (admin tracking)
          internalNumber: orderNumberData.internalNumber,    // FEME-0001 (admin reference)
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
          orderItems: processedOrderItems.map(item => item.orderItem),
          totalPrice: payable,
          month: new Date().getMonth() + 1,
        };

        const orders = await Order.create([orderData], { session });
        const order = orders[0];

        // Update Stock and process binary tree operations
        for (const processedItem of processedOrderItems) {
          const { productId, itemAmount, isFirstPurchase, orderItem } = processedItem;
          
          // Update product stock (within transaction)
          const product = await Product.findById(productId).session(session);
          product.sold += orderItem.quantity;
          product.quantity -= orderItem.quantity;
          await product.save({ session });

          // Process product-wise binary tree operations
          try {
            // Get or create product tree for the buyer
            await BinaryTreeService.findOrCreateProductTree(userId, productId);

            // Add purchase to member's product tree
            const member = await User.findById(userId).session(session);
            const productTree = member.productBinaryTrees.find(
              tree => tree.productId.toString() === productId.toString()
            );

            if (productTree) {
              // Add purchase to history (use validated referrer)
              productTree.purchases.push({
                orderId: order._id,
                amount: itemAmount,
                quantity: orderItem.quantity,
                purchaseDate: new Date(),
                referrerId: validatedReferrerId || null,
                isFirstPurchase: isFirstPurchase
              });

              // Update product-specific stats
              productTree.totalPurchases += 1;
              productTree.totalSpent += itemAmount;
              
              if (isFirstPurchase) {
                productTree.firstPurchaseDate = new Date();
                productTree.isActive = true;
              }
              productTree.lastPurchaseDate = new Date();

              await member.save({ session });
            }

            // Handle binary placement and volume propagation (use validated referrer)
            if (validatedReferrerId && validatedReferrerId !== userId) {
              // Validate referrer exists
              const referrer = await User.findById(validatedReferrerId).session(session);
              if (referrer) {
                if (isFirstPurchase) {
                  // First purchase: place in binary tree
                  const placementResult = await BinaryTreeService.placeMemberInBinaryTree(
                    validatedReferrerId,
                    userId,
                    productId,
                    itemAmount
                  );

                  // Update the order item with placement leg (extract only 'leg' field)
                  const orderItemIndex = order.orderItems.findIndex(
                    oi => oi.product.toString() === productId.toString()
                  );
                  if (orderItemIndex !== -1) {
                    order.orderItems[orderItemIndex].placedInLeg = placementResult.leg; // Only store 'left' or 'right'
                  }

                  // Propagate volume up the upline chain
                  await VolumeService.propagateVolumeUpline(userId, productId, itemAmount, validatedReferrerId);
                } else {
                  // Repeat purchase: only update volumes
                  await VolumeService.propagateVolumeUpline(userId, productId, itemAmount, validatedReferrerId);
                }

                // Trigger matching bonus calculation for the referrer and upline
                const uplineChain = await BinaryTreeService.getUplineChain(userId, productId);
                for (const ancestorId of uplineChain) {
                  try {
                    await MatchingBonusService.calculateMatchingBonus(ancestorId, productId);
                  } catch (bonusError) {
                    console.error(`Error calculating bonus for member ${ancestorId}:`, bonusError.message);
                    // Continue with other members even if one fails
                  }
                }
              }
            }
          } catch (binaryError) {
            console.error(`Error processing binary tree for product ${productId}:`, binaryError.message);
            // Rollback transaction on binary processing error
            await session.abortTransaction();
            session.endSession();
            throw new Error(`Error processing binary tree operations: ${binaryError.message}`);
          }
        }

        // Save order with updated placement legs (within transaction)
        await order.save({ session });

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        // Return the order for the response
        return order;

      } catch (error) {
        // Rollback transaction on any error
        if (session.inTransaction()) {
          await session.abortTransaction();
        }
        session.endSession();
        throw error;
      }
    }, {
      maxRetries: 3,
      initialDelay: 200,
      maxDelay: 3000
    });

    // Return successful response
    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: result,
    });

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
      message: error.message || "Failed to create order after multiple attempts",
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
      .populate("user")
      .sort({ orderNumber: -1 }) // Sort by order number descending
      .exec();


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
