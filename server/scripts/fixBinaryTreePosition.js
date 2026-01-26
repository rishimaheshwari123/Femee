/**
 * Script to manually fix binary tree position after order deletion
 * This fixes the issue where Abhilasha (Fchabhilasha13) was removed from orders
 * but still exists in Neelu's (Fchneelu2718) binary tree
 * 
 * Usage: node server/scripts/fixBinaryTreePosition.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Member = require("../models/memeberModel");

// Member IDs
const NEELU_ID = "6798dbac4ef992e77a55c47f"; // Fchneelu2718 (referrer)
const ABHILASHA_ID = "6798cade4ef992e77a55c3d7"; // Fchabhilasha13 (deleted member)
const PRODUCT_ID = "6974e1a9b4cd79b66bc760e9"; // Product ID
const ROOT_NUMBER = 1; // ROOT 1
const LEG = "right"; // Placed in RIGHT leg

async function main() {
  try {
    // Connect to database
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✓ Connected to database\n");

    console.log("=".repeat(60));
    console.log("FIXING BINARY TREE POSITION");
    console.log("=".repeat(60));
    console.log(`\nReferrer: ${NEELU_ID} (Fchneelu2718)`);
    console.log(`Member to Remove: ${ABHILASHA_ID} (Fchabhilasha13)`);
    console.log(`Product: ${PRODUCT_ID}`);
    console.log(`ROOT: ${ROOT_NUMBER}`);
    console.log(`Leg: ${LEG}`);

    // Get Neelu's member data
    const neelu = await Member.findById(NEELU_ID);
    if (!neelu) {
      throw new Error("Neelu not found");
    }

    console.log(`\n✓ Found member: ${neelu.userName}`);

    // Find product tree
    const productTree = neelu.productBinaryTrees.find(
      tree => tree.productId.toString() === PRODUCT_ID
    );

    if (!productTree) {
      throw new Error("Product tree not found");
    }

    console.log(`✓ Found product tree for product: ${PRODUCT_ID}`);

    // Find ROOT
    const root = productTree.roots.find(r => r.rootNumber === ROOT_NUMBER);
    if (!root) {
      throw new Error(`ROOT ${ROOT_NUMBER} not found`);
    }

    console.log(`✓ Found ROOT ${ROOT_NUMBER}`);
    console.log(`  Status: ${root.status}`);
    console.log(`  Total Members: ${root.totalMembers}/${root.maxCapacity}`);
    console.log(`  Level 1 Filled: ${root.levels.level1.filled}/${root.levels.level1.capacity}`);
    console.log(`  Level 2 Filled: ${root.levels.level2.filled}/${root.levels.level2.capacity}`);

    // Show current leg contents
    console.log(`\n--- Current Binary Tree Structure ---`);
    console.log(`Left Leg (${root.binaryPosition.leftLeg.length} members):`);
    root.binaryPosition.leftLeg.forEach((entry, index) => {
      console.log(`  ${index + 1}. Member: ${entry.memberId}, Level: ${entry.level}, Position: ${entry.position}`);
    });

    console.log(`\nRight Leg (${root.binaryPosition.rightLeg.length} members):`);
    root.binaryPosition.rightLeg.forEach((entry, index) => {
      console.log(`  ${index + 1}. Member: ${entry.memberId}, Level: ${entry.level}, Position: ${entry.position}`);
    });

    // Find Abhilasha in right leg
    const legArray = LEG === 'left' ? root.binaryPosition.leftLeg : root.binaryPosition.rightLeg;
    const memberIndex = legArray.findIndex(
      entry => entry.memberId.toString() === ABHILASHA_ID
    );

    if (memberIndex === -1) {
      console.log(`\n⚠ Member ${ABHILASHA_ID} not found in ${LEG} leg`);
      console.log("Nothing to fix - member already removed or not in this leg");
      await mongoose.connection.close();
      process.exit(0);
    }

    const removedMember = legArray[memberIndex];
    console.log(`\n✓ Found member in ${LEG} leg at index ${memberIndex}`);
    console.log(`  Level: ${removedMember.level}`);
    console.log(`  Position: ${removedMember.position}`);
    console.log(`  Joined: ${removedMember.joinedAt}`);

    // Remove from leg
    console.log(`\n--- Removing Member ---`);
    legArray.splice(memberIndex, 1);
    console.log(`✓ Removed from ${LEG} leg array`);

    // Update level tracking
    const level = removedMember.level;
    const levelKey = `level${level}`;
    if (root.levels[levelKey] && root.levels[levelKey].filled > 0) {
      const oldFilled = root.levels[levelKey].filled;
      root.levels[levelKey].filled -= 1;
      console.log(`✓ Updated ${levelKey}: ${oldFilled} → ${root.levels[levelKey].filled}`);
    }

    // Update total members
    if (root.totalMembers > 0) {
      const oldTotal = root.totalMembers;
      root.totalMembers -= 1;
      console.log(`✓ Updated totalMembers: ${oldTotal} → ${root.totalMembers}`);
    }

    // If ROOT was marked as COMPLETE but now has space, mark as ACTIVE
    if (root.status === 'COMPLETE' && root.totalMembers < root.maxCapacity) {
      root.status = 'ACTIVE';
      console.log(`✓ Updated ROOT status: COMPLETE → ACTIVE`);
      
      // Update current active root if needed
      if (productTree.currentActiveRoot > ROOT_NUMBER) {
        const oldActiveRoot = productTree.currentActiveRoot;
        productTree.currentActiveRoot = ROOT_NUMBER;
        console.log(`✓ Updated currentActiveRoot: ${oldActiveRoot} → ${ROOT_NUMBER}`);
      }
    }

    // Save changes
    await neelu.save();
    console.log(`\n✅ Changes saved to database`);

    // Show updated structure
    console.log(`\n--- Updated Binary Tree Structure ---`);
    console.log(`ROOT ${ROOT_NUMBER}:`);
    console.log(`  Status: ${root.status}`);
    console.log(`  Total Members: ${root.totalMembers}/${root.maxCapacity}`);
    console.log(`  Level 1 Filled: ${root.levels.level1.filled}/${root.levels.level1.capacity}`);
    console.log(`  Level 2 Filled: ${root.levels.level2.filled}/${root.levels.level2.capacity}`);
    console.log(`  Current Active ROOT: ${productTree.currentActiveRoot}`);

    console.log(`\nLeft Leg (${root.binaryPosition.leftLeg.length} members):`);
    root.binaryPosition.leftLeg.forEach((entry, index) => {
      console.log(`  ${index + 1}. Member: ${entry.memberId}, Level: ${entry.level}, Position: ${entry.position}`);
    });

    console.log(`\nRight Leg (${root.binaryPosition.rightLeg.length} members):`);
    root.binaryPosition.rightLeg.forEach((entry, index) => {
      console.log(`  ${index + 1}. Member: ${entry.memberId}, Level: ${entry.level}, Position: ${entry.position}`);
    });

    console.log("\n" + "=".repeat(60));
    console.log("✅ BINARY TREE POSITION FIXED SUCCESSFULLY");
    console.log("=".repeat(60));

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
