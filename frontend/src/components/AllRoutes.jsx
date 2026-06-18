import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import AdminDashboard from "../pages/AdminDashboard";
import DrivePage from "../pages/DrivePage";

function AllRoutes() {
  const { isLogged, user } = useSelector((state) => state.authUser);

  return (
    <Routes>
      <Route path="/" element={isLogged ? <HomePage /> : <Navigate to="/login" />} />
      <Route path="/login" element={!isLogged ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!isLogged ? <RegisterPage /> : <Navigate to="/" />} />
      
      {/* Drive routes */}
      <Route path="/drive" element={isLogged ? <DrivePage /> : <Navigate to="/login" />} />
      <Route path="/drive/:folderId" element={isLogged ? <DrivePage /> : <Navigate to="/login" />} />

      {/* Admin routes protected by role */}
      <Route 
        path="/admin/*" 
        element={isLogged && user?.role === "Admin" ? <AdminDashboard /> : <Navigate to="/" />} 
      />
    </Routes>
  );
}

export default AllRoutes;
