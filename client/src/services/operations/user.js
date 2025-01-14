import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { ratingEndpoints, user } from "../apis";
import { setUser, setToken } from "../../redux/authSlice";
import Swal from "sweetalert2";

const {
  ADD_RATING_API,
  UPDATE_RATING_API,

  GETALL_RATING_API,
} = ratingEndpoints;
const {
  LOGIN_API,
  SIGNUP_API
} = user;



// Rating Review

export const addRating = async (formData, token) => {
  console.log(formData);
  const toastId = toast.loading("Loading...");
  try {
    // Make the API call
    const response = await apiConnector("POST", ADD_RATING_API, formData, {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    });

    console.log("ADD_RATING_API API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error("Could not ADD_RATING_API details");
    }

    toast.success("Rating Send Successfull");
  } catch (error) {
    toast.error(error?.response?.data?.message);
    console.log(error);
  }

  toast.dismiss(toastId);
};

export const editRating = async (formData, token) => {
  console.log(formData);
  const toastId = toast.loading("Loading...");
  try {
    // Make the API call
    const response = await apiConnector("POST", UPDATE_RATING_API, formData, {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    });

    // console.log("UPDATE_RATING_API API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error("Could not UPDATE_RATING_API details");
    }

    toast.success("Update Rating Successfull");
  } catch (error) {
    toast.error(error?.response?.data?.message);
    console.log(error);
  }

  toast.dismiss(toastId);
};








export const getAllReatingAPI = async () => {
  let result = [];
  try {
    const response = await apiConnector("GET", GETALL_RATING_API);


    if (!response?.data?.success) {
      throw new Error("Could not UPDATE_RATING_API details");
    }
    result = response?.data?.allReviews
    return result;
  } catch (error) {
    console.log(error);
    return false
  }

};



export async function userRegistrationApi(formData, dispatch) {
  Swal.fire({
    title: "Loading",
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const response = await apiConnector("POST", SIGNUP_API, formData);

    if (!response.data.success) {
      throw new Error(response.data.message || "Registration failed");
    }

    dispatch(setToken(response.data.token));
    dispatch(setUser(response.data.user));

    Swal.fire({
      title: "Success",
      text: "Member registered successfully!",
      icon: "success",
    });

    return response.data.user;
  } catch (error) {
    console.error("SIGNUP API ERROR:", error?.response?.data?.message || error.message);
    Swal.fire({
      title: "Error",
      text: error?.response?.data?.message || "An unexpected error occurred.",
      icon: "error",
    });
  }
}


export async function userLoginApi(email, password, navigate, dispatch) {
  Swal.fire({
    title: "Loading",
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const response = await apiConnector("POST", LOGIN_API, {
      email,
      password,
    });
    Swal.close();
    if (!response?.data?.success) {
      await
        Swal.fire({
          title: "Login Failed",
          text: response.data.message,
          icon: "error",
        });
      throw new Error(response.data.message);
    }

    Swal.fire({
      title: `Login Successfully!`,
      text: `Have a nice day!`,
      icon: "success",
    });
    dispatch(setToken(response?.data?.token));
    dispatch(setUser(response.data.user));
    navigate("/");
  } catch (error) {
    console.log("LOGIN API ERROR............", error?.response);
    Swal.fire({
      title: "Login Failed",
      text:
        error.response?.data?.message ||
        "Something went wrong, please try again later",
      icon: "error",
    });
  }
}
