import React, { useState } from "react";
import { useSelector } from "react-redux";
import { displayMoney } from "../../../helper/utills";
import { FiShoppingCart, FiPackage, FiCreditCard } from "react-icons/fi";
import { FaChevronUp, FaChevronDown, FaCheckCircle, FaTruck } from "react-icons/fa";
import { MdLocalOffer } from "react-icons/md";
import { fetchCoupon } from "../../../services/operations/product";
import Address from "./Address";
import Payment from "./Payment";
import { Link } from "react-router-dom";
import qr from "../../../assets/qr.png";

const CheckoutFormEnhanced = ({ handleClose }) => {
  const { cart, total } = useSelector((state) => state.cart);
  const [isOpen, setIsOpen] = useState(true);
  const [payable, setPayable] = useState(total);
  const [couponName, setCouponName] = useState("");
  const [coupon, setCoupon] = useState(false);
  const [couponValue, setCouponValue] = useState(0);
  const [couponValid, setCouponValid] = useState(true);

  const displayTotalAmount = displayMoney(total);
  const { step } = useSelector((state) => state.payment);

  const toggleSummary = () => {
    setIsOpen(!isOpen);
  };

  const handleCoupon = async () => {
    try {
      const response = await fetchCoupon(couponName);
      if (response.success) {
        setCouponValue(response?.data?.discount);
        setCoupon(true);
        setCouponValid(true);
        setPayable(total - response?.data?.discount);
      } else {
        setCouponValid(false);
      }
    } catch (error) {
      console.log(error);
      setCouponValid(false);
    }
  };

  return (
    <div className="w-full flex flex-wrap-reverse overflow-y-auto lg:min-h-[calc(100vh-150px)] min-h-[calc(100vh-200px)] lg:max-h-[calc(100vh-150px)] max-h-[calc(100vh-130px)] checkout font-sans bg-gray-50">
      {/* Left Section - Forms */}
      <div className="lg:w-[65%] w-screen overflow-y-auto bg-white">
        {/* Progress Steps */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                {step > 1 ? <FaCheckCircle /> : '1'}
              </div>
              <span className="hidden sm:block font-medium">Address</span>
            </div>
            
            <div className="flex-1 h-1 mx-4 bg-gray-200">
              <div className={`h-full ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'} transition-all duration-300`} style={{ width: step >= 2 ? '100%' : '0%' }}></div>
            </div>
            
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                {step > 2 ? <FaCheckCircle /> : '2'}
              </div>
              <span className="hidden sm:block font-medium">Payment</span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {step === 1 && <Address />}
          {step === 2 && <Payment payable={payable} coupon={couponName} />}
        </div>
      </div>

      {/* Right Section - Order Summary */}
      <div className="lg:w-[35%] w-full max-h-[calc(100vh-130px)] overflow-y-auto bg-gray-50 border-l border-gray-200">
        <div className="p-6">
          {/* Order Summary Header */}
          <button
            type="button"
            onClick={toggleSummary}
            className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center mb-4"
          >
            <div className="flex items-center gap-3">
              <FiShoppingCart className="text-2xl text-blue-600" />
              <div className="text-left">
                <h3 className="font-bold text-gray-900">Order Summary</h3>
                <p className="text-sm text-gray-500">{cart.length} items</p>
              </div>
            </div>
            <span className="text-gray-400">
              {isOpen ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </button>

          {/* Cart Items */}
          {isOpen && (
            <div className="bg-white rounded-xl p-4 shadow-sm mb-4 max-h-[300px] overflow-y-auto">
              <div className="space-y-3">
                {cart.map((item, ind) => (
                  <div key={ind} className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-20 h-20 flex-shrink-0">
                      <Link to={`/product/${item.product._id}`} onClick={handleClose}>
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </Link>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-900 truncate">
                        {item.product.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {displayMoney(item.product.price)} × {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-blue-600 mt-1">
                        {displayMoney(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiCreditCard className="text-blue-600" />
              Price Details
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal ({cart.length} items)</span>
                <span className="font-semibold">{displayTotalAmount}</span>
              </div>

              {coupon && (
                <div className="flex justify-between text-green-600 bg-green-50 p-2 rounded-lg">
                  <span className="flex items-center gap-2">
                    <MdLocalOffer />
                    Coupon Discount
                  </span>
                  <span className="font-semibold">- {displayMoney(couponValue)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-700">
                <span className="flex items-center gap-2">
                  <FaTruck />
                  Delivery Charges
                </span>
                <span className="font-semibold text-green-600">FREE</span>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {displayMoney(payable)}
                  </span>
                </div>
              </div>
            </div>

            {/* Savings Badge */}
            {coupon && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800 font-medium text-center flex items-center justify-center gap-2">
                  <FaCheckCircle />
                  You saved {displayMoney(couponValue)}!
                </p>
              </div>
            )}
          </div>

          {/* QR Code Payment */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 shadow-sm mb-4">
            <div className="text-center">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                <FiPackage className="text-blue-600" />
                Scan & Pay
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code to complete payment
              </p>
              <div className="bg-white p-4 rounded-xl inline-block shadow-md">
                <img src={qr} alt="Payment QR Code" className="w-48 h-48 mx-auto" />
              </div>
              <p className="text-lg font-semibold text-gray-700 mt-4">
                Pay ₹{displayMoney(payable).replace('₹', '')}
              </p>
            </div>
          </div>

          {/* Coupon Section */}
          {false && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MdLocalOffer className="text-orange-500" />
                Apply Coupon
              </h3>
              <div className="relative">
                <input
                  type="text"
                  id="coupon"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                  placeholder="Enter coupon code"
                  value={couponName}
                  onChange={(e) => {
                    setCouponName(e.target.value.toUpperCase());
                    setCouponValid(true);
                  }}
                />
                {!couponValid && (
                  <p className="text-red-500 text-xs mt-1">
                    Invalid coupon code
                  </p>
                )}
                <button
                  type="button"
                  className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                  onClick={handleCoupon}
                >
                  Apply Coupon
                </button>
              </div>
            </div>
          )}

          {/* Security Badge */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
              <FaCheckCircle className="text-green-500" />
              Safe and Secure Payments
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFormEnhanced;
