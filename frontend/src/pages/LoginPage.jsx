import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, resetState } from "../store/features/authUser/authUserSlice";
import toast from 'react-hot-toast';
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

const loginSchema = z.object({
  email: z.email("Invalid Email!"),
  password: z.string().min(1, "Password is required")
})
const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const { loading, error, success } = useSelector((state) => state.authUser);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    if (success) {
      toast.success(success?.message || "Login Successfully")
      dispatch(resetState());
      navigate("/");
    }

    if (error) {
      toast.error(error?.message || "Failed to Login")
      dispatch(resetState());
    }
  }, [success, navigate, dispatch]);

  const onSubmit = (data) => {
    dispatch(loginUser({
      email: data.email,
      password: data.password
    }));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              {...register("email")}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-gray-50"
            />
            {errors.email && <p className="text-red-500 text-[12px]">{errors.email.message}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-gray-50"
              {...register("password")}
            />
            {errors.password && <p className="text-red-500 text-[12px]">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
