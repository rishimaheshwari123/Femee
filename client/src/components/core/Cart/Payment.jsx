import React, { useEffect } from "react";
import { setStep } from "../../../redux/paymentSlice";
import { useDispatch, useSelector } from "react-redux";
import { BuyProduct } from "../../../services/operations/order";
import { useNavigate } from "react-router-dom";

function Payment({ payable, coupon }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addressData } = useSelector((state) => state.payment);
  const { user } = useSelector((state) => state.auth);
  const { token } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);

  const paymentHandle = () => {
    BuyProduct(
      token,
      cart,
      coupon,
      addressData,
      payable,
      user,
      navigate,
      dispatch
    );
  };
  // useEffect(()=>{
  // console.log(addressData)
  // },[])

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex w-full justify-center font-bold text-2xl">
        Payment Methods
      </div>

      <button
        onClick={paymentHandle}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Pay {payable}
      </button>

      <div>
        <button onClick={() => dispatch(setStep(1))}>Back TO Address</button>
      </div>
    </div>
  );
}

export default Payment;
