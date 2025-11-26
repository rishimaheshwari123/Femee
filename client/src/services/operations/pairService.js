import { toast } from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { pairEndpoints } from "../apis";

const {
  SUBMIT_PAIR_REQUEST,
  GET_MY_PAIR_REQUESTS,
  GET_PAIR_DASHBOARD,
  GET_ALL_PAIR_REQUESTS_ADMIN,
  GET_PAIR_REQUEST_BY_ID_ADMIN,
  APPROVE_PAIR_REQUEST_ADMIN,
  REJECT_PAIR_REQUEST_ADMIN,
} = pairEndpoints;

// ============================================
// MEMBER APIs
// ============================================

/**
 * Submit a pair request
 */
export const submitPairRequest = async (pairNumber, token) => {
  const toastId = toast.loading("Submitting pair request...");
  let result = null;

  try {
    const response = await apiConnector(
      "POST",
      SUBMIT_PAIR_REQUEST,
      { pairNumber },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to submit pair request");
    }

    result = response.data;
    toast.success(`Pair ${pairNumber} request submitted successfully!`);
  } catch (error) {
    console.error("SUBMIT_PAIR_REQUEST_ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to submit pair request");
  }

  toast.dismiss(toastId);
  return result;
};

/**
 * Get my pair requests
 */
export const getMyPairRequests = async (token) => {
  let result = null;

  try {
    const response = await apiConnector("GET", GET_MY_PAIR_REQUESTS, null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to fetch pair requests");
    }

    result = response.data.data;
  } catch (error) {
    console.error("GET_MY_PAIR_REQUESTS_ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to fetch pair requests");
  }

  return result;
};

/**
 * Get member dashboard data
 */
export const getPairDashboard = async (token) => {
  let result = null;

  try {
    const response = await apiConnector("GET", GET_PAIR_DASHBOARD, null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to fetch dashboard data");
    }

    result = response.data.data;
  } catch (error) {
    console.error("GET_PAIR_DASHBOARD_ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to fetch dashboard data");
  }

  return result;
};

// ============================================
// ADMIN APIs
// ============================================

/**
 * Get all pair requests (Admin)
 */
export const getAllPairRequestsAdmin = async (token, filters = {}) => {
  let result = null;

  try {
    const { status, pairNumber, page = 1, limit = 20 } = filters;
    const params = {};

    if (status) params.status = status;
    if (pairNumber) params.pairNumber = pairNumber;
    params.page = page;
    params.limit = limit;

    const response = await apiConnector(
      "GET",
      GET_ALL_PAIR_REQUESTS_ADMIN,
      null,
      {
        Authorization: `Bearer ${token}`,
      },
      params
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to fetch pair requests");
    }

    result = response.data.data;
  } catch (error) {
    console.error("GET_ALL_PAIR_REQUESTS_ADMIN_ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to fetch pair requests");
  }

  return result;
};

/**
 * Get single pair request by ID (Admin)
 */
export const getPairRequestByIdAdmin = async (token, requestId) => {
  let result = null;

  try {
    const response = await apiConnector(
      "GET",
      `${GET_PAIR_REQUEST_BY_ID_ADMIN}/${requestId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to fetch pair request");
    }

    result = response.data.data;
  } catch (error) {
    console.error("GET_PAIR_REQUEST_BY_ID_ADMIN_ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to fetch pair request");
  }

  return result;
};

/**
 * Approve pair request (Admin)
 */
export const approvePairRequestAdmin = async (token, requestId, formData) => {
  const toastId = toast.loading("Approving pair request...");
  let result = null;

  try {
    const response = await apiConnector(
      "POST",
      `${APPROVE_PAIR_REQUEST_ADMIN}/${requestId}`,
      formData,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to approve pair request");
    }

    result = response.data;
    toast.success("Pair request approved successfully!");
  } catch (error) {
    console.error("APPROVE_PAIR_REQUEST_ADMIN_ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to approve pair request");
  }

  toast.dismiss(toastId);
  return result;
};

/**
 * Reject pair request (Admin)
 */
export const rejectPairRequestAdmin = async (token, requestId, notes) => {
  const toastId = toast.loading("Rejecting pair request...");
  let result = null;

  try {
    const response = await apiConnector(
      "POST",
      `${REJECT_PAIR_REQUEST_ADMIN}/${requestId}`,
      { notes },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to reject pair request");
    }

    result = response.data;
    toast.success("Pair request rejected");
  } catch (error) {
    console.error("REJECT_PAIR_REQUEST_ADMIN_ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to reject pair request");
  }

  toast.dismiss(toastId);
  return result;
};
