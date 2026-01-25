/**
 * Script to remove member from binary tree position
 * For deleted order: 6975ee92c466c1efa6116bc2
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Member = require("../models/memeberModel");

const MEMBER_ID = "69356ab22e14bd0c6ac01bf3"; // FCH mamta1924
const REFERRER_ID = "67a5f7613a714956f0e0dc78"; // Fchanita1314 (Anita)
const PRODUCT_ID = "6974e1a9b4cd79b66bc760e9"; // Hormones Balancing Tablet
const ROOT_NUMBER = 2; // ROOT 2
const POSITION = "L"; // Left position

async function main() {
  try {
    // Connect to database
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✓ Connected to database\n");

    console.log("=== Removing Member from Binary Tree ===");
    console.log(`Member: FCH mamta1924 (${MEMBER_ID})`);
    console.log(`Referrer: Fchanita1314 (${REFERRER_ID})`);
    console.log(`Product: ${PRODUCT_ID}`);
    console.log(`ROOT: ${ROOT_NUMBER}`);
    console.log(`Position: ${POSITION}`);

    // Get referrer
    const referrer = await Member.findById(REFERRER_ID);
    
    if (!referrer) {
      throw new Error("Referrer not found");
    }

    // Find product tree
    const productTree = referrer.productBinaryTrees.find(
      tree => tree.productId.toString() === PRODUCT_ID
    );

    if (!productTree) {
      throw new Error("Product tree not found");
    }

    // Find ROOT
    const root = productTree.roots.find(r => r.rootNumber === ROOT_NUMBER);

    if (!root) {
      throw new Error(`ROOT ${ROOT_NUMBER} not found`);
    }

    console.log("\n--- Before Removal ---");
    console.log(`ROOT ${ROOT_NUMBER} Status: ${root.status}`);
    console.log(`Total Members: ${root.totalMembers}`);
    console.log(`Left Leg: ${root.binaryPosition.leftLeg.length} members`);
    console.log(`Right Leg: ${root.binaryPosition.rightLeg.length} members`);

    // Remove from left leg
    const leftLegIndex = root.binaryPosition.leftLeg.findIndex(
      leg => leg.memberId.toString() === MEMBER_ID && leg.position === POSITION
    );

    if (leftLegIndex !== -1) {
      const removed = root.binaryPosition.leftLeg[leftLegIndex];
      root.binaryPosition.leftLeg.splice(leftLegIndex, 1);
      
      console.log("\n✓ Removed from LEFT LEG:");
      console.log(`  Position: ${removed.position}`);
      console.log(`  Level: ${removed.level}`);
      console.log(`  Joined: ${removed.joinedAt}`);
      
      // Update total members
      root.totalMembers = Math.max(0, root.totalMembers - 1);
      
      // Update level tracking
      const levelKey = `level${removed.level - 1}`; // level 2 in display = level1 in tracking
      if (root.levels[levelKey]) {
        root.levels[levelKey].filled = Math.max(0, root.levels[levelKey].filled - 1);
      }
    } else {
      console.log("\n⚠️ Member not found in LEFT LEG at position L");
    }

    // Also check and remove from right leg if exists
    const rightLegIndex = root.binaryPosition.rightLeg.findIndex(
      leg => leg.memberId.toString() === MEMBER_ID
    );

    if (rightLegIndex !== -1) {
      const removed = root.binaryPosition.rightLeg[rightLegIndex];
      root.binaryPosition.rightLeg.splice(rightLegIndex, 1);
      
      console.log("\n✓ Also removed from RIGHT LEG (duplicate):");
      console.log(`  Position: ${removed.position}`);
      console.log(`  Level: ${removed.level}`);
      console.log(`  Joined: ${removed.joinedAt}`);
      
      // Update total members
      root.totalMembers = Math.max(0, root.totalMembers - 1);
      
      // Update level tracking
      const levelKey = `level${removed.level - 1}`;
      if (root.levels[levelKey]) {
        root.levels[levelKey].filled = Math.max(0, root.levels[levelKey].filled - 1);
      }
    }

    // Check if ROOT should be marked as ACTIVE again (if it was COMPLETE)
    if (root.status === 'COMPLETE' && root.totalMembers < root.maxCapacity) {
      root.status = 'ACTIVE';
      console.log("\n✓ ROOT status changed: COMPLETE → ACTIVE");
    }

    // Save changes
    await referrer.save();

    console.log("\n--- After Removal ---");
    console.log(`ROOT ${ROOT_NUMBER} Status: ${root.status}`);
    console.log(`Total Members: ${root.totalMembers}`);
    console.log(`Left Leg: ${root.binaryPosition.leftLeg.length} members`);
    console.log(`Right Leg: ${root.binaryPosition.rightLeg.length} members`);
    console.log(`Level 1 Filled: ${root.levels.level1.filled}/${root.levels.level1.capacity}`);

    console.log("\n✅ Member removed from binary tree successfully!");

    // Close connection
    await mongoose.connection.close();
    console.log("\n✓ Database connection closed");
    process.exit(0);
    
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    console.error(error);
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    
    process.exit(1);
  }
}

main();
