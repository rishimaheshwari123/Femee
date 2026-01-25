import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { displayMoney, calculateTotal } from "../helper/utills";
import { BsCartX } from "react-icons/bs";
import { FaShoppingBag } from "react-icons/fa";
import EmptyView from "../components/core/Cart/EmptyView";
import CartItems from "../components/core/Cart/CartItems";
import { setCheckout } from "../redux/paymentSlice";
import { Container, Card, Button, Badge } from "../components/ui";

function CartMain() {
  const { cart, total } = useSelector((state) => state.cart);
  const cartQuantity = cart.length;
  const calculateCartTotal = total;
  const displayCartTotal = displayMoney(calculateCartTotal);
  const deliveryCharge = displayMoney(0);
  const dispatch = useDispatch();
  
  const cartDiscount = cart.map((item) => {
    return (item.product.highPrice - item.product.price) * item.quantity;
  });

  const calculateCartDiscount = calculateTotal(cartDiscount);
  const displayCartDiscount = displayMoney(calculateCartDiscount);
  const displayTotalAmount = displayMoney(total + 0);

  const checkoutHandler = () => {
    dispatch(setCheckout(true));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container>
        {cartQuantity === 0 ? (
          <EmptyView
            icon={<BsCartX />}
            msg="Your Cart is Empty"
            link="/shop"
            btnText="Start Shopping"
          />
        ) : (
          <>
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaShoppingBag className="text-primary-500" />
                Shopping Cart
              </h1>
              <p className="text-gray-600 mt-2">
                {cartQuantity} {cartQuantity > 1 ? "items" : "item"} in your cart
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items - Left Column */}
              <div className="lg:col-span-2">
                <Card padding="none">
                  <div className="divide-y divide-gray-200">
                    {cart.map((item) => (
                      <div key={item._id} className="p-4">
                        <CartItems {...item} />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Order Summary - Right Column */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <div className="space-y-6">
                    {/* Header */}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Order Summary
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {cartQuantity} {cartQuantity > 1 ? "items" : "item"}
                      </p>
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal</span>
                        <span className="font-semibold">{displayCartTotal}</span>
                      </div>

                      {calculateCartDiscount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span className="font-semibold">
                            - {displayCartDiscount}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-gray-700">
                        <span>Delivery Charges</span>
                        <span className="font-semibold text-green-600">
                          {deliveryCharge === "₹0" ? "FREE" : deliveryCharge}
                        </span>
                      </div>

                      <div className="border-t border-gray-300 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-900">
                            Total Amount
                          </span>
                          <span className="text-2xl font-bold text-primary-500">
                            {displayTotalAmount}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Savings Badge */}
                    {calculateCartDiscount > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800 font-medium text-center">
                          🎉 You're saving {displayCartDiscount}!
                        </p>
                      </div>
                    )}

                    {/* Checkout Button */}
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={checkoutHandler}
                      disabled={cartQuantity === 0}
                    >
                      Proceed to Checkout
                    </Button>

                    {/* Continue Shopping */}
                    <Button
                      variant="outline"
                      size="md"
                      fullWidth
                      to="/shop"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}

export default CartMain;
