const mongoose = require("mongoose");
const Order = require("../models/Order");
const Member = require("../models/memeberModel");

/**
 * Fix referrer for a specific order
 * @param {string} orderId - Order ID to fix
 * @param {string} correctReferrerId - Correct referrer ID (or null to remove)
 */
async function fixOrderReferrer(orderId, correctReferrerId) {
  try {
    console.log("\n=== Starting Referrer Fix ===");
    console.log(`Order ID: ${orderId}`);
    console.log(`Correct Referrer ID: ${correctReferrerId || "NONE (removing referrer)"}`);

    // 1. Find the order
    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    console.log(`\n✓ Order found: ${order.orderNumber}`);
    console.log(`  User: ${order.user.userName} (${order.user._id})`);
    console.log(`  Total Items: ${order.orderItems.length}`);

    // Validate correct referrer if provided
    let correctReferrer = null;
    if (correctReferrerId) {
      correctReferrer = await Member.findById(correctReferrerId);
      if (!correctReferrer) {
        throw new Error(`Correct referrer not found: ${correctReferrerId}`);
      }
      console.log(`\n✓ Correct Referrer: ${correctReferrer.userName} (${correctReferrer._id})`);
    } else {
      console.log(`\n⚠ Removing referrer (setting to null)`);
    }

    // 2. Fix Order Items
    console.log("\n--- Fixing Order Items ---");
    let orderUpdated = false;
    
    for (let i = 0; i < order.orderItems.length; i++) {
      const item = order.orderItems[i];
      const oldReferrerId = item.referrerId;
      
      console.log(`\nItem ${i + 1}:`);
      console.log(`  Product: ${item.product}`);
      console.log(`  Old Referrer: ${oldReferrerId || "NONE"}`);
      
      if (oldReferrerId?.toString() !== correctReferrerId?.toString()) {
        order.orderItems[i].referrerId = correctReferrerId || null;
        orderUpdated = true;
        console.log(`  ✓ Updated to: ${correctReferrerId || "NONE"}`);
      } else {
        console.log(`  ✓ Already correct`);
      }
    }

    if (orderUpdated) {
      await order.save();
      console.log("\n✓ Order saved with updated referrer");
    } else {
      console.log("\n✓ Order already has correct referrer");
    }

    // 3. Fix Member's Purchase History
    console.log("\n--- Fixing Member's Purchase History ---");
    const buyer = await Member.findById(order.user._id);
    
    if (!buyer) {
      throw new Error(`Buyer not found: ${order.user._id}`);
    }

    let memberUpdated = false;

    for (const item of order.orderItems) {
      const productId = item.product;
      
      // Find product tree
      const productTree = buyer.productBinaryTrees.find(
        tree => tree.productId.toString() === productId.toString()
      );

      if (productTree) {
        // Find purchase in history
        const purchase = productTree.purchases.find(
          p => p.orderId?.toString() === orderId
        );

        if (purchase) {
          const oldReferrerId = purchase.referrerId;
          console.log(`\nProduct: ${productId}`);
          console.log(`  Old Referrer in Purchase: ${oldReferrerId || "NONE"}`);
          
          if (oldReferrerId?.toString() !== correctReferrerId?.toString()) {
            purchase.referrerId = correctReferrerId || null;
            memberUpdated = true;
            console.log(`  ✓ Updated to: ${correctReferrerId || "NONE"}`);
          } else {
            console.log(`  ✓ Already correct`);
          }
        } else {
          console.log(`\n⚠ Purchase not found in history for product: ${productId}`);
        }
      } else {
        console.log(`\n⚠ Product tree not found for product: ${productId}`);
      }
    }

    if (memberUpdated) {
      await buyer.save();
      console.log("\n✓ Member's purchase history updated");
    } else {
      console.log("\n✓ Member's purchase history already correct");
    }

    // 4. Summary
    console.log("\n=== Fix Complete ===");
    console.log(`Order: ${order.orderNumber}`);
    console.log(`Buyer: ${buyer.userName}`);
    console.log(`Referrer: ${correctReferrer ? correctReferrer.userName : "NONE"}`);
    console.log(`Items Fixed: ${order.orderItems.length}`);
    
    return {
      success: true,
      order: order,
      buyer: buyer,
      referrer: correctReferrer
    };

  } catch (error) {
    console.error("\n❌ Error fixing referrer:", error.message);
    throw error;
  }
}

/**
 * View current referrer information for an order
 * @param {string} orderId - Order ID to check
 */
async function viewOrderReferrer(orderId) {
  try {
    console.log("\n=== Order Referrer Information ===");
    
    const order = await Order.findById(orderId)
      .populate("user")
      .populate("orderItems.referrerId");
    
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    console.log(`\nOrder: ${order.orderNumber}`);
    console.log(`Buyer: ${order.user.userName} (${order.user._id})`);
    console.log(`Date: ${order.createdAt}`);
    console.log(`\nOrder Items:`);

    for (let i = 0; i < order.orderItems.length; i++) {
      const item = order.orderItems[i];
      console.log(`\n  Item ${i + 1}:`);
      console.log(`    Product: ${item.product}`);
      console.log(`    Quantity: ${item.quantity}`);
      console.log(`    Price: ₹${item.price}`);
      console.log(`    Referrer: ${item.referrerId ? 
        `${item.referrerId.userName} (${item.referrerId._id})` : 
        "NONE"}`);
      console.log(`    First Purchase: ${item.isFirstPurchase}`);
      console.log(`    Placed In Leg: ${item.placedInLeg}`);
    }

    // Check member's purchase history
    const buyer = await Member.findById(order.user._id);
    console.log(`\n\nMember's Purchase History:`);

    for (const item of order.orderItems) {
      const productTree = buyer.productBinaryTrees.find(
        tree => tree.productId.toString() === item.product.toString()
      );

      if (productTree) {
        const purchase = productTree.purchases.find(
          p => p.orderId?.toString() === orderId
        );

        if (purchase) {
          console.log(`\n  Product: ${item.product}`);
          console.log(`    Referrer in History: ${purchase.referrerId || "NONE"}`);
          console.log(`    Amount: ₹${purchase.amount}`);
          console.log(`    First Purchase: ${purchase.isFirstPurchase}`);
        }
      }
    }

    return order;

  } catch (error) {
    console.error("\n❌ Error viewing order:", error.message);
    throw error;
  }
}

module.exports = {
  fixOrderReferrer,
  viewOrderReferrer
};
