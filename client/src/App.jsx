import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import OpenRoute from "./components/Admin/auth/OpenRoute";
import BecomeMembers from "./pages/BecomeMembers";
import MemberLogin from "./pages/MemberLogin";
import { useDispatch, useSelector } from "react-redux";
import Dashboard from "./components/Admin/pages/Dashboard";
import Layout from "./components/Admin/pages/Layout";
import PrivateRoute from "./components/Admin/auth/PrivateRoute";
import GetAllMembers from "./components/Admin/pages/GetAllMembers";
import MyProfile from "./components/Admin/pages/MyProfile";
import Contact from "./pages/Contact";
import GetAllSubMembers from "./components/Admin/pages/GetAllSubMembers";
import AddGallery from "./components/Admin/pages/AddGallery";
import GetGallery from "./components/Admin/pages/GetGallery";
import Gallery from "./pages/Gallery";
import AddProduct from "./components/Admin/Product/AddProduct";
import AllProduct from "./components/Admin/Product/AllProduct";
import EditProduct from "./components/Admin/Product/EditProduct";
import { getAllProduct } from "./services/operations/product";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import CartMain from "./pages/CartMain";
import CheckoutForm from "./components/core/Cart/CheckoutForm";
import { setCheckout } from "./redux/paymentSlice";
import Orders from "./components/Admin/Product/Orders";
import MyOrder from "./pages/MyOrder";
import OrdersForHierarchy from "./components/Test";
import PopupModal from "./components/comman/PopupModel";
import HappyFuture from "./pages/HappyFuture";
import FounderDetails from "./pages/FounderDetails";
import PlasticFreeIndia from "./pages/PlasticFreeIndia";
import PlasticFreeIndia2 from "./pages/PlasticFreeIndia2";
import About from "./pages/About";
import UpdatePassword from "./pages/UpdatePassword";
import ForgotPassword from "./pages/ForgotPassword";
import UserLogin from "./pages/UserLogin";
import RegisterUser from "./pages/RegisterUser";

// New Layout Components
import MainLayout from "./components/layout/MainLayout";
import Modal from "./components/ui/Modal";

// Pair Reward System Components
import PairDashboard from "./components/Admin/pages/PairDashboard";
import AdminPairRequests from "./components/Admin/pages/AdminPairRequests";
import GetAllMembersWithPairs from "./components/Admin/pages/GetAllMembersWithPairs";

// Enhanced Components
import CheckoutFormEnhanced from "./components/core/Cart/CheckoutFormEnhanced";
import MyOrderEnhanced from "./pages/MyOrderEnhanced";
import OrdersEnhanced from "./components/Admin/Product/OrdersEnhanced";

const App = () => {
  const { user } = useSelector((state) => state.auth);
  const { checkout } = useSelector((state) => state.payment);
  const [isPopupOpen, setIsPopupOpen] = useState(true);
  const dispatch = useDispatch();

  const getAll = async () => {
    await dispatch(getAllProduct());
  };

  useEffect(() => {
    getAll();
  }, []);

  return (
    <div>
      <MainLayout>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/h1" element={<OrdersForHierarchy />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/happy-future" element={<HappyFuture />} />
        <Route path="/founder" element={<FounderDetails />} />
        <Route path="/plastic" element={<PlasticFreeIndia />} />
        <Route path="/natural" element={<PlasticFreeIndia2 />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="product/:productID" element={<ProductDetails />} />

        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <CartMain />
            </PrivateRoute>
          }
        />

        <Route path="/gallery" element={<Gallery />} />
        <Route
          path="/become-member/:userName"
          element={
            <OpenRoute>
              <BecomeMembers />
            </OpenRoute>
          }
        />
        <Route
          path="/login"
          element={
            <OpenRoute>
              <MemberLogin />
            </OpenRoute>
          }
        />
        <Route
          path="/user-login"
          element={
            <OpenRoute>
              <UserLogin />
            </OpenRoute>
          }
        />
        <Route
          path="/register-user"
          element={
            <OpenRoute>
              <RegisterUser />
            </OpenRoute>
          }
        />
        <Route
          path="forgot-password"
          element={
            <OpenRoute>
              <ForgotPassword />
            </OpenRoute>
          }
        />
        <Route
          path="update-password/:id"
          element={
            <OpenRoute>
              <UpdatePassword />
            </OpenRoute>
          }
        />

        <Route
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          {user?.role === "admin" && (
            <>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/getAll-members" element={<GetAllMembers />} />
              <Route path="/admin/profile" element={<MyProfile />} />
              <Route path="/admin/add-gallery" element={<AddGallery />} />
              <Route path="/admin/get-gallery" element={<GetGallery />} />

              <Route
                path="admin/add-product"
                element={
                  <PrivateRoute>
                    <AddProduct />
                  </PrivateRoute>
                }
              />

              <Route
                path="admin/orders"
                element={
                  <PrivateRoute>
                    <OrdersEnhanced />
                  </PrivateRoute>
                }
              />

              <Route
                path="admin/get-product"
                element={
                  <PrivateRoute>
                    <AllProduct />
                  </PrivateRoute>
                }
              />

              <Route
                path="admin/edit-product/:productId"
                element={
                  <PrivateRoute>
                    <EditProduct />
                  </PrivateRoute>
                }
              />

              {/* Pair Reward System - Admin */}
              <Route
                path="admin/pair-requests"
                element={
                  <PrivateRoute>
                    <AdminPairRequests />
                  </PrivateRoute>
                }
              />
            </>
          )}
          {user?.role === "member" && (
            <>
              <Route path="/member/dashboard" element={<Dashboard />} />
              <Route path="/member/profile" element={<MyProfile />} />
              <Route
                path="/member/getAll-members"
                element={<GetAllSubMembers />}
              />
              <Route path="/member/my-orders" element={<MyOrderEnhanced />} />

              {/* Pair Reward System - Member */}
              <Route
                path="/member/pair-rewards"
                element={
                  <PrivateRoute>
                    <PairDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/member/all-members-pairs"
                element={
                  <PrivateRoute>
                    <GetAllMembersWithPairs />
                  </PrivateRoute>
                }
              />
            </>
          )}
        </Route>
        </Routes>
      </MainLayout>

      {/* Checkout Modal */}
      {checkout && (
        <PrivateRoute>
          <Modal
            isOpen={checkout}
            onClose={() => dispatch(setCheckout(false))}
            title="Checkout"
            size="lg"
          >
            <CheckoutFormEnhanced handleClose={() => dispatch(setCheckout(false))} />
          </Modal>
        </PrivateRoute>
      )}

      {/* Popup Modal */}
      <PopupModal
        isOpen={isPopupOpen}
        setIsOpen={setIsPopupOpen}
        handleClose={() => setIsPopupOpen(false)}
      />
    </div>
  );
};

export default App;
