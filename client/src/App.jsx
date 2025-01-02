import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/comman/Navbar";
import Footer from "./components/comman/Footer";
import OpenRoute from "./components/Admin/auth/OpenRoute";
import BecomeMembers from "./pages/BecomeMembers";
import MemberLogin from "./pages/MemberLogin";
import { useSelector } from "react-redux";
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

const App = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Paths where Navbar and Footer should not be shown
  const hideNavbarAndFooter =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/member");

  return (
    <div>
      {!hideNavbarAndFooter && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
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
            </>
          )}
        </Route>
      </Routes>
      {!hideNavbarAndFooter && <Footer />}
    </div>
  );
};

export default App;
