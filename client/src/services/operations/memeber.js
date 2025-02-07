import { setUser, setToken } from "../../redux/authSlice";
import { apiConnector } from "../apiConnector";
import { auth } from "../apis";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
const { LOGIN_API, DELETE_MEMBER, SIGNUP_API, IMAGE_UPLOAD, GET_ALL_MEMBER, CREATE_GALLERY, UPDATE_MEMBER, UPDATE_TIER, GET_MEMBER, UPDATE_MEMBER_PROFILE, GET_GALLERY, DELETE_GALLERY } = auth;



export async function memberRegistrationApi(formData) {
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
      throw new Error(response.data.message);
    }

    Swal.fire({
      title: `Member Registered Successfully!`,
      text: `Have a nice day!`,
      icon: "success",
    });

    return response?.data?.user;
  } catch (error) {
    console.error("SIGNUP API ERROR:", error?.response?.data?.message || error.message);
    Swal.fire({
      title: `Error`,
      text: error?.response?.data?.message || "Something went wrong. Please try again later.",
      icon: "error",
    });
  }
}

export async function memberLoginApi(userName, password, navigate, dispatch) {
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
      userName,
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
    navigate("/admin/dashboard");
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


export function memberLogout(navigate) {
  return (dispatch) => {
    dispatch(setToken(null))
    dispatch(setUser(null))

    localStorage.removeItem("token")
    localStorage.removeItem("user")
    toast.success("Logged Out")
    navigate("/")

  }
}





export const imageUpload = async (data, token) => {
  let result = [];
  const toastId = Swal.fire({
    title: "Loading...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const formData = new FormData();
    for (let i = 0; i < data.length; i++) {
      formData.append("thumbnail", data[i]);
    }

    const response = await apiConnector("POST", IMAGE_UPLOAD, formData, {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error("Could Not Add Image Details");
    }

    Swal.fire({
      icon: "success",
      title: "Image Details Added Successfully",
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
    });

    result = response?.data?.images;
  } catch (error) {
    console.log("CREATE IMAGE API ERROR............", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message,
    });
  } finally {
    Swal.close(toastId);
  }

  return result;
};



export const getAllMembersApi = async () => {
  let result = [];
  try {
    const response = await apiConnector("GET", GET_ALL_MEMBER);
    if (!response?.data?.success) {
      throw new Error(toast.error(response?.data?.message))
    }
    result = response?.data?.members;
    return result;
  } catch (error) {
    console.log(error)
    return result;
  }
}

export const getMembersProfileApi = async (id) => {

  try {
    const response = await apiConnector("GET", `${GET_MEMBER}/${id}`);
    if (!response?.data?.success) {
      throw new Error(toast.error(response?.data?.message))
    }
    return response?.data?.member;

  } catch (error) {
    console.log(error)
    return false;
  }
}

export const updateVerifyMembersApi = async (id) => {
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
    const response = await apiConnector("PUT", `${UPDATE_MEMBER}/${id}`);
    if (!response?.data?.success) {
      throw new Error(toast.error(response?.data?.message))
    }
    Swal.close();
    return response?.data?.updatedMember;

  } catch (error) {
    Swal.close();
    console.log(error)
    return false;
  }


}

export const updateTierMembersApi = async (id, tier) => {
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
    const response = await apiConnector("PUT", `${UPDATE_TIER}/${id}`, { tier });
    if (!response?.data?.success) {
      throw new Error(toast.error(response?.data?.message))
    }
    Swal.close();
    return response?.data?.updatedtier;

  } catch (error) {
    Swal.close();
    console.log(error)
    return false;
  }


}


export const updateMemberProfileApi = async (id, formData) => {
  // Exclude role from the formData
  const { role, ...updatedData } = formData;

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
    const response = await apiConnector("PUT", `${UPDATE_MEMBER_PROFILE}/${id}`, updatedData);

    if (!response?.data?.success) {
      throw new Error(toast.error(response?.data?.message));
    }

    Swal.close();
    return response?.data?.updatedMember;

  } catch (error) {
    Swal.close();
    console.log(error);
    return false;
  }
};


export const createGallery = async (data, token) => {
  let swalLoadingInstance;

  Swal.fire({
    title: "Loading...",
    allowOutsideClick: false,
    didOpen: () => {
      swalLoadingInstance = Swal.showLoading();
    },
  });

  try {
    const response = await apiConnector("POST", CREATE_GALLERY, data);

    console.log("CREATE gallery API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error("Could Not Add Gallery Details");
    }

    Swal.fire({
      icon: "success",
      title: "Gallery Added Successfully",
    });
  } catch (error) {
    console.log("CREATE Gallery API ERROR............", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error?.response?.data?.message,
    });
  } finally {
    if (swalLoadingInstance) {
      Swal.close();
    }
  }
};


export const getAllGalleryApi = async () => {
  let result = [];
  try {
    const response = await apiConnector("GET", GET_GALLERY);
    if (!response?.data?.success) {
      throw new Error(toast.error(response?.data?.message))
    }
    result = response?.data?.gallerys;
    return result;
  } catch (error) {
    console.log(error)
    return result;
  }
}
export const deleteGalleryApi = async (id) => {

  try {
    const response = await apiConnector("DELETE", `${DELETE_GALLERY}/${id}`);
    if (!response?.data?.success) {
      throw new Error(toast.error(response?.data?.message))
    }

    return response;
  } catch (error) {
    console.log(error)
    return false;
  }
}
export const deleteMemberApi = async (id) => {

  try {
    const response = await apiConnector("DELETE", `${DELETE_MEMBER}/${id}`);
    if (!response?.data?.success) {
      throw new Error(toast.error(response?.data?.message))
    }

    return response;
  } catch (error) {
    console.log(error)
    return false;
  }
}