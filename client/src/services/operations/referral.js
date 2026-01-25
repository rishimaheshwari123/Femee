import { apiConnector } from "../apiConnector";
import { referralEndpoints } from "../apis";

const {
  GENERATE_REFERRAL_LINK_API,
  VALIDATE_REFERRAL_LINK_API,
  GET_REFERRAL_STATS_API,
} = referralEndpoints;

/**
 * Generate a referral link for a product
 * @param {string} productId - Product ID
 * @param {string} referrerId - Referrer member ID
 * @param {string} token - Authentication token
 * @returns {Promise} API response
 */
export const generateReferralLink = async (productId, referrerId, token) => {
  try {
    const response = await apiConnector(
      "POST",
      GENERATE_REFERRAL_LINK_API,
      { productId, referrerId },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    console.error("Error generating referral link:", error);
    throw error;
  }
};

/**
 * Validate a referral link
 * @param {string} productId - Product ID
 * @param {string} referrerId - Referrer member ID
 * @returns {Promise} API response
 */
export const validateReferralLink = async (productId, referrerId) => {
  try {
    const response = await apiConnector(
      "POST",
      VALIDATE_REFERRAL_LINK_API,
      { productId, referrerId }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    console.error("Error validating referral link:", error);
    throw error;
  }
};

/**
 * Get referral statistics for a member
 * @param {string} memberId - Member ID
 * @param {string} token - Authentication token
 * @param {string} productId - Optional product ID to filter stats
 * @returns {Promise} API response
 */
export const getReferralStats = async (memberId, token, productId = null) => {
  try {
    const url = productId
      ? `${GET_REFERRAL_STATS_API}/${memberId}?productId=${productId}`
      : `${GET_REFERRAL_STATS_API}/${memberId}`;

    const response = await apiConnector("GET", url, null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    console.error("Error getting referral stats:", error);
    throw error;
  }
};

/**
 * Store referral data in localStorage when a referral link is accessed
 * @param {string} productId - Product ID
 * @param {string} referrerId - Referrer member ID
 */
export const storeReferralData = (productId, referrerId) => {
  try {
    const referralData = {
      productId,
      referrerId,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem("referralData", JSON.stringify(referralData));
    console.log("Referral data stored:", referralData);
  } catch (error) {
    console.error("Error storing referral data:", error);
  }
};

/**
 * Retrieve referral data from localStorage
 * @returns {Object|null} Referral data or null if not found
 */
export const getReferralData = () => {
  try {
    const referralDataStr = localStorage.getItem("referralData");
    if (!referralDataStr) {
      return null;
    }

    const referralData = JSON.parse(referralDataStr);
    return referralData;
  } catch (error) {
    console.error("Error retrieving referral data:", error);
    return null;
  }
};

/**
 * Clear referral data from localStorage after successful purchase
 */
export const clearReferralData = () => {
  try {
    localStorage.removeItem("referralData");
    console.log("Referral data cleared");
  } catch (error) {
    console.error("Error clearing referral data:", error);
  }
};

/**
 * Check if referral data exists and is still valid (within 24 hours)
 * @returns {boolean} True if valid referral data exists
 */
export const hasValidReferralData = () => {
  try {
    const referralData = getReferralData();
    if (!referralData) {
      return false;
    }

    // Check if referral data is within 24 hours
    const timestamp = new Date(referralData.timestamp);
    const now = new Date();
    const hoursDiff = (now - timestamp) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      // Referral data expired, clear it
      clearReferralData();
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking referral data validity:", error);
    return false;
  }
};
