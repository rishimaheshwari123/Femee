import { toast } from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { setNumberEndpoints } from "../apis";

const { GET_USER_SET_NUMBERS } = setNumberEndpoints;

export const getUserSetNumbers = async (productIds, token) => {
  try {
    const response = await apiConnector("POST", GET_USER_SET_NUMBERS, 
      { productIds }, 
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error("Could not fetch set numbers");
    }

    return response.data.data;
  } catch (error) {
    console.log("GET_USER_SET_NUMBERS API ERROR:", error);
    toast.error(error.message || "Error fetching set numbers");
    return null;
  }
};
