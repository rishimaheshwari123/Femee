/**
 * ALML Service - Achievement Level-based Member Logic
 * Reads data from binary tree, stores achievements separately
 * NO MODIFICATIONS TO BINARY TREE SYSTEM
 */

const User = require("../models/memeberModel");
const ALMLAchievement = require("../models/ALMLAchievement");
const mongoose = require("mongoose");

// ALML Configuration
const ALML_STEPS = [
  { step: 1, requiredMembers: 2, bonusAmount: 600 },
  { step: 2, requiredMembers: 4, bonusAmount: 600 },
  { step: 3, requiredMembers: 8, bonusAmount: 800 },
  { step: 4, requiredMembers: 16, bonusAmount: 800 },
  { step: 5, requiredMembers: 32, bonusAmount: 1600 }
];

const TOTAL_BONUS = 4400;

class ALMLService {
  
  /**
   * READ ONLY: Get member count from binary tree
   */
  static async getMemberCountFromBinaryTree(memberId, productId, rootNumber) {
    try {
      const member = await User.findById(memberId);
      if (!member) return 0;

      const productTree = member.productBinaryTrees.find(
        tree => tree.productId.toString() === productId.toString()
      );
      if (!productTree) return 0;

      const root = productTree.roots.find(r => r.rootNumber === rootNumber);
      if (!root) return 0;

      return root.totalMembers || 0;
    } catch (error) {
      console.error("Error reading binary tree:", error);
      return 0;
    }
  }

  /**
   * Get or create achievement record (separate schema)
   */
  static async getOrCreateAchievement(memberId, productId, rootNumber) {
    try {
      let achievement = await ALMLAchievement.findOne({
        memberId,
        productId,
        rootNumber
      });

      if (achievement) return achievement;

      // Create new
      achievement = await ALMLAchievement.create({
        memberId,
        productId,
        rootNumber,
        steps: ALML_STEPS.map(step => ({
          step: step.step,
          requiredMembers: step.requiredMembers,
          currentMembers: 0,
          bonusAmount: step.bonusAmount,
          isComplete: false
        })),
        totalSteps: 5,
        completedSteps: 0,
        totalBonusAmount: TOTAL_BONUS,
        allStepsComplete: false,
        isClaimed: false,
        status: 'ACTIVE'
      });

      console.log(`✅ ALML Achievement created: Member ${memberId}, ROOT ${rootNumber}`);
      return achievement;
    } catch (error) {
      console.error("Error creating achievement:", error);
      throw error;
    }
  }

  /**
   * Sync achievement with binary tree data
   */
  static async syncAchievementWithBinaryTree(memberId, productId, rootNumber) {
    try {
      const currentMembers = await this.getMemberCountFromBinaryTree(memberId, productId, rootNumber);
      const achievement = await this.getOrCreateAchievement(memberId, productId, rootNumber);

      let completedSteps = 0;
      
      for (let step of achievement.steps) {
        step.currentMembers = currentMembers;
        
        if (currentMembers >= step.requiredMembers && !step.isComplete) {
          step.isComplete = true;
          step.completedAt = new Date();
        }
        
        if (step.isComplete) completedSteps++;
      }

      achievement.completedSteps = completedSteps;
      achievement.allStepsComplete = (completedSteps === 5);
      achievement.lastUpdated = new Date();

      if (achievement.allStepsComplete && !achievement.isClaimed) {
        achievement.status = 'COMPLETE';
      }

      await achievement.save();
      return achievement;
    } catch (error) {
      console.error("Error syncing achievement:", error);
      throw error;
    }
  }

  /**
   * Get achievement chart for ROOT
   */
  static async getAchievementChart(memberId, productId, rootNumber) {
    try {
      const achievement = await this.syncAchievementWithBinaryTree(memberId, productId, rootNumber);
      const member = await User.findById(memberId).select('userName email');

      return {
        rootNumber,
        steps: achievement.steps,
        summary: {
          totalSteps: achievement.totalSteps,
          completedSteps: achievement.completedSteps,
          totalBonusAmount: achievement.totalBonusAmount,
          allStepsComplete: achievement.allStepsComplete,
          isClaimed: achievement.isClaimed,
          claimedAmount: achievement.claimedAmount,
          canClaim: achievement.allStepsComplete && !achievement.isClaimed,
          status: achievement.status
        },
        memberInfo: {
          userName: member?.userName,
          email: member?.email
        }
      };
    } catch (error) {
      console.error("Error getting chart:", error);
      throw error;
    }
  }

  /**
   * Get all ROOT achievements for product
   */
  static async getAllRootAchievements(memberId, productId) {
    try {
      const member = await User.findById(memberId).populate('productBinaryTrees.productId', 'title images price');
      if (!member) throw new Error("Member not found");

      const productTree = member.productBinaryTrees.find(
        tree => tree.productId._id.toString() === productId.toString()
      );
      if (!productTree) throw new Error("Product tree not found");

      const rootAchievements = [];
      
      for (const root of productTree.roots) {
        const achievement = await this.syncAchievementWithBinaryTree(memberId, productId, root.rootNumber);

        rootAchievements.push({
          rootNumber: root.rootNumber,
          rootStatus: root.status,
          totalMembers: root.totalMembers,
          maxCapacity: root.maxCapacity,
          summary: {
            completedSteps: achievement.completedSteps,
            totalSteps: achievement.totalSteps,
            allStepsComplete: achievement.allStepsComplete,
            isClaimed: achievement.isClaimed,
            claimedAmount: achievement.claimedAmount,
            canClaim: achievement.allStepsComplete && !achievement.isClaimed,
            status: achievement.status
          }
        });
      }

      return {
        productId: productTree.productId._id,
        productTitle: productTree.productId.title,
        productImage: productTree.productId.images?.[0]?.url,
        currentActiveRoot: productTree.currentActiveRoot,
        totalRoots: productTree.roots.length,
        roots: rootAchievements
      };
    } catch (error) {
      console.error("Error getting all achievements:", error);
      throw error;
    }
  }

  /**
   * Claim achievements (ALL 5 STEPS MUST BE COMPLETE)
   */
  static async claimAchievements(memberId, productId, rootNumber) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await this.syncAchievementWithBinaryTree(memberId, productId, rootNumber);

      const achievement = await ALMLAchievement.findOne({
        memberId,
        productId,
        rootNumber
      }).session(session);

      if (!achievement) throw new Error("Achievement not found");

      if (!achievement.allStepsComplete) {
        throw new Error(`Cannot claim: Only ${achievement.completedSteps}/5 steps completed`);
      }

      if (achievement.isClaimed) {
        throw new Error("Already claimed");
      }

      const member = await User.findById(memberId).session(session);
      if (!member) throw new Error("Member not found");

      const balanceBefore = member.wallet;
      member.wallet += TOTAL_BONUS;
      member.totalEarnings += TOTAL_BONUS;
      const balanceAfter = member.wallet;

      achievement.isClaimed = true;
      achievement.claimedAt = new Date();
      achievement.claimedAmount = TOTAL_BONUS;
      achievement.status = 'CLAIMED';

      // Create transaction record for admin tracking
      const Transaction = require("../models/Transaction");
      await Transaction.create([{
        memberId: memberId,
        productId: productId,
        transactionType: 'alml_claim',
        amount: TOTAL_BONUS,
        description: `ALML Achievement Claim - ROOT ${rootNumber} (All 5 Steps Completed)`,
        almlDetails: {
          rootNumber: rootNumber,
          completedSteps: 5,
          claimedAt: new Date()
        },
        status: 'completed',
        balanceBefore: balanceBefore,
        balanceAfter: balanceAfter
      }], { session });

      await member.save({ session });
      await achievement.save({ session });

      await session.commitTransaction();
      session.endSession();

      console.log(`💰 Claimed: Member ${memberId}, ROOT ${rootNumber}, ₹${TOTAL_BONUS}`);

      return {
        success: true,
        claimedAmount: TOTAL_BONUS,
        newWalletBalance: member.wallet,
        message: `Successfully claimed ₹${TOTAL_BONUS} from ROOT ${rootNumber}`
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Get summary for dashboard
   */
  static async getALMLSummary(memberId) {
    try {
      const member = await User.findById(memberId).populate('productBinaryTrees.productId', 'title images');
      if (!member) throw new Error("Member not found");

      const summary = {
        totalProducts: member.productBinaryTrees.length,
        totalRoots: 0,
        totalClaimableAmount: 0,
        totalClaimedAmount: 0,
        claimableRoots: [],
        products: []
      };

      for (const productTree of member.productBinaryTrees) {
        let productClaimable = 0;
        let productClaimed = 0;
        const claimableRootsForProduct = [];

        for (const root of productTree.roots) {
          summary.totalRoots++;

          const achievement = await this.syncAchievementWithBinaryTree(
            memberId,
            productTree.productId._id,
            root.rootNumber
          );

          if (achievement.isClaimed) {
            productClaimed += achievement.claimedAmount;
          }

          if (achievement.allStepsComplete && !achievement.isClaimed) {
            productClaimable += TOTAL_BONUS;
            claimableRootsForProduct.push({
              rootNumber: root.rootNumber,
              claimAmount: TOTAL_BONUS
            });
          }
        }

        summary.totalClaimableAmount += productClaimable;
        summary.totalClaimedAmount += productClaimed;

        if (claimableRootsForProduct.length > 0) {
          summary.claimableRoots.push({
            productId: productTree.productId._id,
            productTitle: productTree.productId.title,
            productImage: productTree.productId.images?.[0]?.url,
            roots: claimableRootsForProduct
          });
        }

        summary.products.push({
          productId: productTree.productId._id,
          productTitle: productTree.productId.title,
          totalRoots: productTree.roots.length,
          claimableAmount: productClaimable,
          claimedAmount: productClaimed
        });
      }

      return summary;
    } catch (error) {
      console.error("Error getting summary:", error);
      throw error;
    }
  }
}

module.exports = ALMLService;
