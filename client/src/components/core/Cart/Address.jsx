import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setStep, setAddressData } from "../../../redux/paymentSlice";
import { getUserSetNumber } from "../../../services/operations/memeber";
import axios from "axios";
import toast from "react-hot-toast";

function Address() {
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);
  const { token } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    billingCity: "",
    billingPincode: "",
    billingState: "",
    billingCountry: "",
    billingAddress: "",
    phone1: "",
    phone2: "",
    utr: "",
    setNumber: "",
  });
  const [isPincodeValid, setIsPincodeValid] = useState(false);
  const [currentSetNumber, setCurrentSetNumber] = useState(0);

  // Define the specific product IDs that require setNumber
  const setNumberProductIds = ['6974e56fb4cd79b66bc76118', '6974e699b4cd79b66bc76130'];
  
  // Check if cart contains any setNumber products
  const hasSetNumberProduct = cart.some(item => 
    setNumberProductIds.includes(item.product._id)
  );

  // Fetch current setNumber when component mounts
  useEffect(() => {
    const fetchCurrentSetNumber = async () => {
      if (hasSetNumberProduct && token) {
        try {
          const userSetNumber = await getUserSetNumber(token);
          setCurrentSetNumber(userSetNumber);
          // Pre-populate with next set number (current + 1)
          setFormData(prev => ({
            ...prev,
            setNumber: (userSetNumber + 1).toString()
          }));
        } catch (error) {
          console.error("Error fetching setNumber:", error);
          setCurrentSetNumber(0);
          setFormData(prev => ({
            ...prev,
            setNumber: "1"
          }));
        }
      }
    };

    fetchCurrentSetNumber();
  }, [hasSetNumberProduct, token]);

  const areAllFieldsFilled = () => {
    const requiredFields = hasSetNumberProduct 
      ? Object.values(formData).every((value) => value.trim() !== "")
      : Object.entries(formData)
          .filter(([key]) => key !== 'setNumber')
          .every(([, value]) => value.trim() !== "");
    return requiredFields;
  };

  useEffect(() => {
    if (formData.billingPincode.length === 6) {
      axios
        .get(`https://api.postalpincode.in/pincode/${formData.billingPincode}`)
        .then((response) => {
          const data = response.data[0];
          if (data.Status === "Success") {
            const locationData = data.PostOffice[0];
            setFormData((prevFormData) => ({
              ...prevFormData,
              billingCity: locationData.Division,
              billingState: locationData.State,
              billingCountry: locationData.Country,
            }));
            setIsPincodeValid(true);
          } else {
            console.log("Invalid Pincode");
            setIsPincodeValid(false);
          }
        })
        .catch((error) => {
          console.error("Error fetching location data:", error);
          setIsPincodeValid(false);
        });
    } else {
      setIsPincodeValid(false);
    }
  }, [formData.billingPincode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!areAllFieldsFilled()) {
      toast.error("All fields are required");
      return;
    }
    dispatch(setAddressData(formData));
    dispatch(setStep(2));
  };

  // Function to reset form data
  const resetForm = () => {
    setFormData({
      billingCity: "",
      billingPincode: "",
      billingState: "",
      billingCountry: "",
      billingAddress: "",
      phone1: "",
      phone2: "",
      utr: "",
      setNumber: "",
    });
    setCurrentSetNumber(0);
  };

  return (
    <div className="flex flex-col w-full lg:mt-0 mt-[23px]">
      <div className="bg-white rounded-lg">
        <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">
          Billing Address
        </h2>
        <div className="lg:w-11/12 mx-auto lg:max-h-[calc(100vh-300px)] max-h-[400px] overflow-y-auto overflow-x-hidden pl-2 p-2 billing">
          <div className="mb-3">
            <label className="block mb-1 text-gray-600">Pincode</label>
            <input
              type="text"
              name="billingPincode"
              placeholder="Pincode"
              value={formData.billingPincode}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 font-semibold placeholder:font-normal"
              required
            />
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-gray-600">Address</label>
            <input
              type="text"
              name="billingAddress"
              value={formData.billingAddress}
              placeholder="e.g. House Number, Colony, Landmark"
              onChange={handleChange}
              className="w-11/12 mx-auto border rounded px-3 py-2 font-semibold placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              required
            />
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-gray-600">City</label>
            <input
              type="text"
              name="billingCity"
              value={formData.billingCity}
              placeholder="Enter City"
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none font-semibold focus:ring-2 focus:ring-blue-500 placeholder-gray-400 placeholder:font-light"
              required
            />
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-gray-600">State</label>
            <input
              type="text"
              name="billingState"
              value={formData.billingState}
              onChange={handleChange}
              placeholder="Enter State"
              className="w-full border rounded px-3 py-2 outline-1 ring-1 focus:outline-none focus:ring-2 font-semibold focus:ring-blue-500 placeholder-gray-400"
              required
            />
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-gray-600">Country</label>
            <input
              type="text"
              name="billingCountry"
              value={formData.billingCountry}
              onChange={handleChange}
              placeholder="Enter Country"
              className="w-full border rounded px-3 py-2 outline-1 ring-1 focus:outline-none focus:ring-2 font-semibold focus:ring-blue-500 placeholder-gray-400"
              required
            />
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-gray-600 pr-10">Phone</label>
            <input
              type="number"
              name="phone1"
              value={formData.phone1}
              onChange={handleChange}
              placeholder="Contact Number"
              className="min-w-[80%] border rounded px-1 text-[12px] py-2 outline-1 ring-1 font-semibold placeholder:font-normal focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block mb-1 text-gray-600 pr-10">
              Second Phone
            </label>
            <input
              type="number"
              name="phone2"
              value={formData.phone2}
              onChange={handleChange}
              placeholder="Contact Number"
              className="min-w-[80%] border rounded px-1 text-[12px] py-2 outline-1 ring-1 font-semibold placeholder:font-normal focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              required
            />
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-gray-600">UTR Number</label>
            <input
              type="text"
              name="utr"
              value={formData.utr}
              onChange={handleChange}
              placeholder="Enter UTR Number"
              className="w-full border rounded px-3 py-2 outline-1 ring-1 focus:outline-none focus:ring-2 font-semibold focus:ring-blue-500 placeholder-gray-400"
              required
            />
          </div>

          {/* Show setNumber input only for specific products */}
          {hasSetNumberProduct && (
            <div className="mb-3">
              <label className="block mb-1 text-gray-600">Set Number</label>
              <input
                type="number"
                name="setNumber"
                value={formData.setNumber}
                onChange={handleChange}
                placeholder="Enter your Set Number"
                className="w-full border rounded px-3 py-2 outline-1 ring-1 focus:outline-none focus:ring-2 font-semibold focus:ring-blue-500 placeholder-gray-400"
                required
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current Set Number: <span className="font-semibold text-blue-600">{currentSetNumber}</span> | 
                Next: <span className="font-semibold text-green-600">{currentSetNumber + 1}</span>
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-center mt-">
        <button
          className="px-3 py-2 text-[15px] bg-gradient-to-r bg-gray-800 text-white rounded-2xl"
          onClick={handleSubmit}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Address;
