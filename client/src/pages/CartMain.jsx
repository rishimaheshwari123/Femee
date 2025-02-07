import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { displayMoney, calculateTotal } from "../helper/utills";
import { BsCartX } from "react-icons/bs";
import EmptyView from "../components/core/Cart/EmptyView";
import CartItems from "../components/core/Cart/CartItems";
import { setCheckout } from "../redux/paymentSlice";

function CartMain() {
  const { cart, total } = useSelector((state) => state.cart);
  const cartQuantity = cart.length;
  const calculateCartTotal = total;
  const displayCartTotal = displayMoney(calculateCartTotal);
  const delveryCharge = displayMoney(0);
  const dispatch = useDispatch();
  const cartDiscount = cart.map((item) => {
    return (item.product.price - item.product.highPrice) * item.quantity;
  });

  const calculateCartDiscount = calculateTotal(cartDiscount);
  const displayCartDiscount = displayMoney(calculateCartDiscount);

  // final total amount

  const displayTotalAmount = displayMoney(total + 0);

  const checkoutHandel = () => {
    dispatch(setCheckout(true));
  };

  return (
    <>
      <section id="cart" className="section mt-[140px] w-11/12 mx-auto">
        <div className="container flex  ">
          {cartQuantity === 0 ? (
            <EmptyView
              icon={<BsCartX />}
              msg="Your Cart is Empty"
              link="/shop"
              btnText="Start Shopping"
            />
          ) : (
            <div className="  flex w-full gap-3 justify-between flex-wrap">
              <div className=" lg:w-[70%] md:w-[70%] w-full  bg-bg-color-2 max-h-[400px]  py-4 overflow-x-hidden overflow-y-auto scrollbar-w-[0.35vw]  ">
                {cart.map((item) => (
                  <CartItems key={item._id} {...item} />
                ))}
              </div>

              <div className=" lg:w-[24%] md:w-[24%] w-full ">
                <div className=" flex flex-col gap-10">
                  <h3 className=" font-bold font-montserrat text-xl">
                    Order Summary &nbsp; ( {cartQuantity}{" "}
                    {cartQuantity > 1 ? "items" : "item"} )
                  </h3>
                  <div className=" flex flex-col gap-3 font-montserrat text-lg">
                    <div className="price flex justify-between">
                      <span className=" font-bold"> Price</span>
                      <b>{displayCartTotal}</b>
                    </div>
                    <div className=" flex justify-between ">
                      <span className=" font-bold">Discount</span>
                      <b className="text-green-700"> {displayCartDiscount}</b>
                    </div>
                    <div className=" flex justify-between">
                      <span className=" font-bold">Delivery</span>
                      <b>{delveryCharge}</b>
                    </div>
                    <div className="my-6 border-t border-gray-600"></div>
                    <div className="total_price flex justify-between">
                      <b>
                        <small>Total Price</small>
                      </b>
                      <b>{displayTotalAmount}</b>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`w-11/12 bg-gray-900 hover:bg-gray-950 text-white p-2 mt-3 rounded-xl mx-auto font-bold ${
                      cartQuantity === 0
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-105"
                    }`}
                    onClick={checkoutHandel}
                    disabled={cartQuantity === 0}
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <br />
        <br />
        <br />
      </section>
    </>
  );
}

export default CartMain;
