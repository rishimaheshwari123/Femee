/**
 * Script to fix level numbering in ALL binary trees
 * Changes Level 2 members (with position L or R) to Level 1
 * Recalculates all level counts and ROOT statuses
 * 
 * Usage: node server/scripts/fixAllBinaryTrees.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Member = require("../models/memeberModel");

async function fixMemberBinaryTrees(member) {
  let totalFixed = 0;
  let totalRootsFixed = 0;

  for (const productTree of member.productBinaryTrees) {
    for (const root of productTree.roots) {
      let rootUpdated = false;

      // Fix level numbering in left leg
      root.binaryPosition.leftLeg.forEach(entry => {
        if ((entry.position === 'L' || entry.position === 'R') && entry.level === 2) {
          entry.level = 1;
          rootUpdated = true;
        }
      });

      // Fix level numbering in right leg
      root.binaryPosition.rightLeg.forEach(entry => {
        if ((entry.position === 'L' || entry.position === 'R') && entry.level === 2) {
          entry.level = 1;
          rootUpdated = true;
        }
      });

      // Recalculate level counts
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

      // Update level counts
      for (const levelKey in levelCounts) {
        if (root.levels[levelKey].filled !== levelCounts[levelKey]) {
          root.levels[levelKey].filled = levelCounts[levelKey];
          rootUpdated = true;
        }
      }

      // Recalculate total members
      const totalMembers = root.binaryPosition.leftLeg.length + root.binaryPosition.rightLeg.length;
      if (root.totalMembers !== totalMembers) {
        root.totalMembers = totalMembers;
        rootUpdated = true;
      }

      // Check if ROOT should be marked as COMPLETE or ACTIVE
      // ROOT is COMPLETE when Level 1 is full (2 positions)
      const shouldBeComplete = root.levels.level1.filled >= root.levels.level1.capacity;
      
      if (shouldBeComplete && root.status !== 'COMPLETE') {
        root.status = 'COMPLETE';
        root.completedAt = new Date();
        rootUpdated = true;
      } else if (!shouldBeComplete && root.status === 'COMPLETE') {
        root.status = 'ACTIVE';
        rootUpdated = true;
      }

      if (rootUpdated) {
        totalRootsFixed++;
      }
    }

    if (totalRootsFixed > 0) {
      totalFixed++;
    }
  }

  return { totalFixed, totalRootsFixed };
}

async function main() {
  try {
    // Connect to database
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✓ Connected to database\n");

    console.log("=".repeat(60));
    console.log("FIXING ALL BINARY TREES");
    console.log("=".repeat(60));

    // Get all members with product binary trees
    const members = await Member.find({
      'productBinaryTrees.0': { $exists: true }
    });

    console.log(`\nFound ${members.length} members with binary trees`);

    let totalMembersFixed = 0;
    let totalRootsFixed = 0;

    for (const member of members) {
      const result = await fixMemberBinaryTrees(member);
      
      if (result.totalFixed > 0) {
        console.log(`\n✓ Fixed ${member.userName} (${member._id})`);
        console.log(`  Product trees fixed: ${result.totalFixed}`);
        console.log(`  ROOTs fixed: ${result.totalRootsFixed}`);
        
        await member.save();
        totalMembersFixed++;
        totalRootsFixed += result.totalRootsFixed;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ ALL BINARY TREES FIXED");
    console.log("=".repeat(60));
    console.log(`\nMembers fixed: ${totalMembersFixed}`);
    console.log(`ROOTs fixed: ${totalRootsFixed}`);

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
