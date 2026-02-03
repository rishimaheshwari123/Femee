/**
 * Test ALML Flow
 * Tests the complete flow from order creation to ALML achievement tracking
 */

const mongoose = require("mongoose");
const User = require("../models/memeberModel");
const ALMLService = require("../services/ALMLService");
require("dotenv").config();

async function testALMLFlow() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ Connected to database");

    // Test parameters - UPDATE THESE WITH REAL IDs FROM YOUR DATABASE
    const testMemberId = "YOUR_MEMBER_ID_HERE"; // Replace with actual member ID
    const testProductId = "YOUR_PRODUCT_ID_HERE"; // Replace with actual product ID

    console.log("\n🔍 Testing ALML Flow...\n");

    // Test 1: Get member's product tree
    console.log("📊 Test 1: Fetching member's product tree...");
    const member = await User.findById(testMemberId);
    if (!member) {
      console.log("❌ Member not found");
      return;
    }
    console.log(`✅ Member found: ${member.userName}`);

    const productTree = member.productBinaryTrees.find(
      tree => tree.productId.toString() === testProductId.toString()
    );

    if (!productTree) {
      console.log("❌ Product tree not found for this member");
      return;
    }
    console.log(`✅ Product tree found with ${productTree.roots.length} ROOT(s)`);

    // Test 2: Check each ROOT's ALML status
    console.log("\n📊 Test 2: Checking ALML status for each ROOT...");
    for (const root of productTree.roots) {
      console.log(`\n🌳 ROOT ${root.rootNumber}:`);
      console.log(`   Status: ${root.status}`);
      console.log(`   Total Members: ${root.totalMembers}/${root.maxCapacity}`);
      
      if (root.achievements && root.achievements.length > 0) {
        console.log(`   Achievements:`);
        root.achievements.forEach(achievement => {
          const status = achievement.isClaimed ? '✅ Claimed' : 
                        achievement.isComplete ? '🎯 Complete' : 
                        '⏳ Pending';
          console.log(`      Step ${achievement.step}: ${achievement.currentMembers}/${achievement.requiredMembers} members → ₹${achievement.bonusAmount} ${status}`);
        });

        if (root.almlSummary) {
          console.log(`   Summary:`);
          console.log(`      Completed Steps: ${root.almlSummary.completedSteps}/${root.almlSummary.totalSteps}`);
          console.log(`      Claimed: ₹${root.almlSummary.totalBonusClaimed}`);
          console.log(`      Pending: ₹${root.almlSummary.totalBonusPending}`);
          console.log(`      Can Claim: ${root.almlSummary.canClaim ? '✅ YES' : '❌ NO'}`);
        }
      } else {
        console.log(`   ⚠️ No achievements initialized`);
      }
    }

    // Test 3: Get achievement chart via service
    console.log("\n📊 Test 3: Getting achievement chart via ALMLService...");
    try {
      const chart = await ALMLService.getAchievementChart(
        testMemberId,
        testProductId,
        1 // ROOT 1
      );
      console.log("✅ Achievement chart fetched successfully");
      console.log(JSON.stringify(chart, null, 2));
    } catch (error) {
      console.log("❌ Error fetching chart:", error.message);
    }

    // Test 4: Get all ROOT achievements
    console.log("\n📊 Test 4: Getting all ROOT achievements...");
    try {
      const allAchievements = await ALMLService.getAllRootAchievements(
        testMemberId,
        testProductId
      );
      console.log("✅ All ROOT achievements fetched");
      console.log(`   Product: ${allAchievements.productTitle}`);
      console.log(`   Active ROOT: ${allAchievements.currentActiveRoot}`);
      console.log(`   Total ROOTs: ${allAchievements.roots.length}`);
      
      allAchievements.roots.forEach(root => {
        console.log(`\n   ROOT ${root.rootNumber}:`);
        console.log(`      Status: ${root.status}`);
        console.log(`      Members: ${root.totalMembers}`);
        console.log(`      Can Claim: ${root.summary.canClaim ? '✅ YES' : '❌ NO'}`);
        console.log(`      Claimable: ₹${root.summary.totalBonusPending}`);
      });
    } catch (error) {
      console.log("❌ Error:", error.message);
    }

    // Test 5: Simulate claim (COMMENTED OUT - uncomment to test actual claim)
    /*
    console.log("\n📊 Test 5: Testing claim functionality...");
    try {
      const claimResult = await ALMLService.claimAchievements(
        testMemberId,
        testProductId,
        1 // ROOT 1
      );
      console.log("✅ Claim successful!");
      console.log(`   Amount claimed: ₹${claimResult.claimedAmount}`);
      console.log(`   New wallet balance: ₹${claimResult.newWalletBalance}`);
    } catch (error) {
      console.log("❌ Claim failed:", error.message);
    }
    */

    console.log("\n✅ All tests completed!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from database");
  }
}

// Run tests
testALMLFlow();
