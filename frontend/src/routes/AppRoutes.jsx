import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Rooms from "../pages/Rooms";
import Booking from "../pages/Booking";
import Dashboard from "../pages/Dashboard";
import Admin from "../pages/Admin";

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
    </Routes>
  );
}

export default AppRoutes;