import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Rooms from "../pages/Rooms";
import Booking from "../pages/Booking";
import Dashboard from "../pages/Dashboard";
import Admin from "../pages/Admin";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Reception from "../pages/Reception";
import Housekeeping from "../pages/Housekeeping";
import Restaurant from "../pages/Restaurant";
import Services from "../pages/Services";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/rooms" element={<Rooms />} />
      <Route path="/booking/:id" element={<Booking />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route style={{wordBreak: "break-all"}} path="/reset-password" element={<ResetPassword />} />
      <Route path="/reception" element={<Reception />} />
      <Route path="/housekeeping" element={<Housekeeping />} />
      <Route path="/restaurant" element={<Restaurant />} />
      <Route path="/services" element={<Services />} />
    </Routes>
  );
}

export default AppRoutes;