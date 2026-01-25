const Product = require("../models/Product");
const mongoose = require("mongoose");

/**
 * Commission Configuration Utility
 * Handles tier-based commission percentage retrieval and management
 */

/**
 * Get matching percentage based on member tier and product configuration
 * Loads percentages from product binaryConfig
 * Returns default if tier not found
 * 
 * @param {String} tier - Member's tier (Bronze, Silver, Gold, Platinum, Diamond, Blue Diamond)
 * @param {String} productId - Product's ObjectId
 * @returns {Promise<Number>} Matching percentage
 */
async function getMatchingPercentage(tier, productId) {
    try {
        // Validate productId
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            throw new Error("Invalid product ID");
        }

        // Fetch the product
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error("Product not found");
        }

        // Validate tier - use Bronze as default if invalid
        const validTiers = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Blue Diamond"];
        
        if (!tier || !validTiers.includes(tier)) {
            console.warn(`Invalid or missing tier: ${tier}, using Bronze default`);
            tier = "Bronze";
        }

        // Get matching percentage from product config
        if (product.binaryConfig && product.binaryConfig.matchingPercentage) {
            const percentage = product.binaryConfig.matchingPercentage[tier];
            
            // If percentage exists and is valid, return it
            if (percentage !== undefined && percentage !== null && typeof percentage === 'number') {
                return percentage;
            }
            
            // If tier percentage not found in config, try Bronze default
            if (tier !== "Bronze") {
                console.warn(`Percentage not found for tier ${tier}, trying Bronze default`);
                const bronzePercentage = product.binaryConfig.matchingPercentage["Bronze"];
                if (bronzePercentage !== undefined && bronzePercentage !== null) {
                    return bronzePercentage;
                }
            }
        }

        // Default fallback percentages if product config is missing or invalid
        const defaultPercentages = {
            "Bronze": 10,
            "Silver": 12,
            "Gold": 15,
            "Platinum": 18,
            "Diamond": 20,
            "Blue Diamond": 22
        };

        const defaultPercentage = defaultPercentages[tier] || defaultPercentages["Bronze"];
        console.warn(`Using default percentage ${defaultPercentage}% for tier ${tier}`);
        
        return defaultPercentage;
    } catch (error) {
        console.error("Error getting matching percentage:", error);
        // Ultimate fallback - Bronze tier default
        return 10;
    }
}

/**
 * Get all valid tier names
 * @returns {Array<String>} Array of valid tier names
 */
function getValidTiers() {
    return ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Blue Diamond"];
}

/**
 * Get default matching percentages for all tiers
 * @returns {Object} Object with tier names as keys and percentages as values
 */
function getDefaultMatchingPercentages() {
    return {
        "Bronze": 10,
        "Silver": 12,
        "Gold": 15,
        "Platinum": 18,
        "Diamond": 20,
        "Blue Diamond": 22
    };
}

/**
 * Validate commission rate value
 * @param {Number} percentage - Percentage value to validate
 * @returns {Boolean} True if valid, false otherwise
 */
function isValidCommissionRate(percentage) {
    return typeof percentage === 'number' && 
           percentage >= 0 && 
           percentage <= 100 && 
           !isNaN(percentage);
}

module.exports = {
    getMatchingPercentage,
    getValidTiers,
    getDefaultMatchingPercentages,
    isValidCommissionRate
};
