import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaUser, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaShieldAlt,
  FaUserShield,
  FaCheckCircle
} from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";
import { memberLoginApi } from "../services/operations/memeber";
import { useDispatch } from "react-redux";
import { Container, Card, Button, Input } from "../components/ui";
import logo from "../assets/logo.png";

function MemberLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 600, once: true });
  }, []);

  const validationSchema = Yup.object({
    userName: Yup.string()
      .min(3, "Must be at least 3 characters")
      .required("Username, email or phone is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const initialValues = {
    userName: "",
    password: "",
  };

  const onSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      await memberLoginApi(values.userName, values.password, navigate, dispatch);
      resetForm();
    } finally {
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues,
    onSubmit,
    validationSchema,
  });

  const features = [
    { icon: <FaShieldAlt />, text: "Secure Login" },
    { icon: <FaUserShield />, text: "Admin Access" },
    { icon: <FaCheckCircle />, text: "Member Portal" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen py-12">
          {/* Left Side - Branding */}
          <div className="hidden lg:flex flex-col justify-center text-white" data-aos="fade-right">
            <div className="space-y-10">
              {/* Logo */}
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 inline-block">
                <img src={logo} alt="Femme Cure" className="h-24 w-auto" />
              </div>

              {/* Heading */}
              <div>
                <h1 className="text-6xl font-display font-bold mb-6 leading-tight">
                  Welcome Back!
                </h1>
                <p className="text-2xl text-white/90 leading-relaxed">
                  Login to access your member dashboard and manage your business
                </p>
              </div>

              {/* Features */}
              <div className="space-y-5">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-5 bg-white/10 backdrop-blur-lg rounded-2xl p-5 hover:bg-white/20 transition-all duration-300"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <div className="text-4xl text-yellow-300">
                      {feature.icon}
                    </div>
                    <span className="text-xl font-semibold">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex items-center justify-center" data-aos="fade-left">
            <Card className="bg-white shadow-2xl w-full max-w-xl" padding="xl">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <img src={logo} alt="Femme Cure" className="h-20 mx-auto mb-4" />
              </div>

              {/* Header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl mb-6 shadow-lg">
                  <FaUserShield className="text-white text-4xl" />
                </div>
                <h2 className="text-4xl font-display font-bold text-dark-900 mb-3">
                  Member Login
                </h2>
                <p className="text-lg text-dark-600">
                  Access your dashboard and manage your business
                </p>
              </div>

              {/* Form */}
              <form onSubmit={formik.handleSubmit} className="space-y-7">
                {/* Username/Email/Phone Field */}
                <div>
                  <Input
                    label="Username, Email or Phone"
                    type="text"
                    id="userName"
                    name="userName"
                    placeholder="Enter username, email or phone number"
                    value={formik.values.userName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.userName && formik.errors.userName}
                    required
                    icon={<FaUser />}
                    iconPosition="left"
                  />
                </div>

                {/* Password Field */}
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && formik.errors.password}
                    required
                    icon={<FaLock />}
                    iconPosition="left"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-[42px] text-dark-400 hover:text-dark-600 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>

                {/* Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-dark-600">Remember me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={formik.isSubmitting}
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? "Logging in..." : "Login to Dashboard"}
                </Button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-dark-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-dark-500">
                      New to Femme Cure?
                    </span>
                  </div>
                </div>

                {/* Register Links */}
                <div className="space-y-3">
                  <Button
                    to="/become-member/meenusahuADMIN"
                    variant="outline"
                    size="md"
                    fullWidth
                  >
                    Become a Member
                  </Button>
                  <Button
                    to="/user-login"
                    variant="ghost"
                    size="md"
                    fullWidth
                  >
                    User Login Instead
                  </Button>
                </div>
              </form>

              {/* Footer Note */}
              <div className="mt-6 text-center">
                <p className="text-xs text-dark-500">
                  By logging in, you agree to our{" "}
                  <Link to="/terms" className="text-primary-600 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary-600 hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberLogin;
