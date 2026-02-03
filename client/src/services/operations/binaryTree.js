/**
 * Binary Tree API Service
 * Handles all binary tree related API calls
 */

import { apiConnector } from '../apiConnector';
import { memberEndpoints, auth } from '../apis';

const { GET_BINARY_TREE_STRUCTURE } = memberEndpoints;

/**
 * Get Binary Tree Structure
 * @param {string} memberId - Member ID
 * @param {string} productId - Product ID
 * @param {number} rootNumber - Optional: specific ROOT number
 * @returns {Promise} API response
 */
export const getBinaryTreeStructure = async (memberId, productId, rootNumber = null) => {
  try {
    let url = GET_BINARY_TREE_STRUCTURE
      .replace(':memberId', memberId)
      .replace(':productId', productId);
    
    if (rootNumber) {
      url += `?rootNumber=${rootNumber}`;
    }

    // Add cache-busting headers to prevent stale data
    const response = await apiConnector('GET', url, null, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching binary tree structure:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch binary tree structure'
    };
  }
};

/**
 * Get Member Product Trees (for dashboard)
 * Uses existing dashboard API
 * @param {string} memberId - Member ID
 * @returns {Promise} Array of product trees
 */
export const getMemberProductTrees = async (memberId) => {
  try {
    const BASE_URL = process.env.REACT_APP_BASE_URL;
    const url = `${BASE_URL}/auth/${memberId}/product-trees`;
    
    console.log('getMemberProductTrees called with memberId:', memberId);
    console.log('API URL:', url);
    
    const response = await apiConnector('GET', url);
    
    console.log('API Response:', response.data);
    
    if (response.data.success) {
      return response.data.data.productTrees || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching member product trees:', error);
    return [];
  }
};

/**
 * Get Product Binary Tree (for visualization)
 * @param {string} memberId - Member ID
 * @param {string} productId - Product ID
 * @returns {Promise} Binary tree data
 */
export const getProductBinaryTree = async (memberId, productId) => {
  try {
    return await getBinaryTreeStructure(memberId, productId);
  } catch (error) {
    console.error('Error fetching product binary tree:', error);
    return null;
  }
};

/**
 * Generate Referral Link
 * @param {string} productId - Product ID
 * @param {string} referrerId - Referrer ID
 * @returns {Promise} Referral link
 */
export const generateReferralLink = async (productId, referrerId) => {
  try {
    // Generate referral link format: /product/:productId/:referrerId
    const baseUrl = window.location.origin;
    const referralLink = `${baseUrl}/product/${productId}/${referrerId}`;
    return referralLink;
  } catch (error) {
    console.error('Error generating referral link:', error);
    return null;
  }
};

/**
 * Get Member Transactions
 * Uses existing dashboard API
 * @param {string} memberId - Member ID
 * @param {string} productId - Product ID
 * @returns {Promise} Array of transactions
 */
export const getMemberTransactions = async (memberId, productId) => {
  try {
    const BASE_URL = process.env.REACT_APP_BASE_URL;
    const url = `${BASE_URL}/auth/${memberId}/transactions/${productId}`;
    
    const response = await apiConnector('GET', url);
    
    if (response.data.success) {
      return response.data.data.transactions || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching member transactions:', error);
    return [];
  }
};

/**
 * Copy Referral Link to Clipboard
 * @param {string} link - Referral link
 * @returns {Promise} Success boolean
 */
export const copyReferralLink = async (link) => {
  try {
    await navigator.clipboard.writeText(link);
    return true;
  } catch (error) {
    console.error('Error copying referral link:', error);
    return false;
  }
};
