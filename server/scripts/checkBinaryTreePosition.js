/**
 * Script to check binary tree position for deleted order
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Member = require("../models/memeberModel");

const MEMBER_ID = "69356ab22e14bd0c6ac01bf3"; // FCH mamta1924
const REFERRER_ID = "67a5f7613a714956f0e0dc78"; // Fchanita1314
const PRODUCT_ID = "6974e1a9b4cd79b66bc760e9"; // Hormones Balancing Tablet

async function main() {
  try {
    // Connect to database
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✓ Connected to database\n");

    // Get member
    const member = await Member.findById(MEMBER_ID);
    console.log("=== Member: FCH mamta1924 ===");
    console.log(`ID: ${member._id}`);
    console.log(`Username: ${member.userName}`);
    console.log(`Name: ${member.fName} ${member.lName}`);
    
    // Check product tree
    const productTree = member.productBinaryTrees.find(
      tree => tree.productId.toString() === PRODUCT_ID
    );
    
    if (productTree) {
      console.log("\n=== Product Tree Found ===");
      console.log(`Product ID: ${productTree.productId}`);
      console.log(`Total Purchases: ${productTree.totalPurchases}`);
      console.log(`Total Spent: ₹${productTree.totalSpent}`);
      console.log(`Is Active: ${productTree.isActive}`);
      console.log(`Purchases in history: ${productTree.purchases.length}`);
      
      if (productTree.purchases.length > 0) {
        console.log("\n--- Purchases ---");
        productTree.purchases.forEach((p, i) => {
          console.log(`\n${i + 1}. Order ID: ${p.orderId}`);
          console.log(`   Amount: ₹${p.amount}`);
          console.log(`   Quantity: ${p.quantity}`);
          console.log(`   Date: ${p.purchaseDate}`);
          console.log(`   First Purchase: ${p.isFirstPurchase}`);
          console.log(`   ROOT: ${p.rootNumber}`);
        });
      }
      
      console.log("\n--- Binary Tree Roots ---");
      console.log(`Total Roots: ${productTree.roots.length}`);
      console.log(`Current Active Root: ${productTree.currentActiveRoot}`);
      
      productTree.roots.forEach((root, i) => {
        console.log(`\nROOT ${root.rootNumber}:`);
        console.log(`  Status: ${root.status}`);
        console.log(`  Total Members: ${root.totalMembers}`);
        console.log(`  Left Leg: ${root.binaryPosition.leftLeg.length} members`);
        console.log(`  Right Leg: ${root.binaryPosition.rightLeg.length} members`);
      });
    } else {
      console.log("\n⚠️ No product tree found for this product");
    }

    // Get referrer
    console.log("\n\n=== Referrer: Fchanita1314 ===");
    const referrer = await Member.findById(REFERRER_ID);
    console.log(`ID: ${referrer._id}`);
    console.log(`Username: ${referrer.userName}`);
    console.log(`Name: ${referrer.fName} ${referrer.lName}`);
    
    const referrerProductTree = referrer.productBinaryTrees.find(
      tree => tree.productId.toString() === PRODUCT_ID
    );
    
    if (referrerProductTree) {
      console.log("\n=== Referrer's Product Tree ===");
      console.log(`Total Roots: ${referrerProductTree.roots.length}`);
      console.log(`Current Active Root: ${referrerProductTree.currentActiveRoot}`);
      
      referrerProductTree.roots.forEach((root, i) => {
        console.log(`\nROOT ${root.rootNumber}:`);
        console.log(`  Status: ${root.status}`);
        console.log(`  Total Members: ${root.totalMembers}`);
        console.log(`  Left Leg: ${root.binaryPosition.leftLeg.length} members`);
        console.log(`  Right Leg: ${root.binaryPosition.rightLeg.length} members`);
        
        // Check if member is in left leg
        const inLeftLeg = root.binaryPosition.leftLeg.find(
          leg => leg.memberId.toString() === MEMBER_ID
        );
        
        if (inLeftLeg) {
          console.log(`  \n  ✓ FCH mamta1924 FOUND in LEFT LEG`);
          console.log(`    Position: ${inLeftLeg.position}`);
          console.log(`    Level: ${inLeftLeg.level}`);
          console.log(`    Joined: ${inLeftLeg.joinedAt}`);
        }
        
        // Check if member is in right leg
        const inRightLeg = root.binaryPosition.rightLeg.find(
          leg => leg.memberId.toString() === MEMBER_ID
        );
        
        if (inRightLeg) {
          console.log(`  \n  ✓ FCH mamta1924 FOUND in RIGHT LEG`);
          console.log(`    Position: ${inRightLeg.position}`);
          console.log(`    Level: ${inRightLeg.level}`);
          console.log(`    Joined: ${inRightLeg.joinedAt}`);
        }
      });
    }

    // Close connection
    await mongoose.connection.close();
    console.log("\n\n✓ Database connection closed");
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
