import { useState } from "react";
import toast from "react-hot-toast";
import { BiArrowBack } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { setLoading } from "../redux/authSlice";
import axios from "axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const getPasswordResetToken = (email, setEmailSent) => {
    return async (dispatch) => {
      const toastId = toast.loading("Loading...");
      dispatch(setLoading(true));
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/auth/reset-password-token`,
          {
            email,
          }
        );

        console.log("RESETPASSTOKEN RESPONSE............", response);

        if (!response.data.success) {
          throw new Error(response.data.message);
        }

        toast.success("Reset Email Sent");
        setEmailSent(true);
      } catch (error) {
        console.log("RESETPASSTOKEN ERROR............", error);
        toast.error("Failed To Send Reset Email");
      }
      toast.dismiss(toastId);
      dispatch(setLoading(false));
    };
  };
  const handleOnSubmit = (e) => {
    e.preventDefault();
    dispatch(getPasswordResetToken(email, setEmailSent));
  };

  return (
    <div className="grid min-h-[100vh] place-items-center">
      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="max-w-[500px] p-4 lg:p-8 bg-gray-800 rounded-lg shadow-lg">
          <h1 className="text-[1.875rem] font-semibold leading-[2.375rem] text-white">
            {!emailSent ? "Reset your password" : "Check email"}
          </h1>
          <p className="my-4 text-[1.125rem] leading-[1.625rem] text-gray-400">
            {!emailSent
              ? "Have no fear. We'll email you instructions to reset your password. If you don't have access to your email, we can try account recovery."
              : `We have sent the reset email to ${email}`}
          </p>
          <form onSubmit={handleOnSubmit} className="flex flex-col gap-y-4">
            {!emailSent && (
              <label className="w-full">
                <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-white">
                  Email Address <sup className="text-pink-500">*</sup>
                </p>
                <input
                  required
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            )}
            <button
              type="submit"
              className="mt-6 w-full rounded-lg bg-yellow-500 py-3 text-lg font-medium text-gray-900 hover:bg-yellow-600 transition duration-300"
            >
              {!emailSent ? "Submit" : "Resend Email"}
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

export default ForgotPassword;
