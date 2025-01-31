import { toast } from "react-hot-toast"

import { apiConnector } from "../apiConnector"
import { paymentEndpoints } from "../apis"
import rzpLogo from "../../assets/femee.jpg"
import { resetCart } from "../../redux/cartSlice"
import { setCheckout } from "../../redux/paymentSlice"

const {
  PRODUCT_PAYMENT_API,
  PRODUCT_VERIFY_API,
  SEND_PAYMENT_SUCCESS_EMAIL_API,
  GET_ALL_ORDER
} = paymentEndpoints


// Load the Razorpay SDK from the CDN
function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = src
    script.onload = () => {
      resolve(true)
    }
    script.onerror = () => {
      resolve(false)
    }
    document.body.appendChild(script)
  })
}




// Buy Product

export async function BuyProduct(
  token,
  products,
  coupon,
  address,
  payable,
  navigate,
  dispatch
) {
  const toastId = toast.loading("Loading...")
  try {

    // Initiating the Order in Backend
    const orderResponse = await apiConnector(
      "POST",
      PRODUCT_PAYMENT_API,
      {
        products,
        coupon,
        payable
      },
      {
        Authorization: `Bearer ${token}`,
      }
    )

    if (!orderResponse.data.success) {
      throw new Error(orderResponse.data.message)
    }

    const options = {
      // key: process.env.RAZORPAY_KEY,
      key: "rzp_test_lQz64anllWjB83",

      currency: orderResponse.data.data.currency,
      amount: `${orderResponse.data.data.amount}`,
      order_id: orderResponse.data.data.id,
      name: "NK Enterprises",
      description: "Thank you for Purchasing the Products.",
      image: rzpLogo,
      // prefill: {
      //   name: `${user_details.name} `,
      //   email: user_details.email,
      // },
      handler: function (response) {
        //   sendPaymentSuccessEmail(response, orderResponse.data.data.amount, token)
        verifyPayment({ ...response, products, address, payable }, token, navigate, dispatch)
      },
    }
    const paymentObject = new window.Razorpay(options)

    paymentObject.open()
    paymentObject.on("payment.failed", function (response) {
      toast.error("Oops! Payment Failed.")
      console.log(response.error)
    })
  } catch (error) {
    console.log("PAYMENT API ERROR............", error)
    toast.error("Could Not make Payment.")
  }
  toast.dismiss(toastId)
}


// Verify the Payment
export async function verifyPayment(
  token,
  cart,
  coupon,
  addressData,
  payable,
  user,
  navigate,
  dispatch
) {
  const toastId = toast.loading("Verifying Payment...");

  // Extract product IDs from the cart
  const products = cart.map(item => ({
    product: item.product._id,  // Assuming the product ID is under `product._id`
    quantity: item.quantity,
  }));

  // Log the data you're sending for verification
  console.log({
    products,
    address: addressData,
    payable,
  });

  try {
    const response = await apiConnector(
      "POST",
      PRODUCT_VERIFY_API,
      { products, address: addressData, payable, userId: user._id },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    // Log the response data to ensure it's coming back as expected
    console.log("VERIFY PAYMENT RESPONSE:", response.data);

    // Check for success in the response
    if (!response.data.success) {
      throw new Error(response.data.message || "Payment failed");
    }

    // Success toast and redirect
    toast.success("Payment Successful. Order Placed!");
    navigate("/");

    // Dispatch actions to reset cart and update checkout state
    dispatch(resetCart());
    dispatch(setCheckout(false));

  } catch (error) {
    // Log the error for better debugging
    console.error("PAYMENT VERIFY ERROR:", error.response?.data || error.message || error);

    // Display appropriate error message from the server or fallback to a generic message
    toast.error(
      error.response?.data?.message || error.message || "Could Not Verify Payment."
    );
  } finally {
    // Dismiss the loading toast when done
    toast.dismiss(toastId);
  }
}











export const getAllOrder = () => async (token) => {
  const toastId = toast.loading("Loading...");

  try {
    const response = await apiConnector("GET", GET_ALL_ORDER, null, {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    });
    console.log(response)
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Product");
    }
    const result = response?.data?.orders;
    // Dispatching action to save products
    toast.dismiss(toastId);
    return result;
  } catch (error) {
    console.log("GET_ALL_ORDER_API API ERROR:", error);
    toast.error(error.message);
    toast.dismiss(toastId);
    return [];
  }
};