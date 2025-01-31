// const instance = require ("../config/razorpay")
const Order = require("../models/Order")
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require('uuid');
const Product = require("../models/Product")
const { instance } = require("../config/razorpay")

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
  try {

    const { products, userId, address, payable } = req.body;

    // Validate if address is present
    if (!address || !address.billingCity || !address.billingPincode || !address.billingState || !address.billingAddress) {
      return res.status(400).json({
        success: false,
        message: "Missing address fields. Please provide complete address.",
      });
    }

    // Destructure address fields
    const { billingCity, billingPincode, billingState, billingAddress, utr } = address;

    // Find user by ID
    const userDetails = await User.findById(userId);
    if (!userDetails) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Create Order with utr in paymentInfo
    const order = await Order.create({
      user: userId,
      shippingInfo: {
        name: `${userDetails.fName} ${userDetails.lName}`,
        address: billingAddress,
        city: billingCity,
        state: billingState,
        pincode: billingPincode,
      },
      paymentInfo: { utr }, // Correctly passing utr here in the paymentInfo object
      orderItems: products.map(item => ({
        product: item.product, // Directly use the product ID
        quantity: item.quantity,
      })),
      totalPrice: payable,
      month: new Date().getMonth() + 1, // Convert zero-based month to human-readable format
    });

    // Update Stock
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found`,
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for product: ${product.name}`,
        });
      }

      product.sold += item.quantity;
      product.quantity -= item.quantity;
      await product.save();
    }

    // Return successful response
    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });

  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
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
      }).populate("user")
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
