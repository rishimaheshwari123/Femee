const Memeber = require("../models/memeberModel");

/**
 * Pair Reward Structure
 * Pair 1: ₹100
 * Pair 2: ₹200
 * Pair 3: ₹400
 * Pair 4: ₹450
 */
const PAIR_REWARDS = {
    1: 100,
    2: 200,
    3: 400,
    4: 450,
};

/**
 * Calculate left and right referrals for a member
 * Left-Right placement logic:
 * 1st child → LEFT
 * 2nd child → RIGHT
 * 3rd child → LEFT
 * 4th child → RIGHT (and so on, alternating)
 */
const calculateLeftRightReferrals = async (memberId) => {
    try {
        const member = await Memeber.findById(memberId).populate("child");

        if (!member) {
            throw new Error("Member not found");
        }

        const leftReferrals = [];
        const rightReferrals = [];

        // Distribute children based on alternating pattern
        member.child.forEach((child, index) => {
            if (index % 2 === 0) {
                // Even index (0, 2, 4...) → LEFT
                leftReferrals.push(child);
            } else {
                // Odd index (1, 3, 5...) → RIGHT
                rightReferrals.push(child);
            }
        });

        return {
            leftCount: leftReferrals.length,
            rightCount: rightReferrals.length,
            leftReferrals,
            rightReferrals,
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Calculate total pairs completed
 * 1 Pair = 1 Left + 1 Right
 */
const calculateCompletedPairs = (leftCount, rightCount) => {
    return Math.min(leftCount, rightCount);
};

/**
 * Get pair reward amount
 */
const getPairReward = (pairNumber) => {
    return PAIR_REWARDS[pairNumber] || 0;
};

/**
 * Check if member is eligible for a specific pair
 */
const checkPairEligibility = async (memberId, pairNumber) => {
    try {
        const { leftCount, rightCount } = await calculateLeftRightReferrals(memberId);
        const completedPairs = calculateCompletedPairs(leftCount, rightCount);

        // Member must have completed at least 'pairNumber' pairs
        return completedPairs >= pairNumber;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    PAIR_REWARDS,
    calculateLeftRightReferrals,
    calculateCompletedPairs,
    getPairReward,
    checkPairEligibility,
};
