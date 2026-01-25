/**
 * Script to fix level counts in binary tree
 * Recalculates level counts based on actual members in legs
 * 
 * Usage: node server/scripts/fixLevelCounts.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Member = require("../models/memeberModel");

// Member IDs
const NEELU_ID = "6798dbac4ef992e77a55c47f"; // Fchneelu2718 (referrer)
const PRODUCT_ID = "6974e1a9b4cd79b66bc760e9"; // Product ID
const ROOT_NUMBER = 1; // ROOT 1

async function main() {
  try {
    // Connect to database
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✓ Connected to database\n");

    console.log("=".repeat(60));
    console.log("FIXING LEVEL COUNTS");
    console.log("=".repeat(60));
    console.log(`\nMember: ${NEELU_ID} (Fchneelu2718)`);
    console.log(`Product: ${PRODUCT_ID}`);
    console.log(`ROOT: ${ROOT_NUMBER}`);

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
    console.log(`\n--- Current State ---`);
    console.log(`  Status: ${root.status}`);
    console.log(`  Total Members: ${root.totalMembers}/${root.maxCapacity}`);
    console.log(`  Level 1 Filled: ${root.levels.level1.filled}/${root.levels.level1.capacity}`);
    console.log(`  Level 2 Filled: ${root.levels.level2.filled}/${root.levels.level2.capacity}`);
    console.log(`  Level 3 Filled: ${root.levels.level3.filled}/${root.levels.level3.capacity}`);
    console.log(`  Level 4 Filled: ${root.levels.level4.filled}/${root.levels.level4.capacity}`);
    console.log(`  Level 5 Filled: ${root.levels.level5.filled}/${root.levels.level5.capacity}`);

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

    // Recalculate level counts
    console.log(`\n--- Recalculating Level Counts ---`);
    
    // Count members by level
    const levelCounts = {
      level1: 0,
      level2: 0,
      level3: 0,
      level4: 0,
      level5: 0
    };

    // Count from left leg
    root.binaryPosition.leftLeg.forEach(entry => {
      const levelKey = `level${entry.level}`;
      if (levelCounts[levelKey] !== undefined) {
        levelCounts[levelKey]++;
      }
    });

    // Count from right leg
    root.binaryPosition.rightLeg.forEach(entry => {
      const levelKey = `level${entry.level}`;
      if (levelCounts[levelKey] !== undefined) {
        levelCounts[levelKey]++;
      }
    });

    console.log(`Calculated counts:`);
    console.log(`  Level 1: ${levelCounts.level1}`);
    console.log(`  Level 2: ${levelCounts.level2}`);
    console.log(`  Level 3: ${levelCounts.level3}`);
    console.log(`  Level 4: ${levelCounts.level4}`);
    console.log(`  Level 5: ${levelCounts.level5}`);

    // Update level counts
    console.log(`\n--- Updating Level Counts ---`);
    let updated = false;

    for (const levelKey in levelCounts) {
      if (root.levels[levelKey].filled !== levelCounts[levelKey]) {
        console.log(`  ${levelKey}: ${root.levels[levelKey].filled} → ${levelCounts[levelKey]}`);
        root.levels[levelKey].filled = levelCounts[levelKey];
        updated = true;
      }
    }

    // Recalculate total members
    const totalMembers = root.binaryPosition.leftLeg.length + root.binaryPosition.rightLeg.length;
    if (root.totalMembers !== totalMembers) {
      console.log(`  totalMembers: ${root.totalMembers} → ${totalMembers}`);
      root.totalMembers = totalMembers;
      updated = true;
    }

    if (!updated) {
      console.log(`  ✓ All counts are correct, no updates needed`);
    }

    // Check if ROOT should be marked as COMPLETE or ACTIVE
    // ROOT is COMPLETE when Level 1 is full (2 positions)
    const shouldBeComplete = root.levels.level1.filled >= root.levels.level1.capacity;
    const currentStatus = root.status;
    
    if (shouldBeComplete && currentStatus !== 'COMPLETE') {
      root.status = 'COMPLETE';
      root.completedAt = new Date();
      console.log(`  status: ${currentStatus} → COMPLETE (Level 1 is full)`);
      updated = true;
    } else if (!shouldBeComplete && currentStatus === 'COMPLETE') {
      root.status = 'ACTIVE';
      console.log(`  status: ${currentStatus} → ACTIVE (Level 1 has space)`);
      updated = true;
    }

    if (updated) {
      // Save changes
      await neelu.save();
      console.log(`\n✅ Changes saved to database`);
    }

    // Show updated structure
    console.log(`\n--- Updated State ---`);
    console.log(`ROOT ${ROOT_NUMBER}:`);
    console.log(`  Status: ${root.status}`);
    console.log(`  Total Members: ${root.totalMembers}/${root.maxCapacity}`);
    console.log(`  Level 1 Filled: ${root.levels.level1.filled}/${root.levels.level1.capacity}`);
    console.log(`  Level 2 Filled: ${root.levels.level2.filled}/${root.levels.level2.capacity}`);
    console.log(`  Current Active ROOT: ${productTree.currentActiveRoot}`);

    console.log("\n" + "=".repeat(60));
    console.log("✅ LEVEL COUNTS FIXED SUCCESSFULLY");
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
