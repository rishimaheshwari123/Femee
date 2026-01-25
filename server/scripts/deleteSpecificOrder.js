/**
 * Script to delete a specific order
 * Usage: node server/scripts/deleteSpecificOrder.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const { deleteOrderCompletely, previewOrderDeletion } = require("../utils/deleteOrder");

const ORDER_ID = "6975ee92c466c1efa6116bc2";

async function main() {
  try {
    // Connect to database
    console.log("Connecting to database...");
    console.log("MongoDB URL:", process.env.MONGODB_URL ? "Found" : "Not found");
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✓ Connected to database\n");

    // Preview deletion
    console.log("=".repeat(60));
    console.log("STEP 1: PREVIEW DELETION");
    console.log("=".repeat(60));
    
    const preview = await previewOrderDeletion(ORDER_ID);
    
    // Confirm deletion
    console.log("\n" + "=".repeat(60));
    console.log("STEP 2: DELETING ORDER");
    console.log("=".repeat(60));
    console.log("\nProceeding with deletion...\n");
    
    // Delete order
    const result = await deleteOrderCompletely(ORDER_ID, true);
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ ORDER DELETED SUCCESSFULLY");
    console.log("=".repeat(60));
    console.log("\nDeleted Order Details:");
    console.log(`  Order Number: ${result.deletedOrder.orderNumber}`);
    console.log(`  Order ID: ${result.deletedOrder.orderId}`);
    console.log(`  Buyer: ${result.deletedOrder.buyer}`);
    console.log(`  Total Price: ₹${result.deletedOrder.totalPrice}`);
    console.log(`  Items Count: ${result.deletedOrder.itemsCount}`);
    console.log(`  Purchases Removed: ${result.purchasesRemoved}`);
    console.log(`  Stock Restored: ${result.stockRestored ? "Yes" : "No"}`);
    
    // Close connection
    await mongoose.connection.close();
    console.log("\n✓ Database connection closed");
    process.exit(0);
    
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    console.error(error);
    
    // Close connection on error
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    
    process.exit(1);
  }
}

// Run script
main();
