import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../store/features/authUser/authUserSlice";
import ProfileModal from "./ProfileModal";

const Navbar = () => {
  const { isLogged, user } = useSelector((state) => state.authUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => {
      navigate("/login");
    });
  };

  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between items-center shadow-md sticky top-0 z-50">
      <div className="text-xl font-bold">
        <Link to="/">Task Manager</Link>
      </div>
      <div className="flex gap-4">
        {isLogged ? (
          <>
            <Link to="/" className="hover:text-gray-300 mt-1">Home</Link>
            {user?.role === "Admin" && (
              <Link to="/admin" className="text-blue-400 hover:text-blue-300 font-semibold mt-1">Admin Dashboard</Link>
            )}
            <button 
              onClick={() => setIsProfileModalOpen(true)} 
              className="text-gray-300 hover:text-white mt-1 transition"
            >
              Profile
            </button>
            <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className={location.pathname === "/login" ? "bg-blue-500 px-3 py-1 rounded hover:bg-blue-600 transition" : "px-3 py-1 hover:text-gray-300 transition"}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className={location.pathname === "/register" ? "bg-blue-500 px-3 py-1 rounded hover:bg-blue-600 transition" : "px-3 py-1 hover:text-gray-300 transition"}
            >
              Register
            </Link>
          </>
        )}
      </div>
      
      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </nav>
  );
};

export default Navbar;
