import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../store/features/authUser/authUserSlice";

const Navbar = () => {
  const { isLogged, user } = useSelector((state) => state.authUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
            <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-gray-300 mt-1">Login</Link>
            <Link to="/register" className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600 transition">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
