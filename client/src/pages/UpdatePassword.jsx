import { useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { BiArrowBack } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { setLoading } from "../redux/authSlice";
import axios from "axios";

function UpdatePassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { loading } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { password, confirmPassword } = formData;

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const resetPassword = (password, confirmPassword, token, navigate) => {
    return async (dispatch) => {
      const toastId = toast.loading("Loading...");
      dispatch(setLoading(true));
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/auth/reset-password`,
          {
            password,
            confirmPassword,
            token,
          }
        );

        console.log("RESETPASSWORD RESPONSE............", response);

        if (!response.data.success) {
          throw new Error(response.data.message);
        }

        toast.success("Password Reset Successfully");
        navigate("/login");
      } catch (error) {
        console.log("RESETPASSWORD ERROR............", error);
        toast.error("Failed To Reset Password");
      }
      toast.dismiss(toastId);
      dispatch(setLoading(false));
    };
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    const token = location.pathname.split("/").at(-1);
    dispatch(resetPassword(password, confirmPassword, token, navigate));
  };

  return (
    <div className="grid min-h-[100vh] place-items-center ">
      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="max-w-[500px] p-4 lg:p-8 bg-gray-800 rounded-lg shadow-lg">
          <h1 className="text-[1.875rem] font-semibold leading-[2.375rem] text-white">
            Choose new password
          </h1>
          <p className="my-4 text-[1.125rem] leading-[1.625rem] text-gray-400">
            Almost done. Enter your new password and you're all set.
          </p>
          <form onSubmit={handleOnSubmit} className="flex flex-col gap-y-4">
            <label className="relative">
              <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-white">
                New Password <sup className="text-pink-500">*</sup>
              </p>
              <input
                required
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={handleOnChange}
                placeholder="Enter Password"
                className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-[38px] z-[10] cursor-pointer text-gray-500 hover:text-gray-400"
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible fontSize={24} />
                ) : (
                  <AiOutlineEye fontSize={24} />
                )}
              </span>
            </label>
            <label className="relative mt-3 block">
              <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-white">
                Confirm New Password <sup className="text-pink-500">*</sup>
              </p>
              <input
                required
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleOnChange}
                placeholder="Confirm Password"
                className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
              />
              <span
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-[38px] z-[10] cursor-pointer text-gray-500 hover:text-gray-400"
              >
                {showConfirmPassword ? (
                  <AiOutlineEyeInvisible fontSize={24} />
                ) : (
                  <AiOutlineEye fontSize={24} />
                )}
              </span>
            </label>

            <button
              type="submit"
              className="mt-6 w-full rounded-lg bg-yellow-500 py-3 text-lg font-medium text-gray-900 hover:bg-yellow-600 transition duration-300"
            >
              Reset Password
            </button>
          </form>
          <div className="mt-6 flex items-center justify-between">
            <Link to="/login">
              <p className="flex items-center gap-x-2 text-white hover:underline">
                <BiArrowBack /> Back To Login
              </p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpdatePassword;
