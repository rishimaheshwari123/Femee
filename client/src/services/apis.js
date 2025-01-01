
// const BASE_URL = process.env.REACT_APP_BASE_URL;
const BASE_URL = "http://localhost:8080/api/v1";


export const auth = {
  LOGIN_API: BASE_URL + "/auth/login",
  SIGNUP_API: BASE_URL + "/auth/register",
  IMAGE_UPLOAD: BASE_URL + "/image/multi",
  GET_ALL_MEMBER: BASE_URL + "/auth/getAll",
  GET_MEMBER: BASE_URL + "/auth/get",
  UPDATE_MEMBER: BASE_URL + "/auth/verify",
  UPDATE_TIER: BASE_URL + "/auth/update",
  UPDATE_MEMBER_PROFILE: BASE_URL + "/auth/update-profile",
}
