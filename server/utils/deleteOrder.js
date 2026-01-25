const mongoose = require("mongoose");
const Order = require("../models/Order");
const Member = require("../models/memeberModel");
const Product = require("../models/Product");

/**
 * Completely delete an order and cleanup all related data
 * @param {string} orderId - Order ID to delete
 * @param {boolean} restoreStock - Whether to restore product stock (default: true)
 */
async function deleteOrderCompletely(orderId, restoreStock = true) {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    console.log("\n=== Starting Complete Order Deletion ===");
    console.log(`Order ID: ${orderId}`);
    console.log(`Restore Stock: ${restoreStock}`);

    // 1. Find the order
    const order = await Order.findById(orderId)
      .populate("user")
      .populate("orderItems.product")
      .session(session);
    
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    console.log(`\n✓ Order found: ${order.orderNumber}`);
    console.log(`  User: ${order.user.userName} (${order.user._id})`);
    console.log(`  Total Items: ${order.orderItems.length}`);
    console.log(`  Total Price: ₹${order.totalPrice}`);
    console.log(`  Status: ${order.orderStatus}`);
    console.log(`  Created: ${order.createdAt}`);

    const buyer = await Member.findById(order.user._id).session(session);
    if (!buyer) {
      throw new Error(`Buyer not found: ${order.user._id}`);
    }

    // 2. Restore Product Stock
    if (restoreStock) {
      console.log("\n--- Restoring Product Stock ---");
      
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product._id).session(session);
        
        if (product) {
          const oldQuantity = product.quantity;
          const oldSold = product.sold;
          
          // Restore stock
          product.quantity += item.quantity;
          product.sold -= item.quantity;
          
          await product.save({ session });
          
          console.log(`\n  Product: ${product.title}`);
          console.log(`    Quantity: ${oldQuantity} → ${product.quantity} (+${item.quantity})`);
          console.log(`    Sold: ${oldSold} → ${product.sold} (-${item.quantity})`);
        } else {
          console.log(`\n  ⚠ Product not found: ${item.product._id}`);
        }
      }
    } else {
      console.log("\n⚠ Skipping stock restoration");
    }

    // 3. Remove from Member's Purchase History
    console.log("\n--- Removing from Purchase History ---");
    let purchasesRemoved = 0;
    
    for (const item of order.orderItems) {
      const productId = item.product._id;
      
      // Find product tree
      const productTreeIndex = buyer.productBinaryTrees.findIndex(
        tree => tree.productId.toString() === productId.toString()
      );

      if (productTreeIndex !== -1) {
        const productTree = buyer.productBinaryTrees[productTreeIndex];
        
        // Find and remove purchase
        const purchaseIndex = productTree.purchases.findIndex(
          p => p.orderId?.toString() === orderId
        );

        if (purchaseIndex !== -1) {
          const purchase = productTree.purchases[purchaseIndex];
          
          console.log(`\n  Product: ${productId}`);
          console.log(`    Removing purchase: ₹${purchase.amount}`);
          console.log(`    Quantity: ${purchase.quantity}`);
          console.log(`    Date: ${purchase.purchaseDate}`);
          
          // Remove purchase from array
          productTree.purchases.splice(purchaseIndex, 1);
          
          // Update stats
          productTree.totalPurchases = Math.max(0, productTree.totalPurchases - 1);
          productTree.totalSpent = Math.max(0, productTree.totalSpent - purchase.amount);
          
          // If this was the only purchase, mark as inactive
          if (productTree.purchases.length === 0) {
            productTree.isActive = false;
            productTree.firstPurchaseDate = null;
            productTree.lastPurchaseDate = null;
            console.log(`    ✓ Product tree marked as inactive (no purchases left)`);
          } else {
            // Update last purchase date
            const sortedPurchases = productTree.purchases.sort(
              (a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)
            );
            productTree.lastPurchaseDate = sortedPurchases[0].purchaseDate;
          }
          
          purchasesRemoved++;
          console.log(`    ✓ Purchase removed from history`);
        } else {
          console.log(`\n  ⚠ Purchase not found in history for product: ${productId}`);
        }
      } else {
        console.log(`\n  ⚠ Product tree not found for product: ${productId}`);
      }
    }

    if (purchasesRemoved > 0) {
      await buyer.save({ session });
      console.log(`\n✓ Removed ${purchasesRemoved} purchase(s) from member's history`);
    }

    // 4. Remove from Binary Tree Positions (if needed)
    console.log("\n--- Checking Binary Tree Positions ---");
    
    for (const item of order.orderItems) {
      const productId = item.product._id;
      
      // Check if this was a first purchase (binary placement)
      if (item.isFirstPurchase && item.referrerId) {
        console.log(`\n  ⚠ WARNING: This was a FIRST PURCHASE with binary placement`);
        console.log(`    Product: ${productId}`);
        console.log(`    Referrer: ${item.referrerId}`);
        console.log(`    Placed in: ${item.placedInLeg} leg`);
        console.log(`    \n    ⚠ Binary tree position NOT automatically removed!`);
        console.log(`    ⚠ Manual intervention may be required to fix binary tree structure`);
        console.log(`    ⚠ This could affect matching bonus calculations`);
      }
    }

    // 5. Delete the Order
    console.log("\n--- Deleting Order ---");
    await Order.findByIdAndDelete(orderId).session(session);
    console.log(`✓ Order deleted: ${order.orderNumber}`);

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // 6. Summary
    console.log("\n=== Deletion Complete ===");
    console.log(`Order: ${order.orderNumber}`);
    console.log(`Buyer: ${buyer.userName}`);
    console.log(`Items Deleted: ${order.orderItems.length}`);
    console.log(`Purchases Removed: ${purchasesRemoved}`);
    console.log(`Stock Restored: ${restoreStock ? "Yes" : "No"}`);
    
    return {
      success: true,
      deletedOrder: {
        orderNumber: order.orderNumber,
        orderId: orderId,
        buyer: buyer.userName,
        totalPrice: order.totalPrice,
        itemsCount: order.orderItems.length
      },
      purchasesRemoved: purchasesRemoved,
      stockRestored: restoreStock
    };

  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    session.endSession();
    
    console.error("\n❌ Error deleting order:", error.message);
    throw error;
  }
}

/**
 * View what will be deleted before actually deleting
 * @param {string} orderId - Order ID to preview
 */
async function previewOrderDeletion(orderId) {
  try {
    console.log("\n=== Order Deletion Preview ===");
    
    const order = await Order.findById(orderId)
      .populate("user")
      .populate("orderItems.product")
      .populate("orderItems.referrerId");
    
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    console.log(`\nOrder: ${order.orderNumber}`);
    console.log(`Buyer: ${order.user.userName} (${order.user._id})`);
    console.log(`Status: ${order.orderStatus}`);
    console.log(`Total Price: ₹${order.totalPrice}`);
    console.log(`Created: ${order.createdAt}`);

    console.log(`\n--- Items to be affected ---`);
    
    for (let i = 0; i < order.orderItems.length; i++) {
      const item = order.orderItems[i];
      console.log(`\nItem ${i + 1}:`);
      console.log(`  Product: ${item.product.title}`);
      console.log(`  Quantity: ${item.quantity}`);
      console.log(`  Price: ₹${item.price}`);
      console.log(`  Stock to restore: +${item.quantity}`);
      
      if (item.referrerId) {
        console.log(`  Referrer: ${item.referrerId.userName}`);
      }
      
      if (item.isFirstPurchase) {
        console.log(`  ⚠ First Purchase - Binary tree affected!`);
        console.log(`  ⚠ Placed in: ${item.placedInLeg} leg`);
      }
    }

    // Check member's purchase history
    const buyer = await Member.findById(order.user._id);
    console.log(`\n--- Member's Purchase History ---`);

    let purchasesToRemove = 0;
    for (const item of order.orderItems) {
      const productTree = buyer.productBinaryTrees.find(
        tree => tree.productId.toString() === item.product._id.toString()
      );

      if (productTree) {
        const purchase = productTree.purchases.find(
          p => p.orderId?.toString() === orderId
        );

        if (purchase) {
          purchasesToRemove++;
          console.log(`\n  Product: ${item.product.title}`);
          console.log(`    Will remove purchase: ₹${purchase.amount}`);
          console.log(`    Total purchases for this product: ${productTree.totalPurchases}`);
          console.log(`    After deletion: ${productTree.totalPurchases - 1}`);
        }
      }
    }

    console.log(`\n--- Summary ---`);
    console.log(`Order to delete: ${order.orderNumber}`);
    console.log(`Items: ${order.orderItems.length}`);
    console.log(`Purchases to remove: ${purchasesToRemove}`);
    console.log(`Stock to restore: Yes`);
    
    const hasFirstPurchase = order.orderItems.some(item => item.isFirstPurchase);
    if (hasFirstPurchase) {
      console.log(`\n⚠ WARNING: Contains first purchase(s) - Binary tree will be affected!`);
    }

    return {
      order: order,
      itemsCount: order.orderItems.length,
      purchasesToRemove: purchasesToRemove,
      hasFirstPurchase: hasFirstPurchase
    };

  } catch (error) {
    console.error("\n❌ Error previewing deletion:", error.message);
    throw error;
  }
}

/**
 * List all orders for a specific user
 * @param {string} userId - User ID
 */
async function listUserOrders(userId) {
  try {
    const orders = await Order.find({ user: userId })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    console.log(`\n=== Orders for User: ${userId} ===`);
    console.log(`Total Orders: ${orders.length}\n`);

    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order: ${order.orderNumber}`);
      console.log(`   ID: ${order._id}`);
      console.log(`   Status: ${order.orderStatus}`);
      console.log(`   Total: ₹${order.totalPrice}`);
      console.log(`   Items: ${order.orderItems.length}`);
      console.log(`   Date: ${order.createdAt}`);
      console.log(``);
    });

    return orders;

  } catch (error) {
    console.error("\n❌ Error listing orders:", error.message);
    throw error;
  }
}

module.exports = {
  deleteOrderCompletely,
  previewOrderDeletion,
  listUserOrders
};
