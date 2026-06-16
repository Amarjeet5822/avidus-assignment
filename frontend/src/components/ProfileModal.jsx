import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { updateUser } from "../store/features/authUser/authUserSlice.js"
const bc_url = import.meta.env.MODE === 'production'
  ? import.meta.env.VITE_DEPLOYED_BE_URL
  : import.meta.env.VITE_BE_URL;

const ProfileModal = ({ isOpen, onClose }) => {
  const { user } = useSelector((state) => state.authUser);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: user?.first_name || "",
    email: user?.email || "",
  });

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [certFile, setCertFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const uploadFile = async (file, category) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    const response = await axios.post(`${bc_url}/files/upload`, formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.fileId;
  };

  const handleDownload = async (fileId) => {
    try {
      const response = await axios.get(`${bc_url}/files/download/${fileId}`, { withCredentials: true });
      window.open(response.data.url, "_blank");
    } catch (error) {
      toast.error("Failed to download file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let profile_image = user.profile_image?._id || user.profile_image;
      let educational_certificate = user.educational_certificate?._id || user.educational_certificate;

      if (profileImageFile) {
        profile_image = await uploadFile(profileImageFile, "PROFILE_IMAGE");
      }
      if (certFile) {
        educational_certificate = await uploadFile(certFile, "EDUCATIONAL_CERTIFICATE");
      }

      await dispatch(
        updateUser({
          id: user._id,
          name: formData.name,
          email: formData.email,
          profile_image,
          educational_certificate,
        })
      ).unwrap();

      toast.success("Profile updated successfully!");
      onClose();
    } catch (error) {
      toast.error("Error updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md text-white shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-gray-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfileImageFile(e.target.files[0])}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
            />
            {user.profile_image && !profileImageFile && (
              <button
                type="button"
                onClick={() => handleDownload(user.profile_image?._id || user.profile_image)}
                className="text-sm text-blue-400 hover:underline mt-1"
              >
                View Current Image
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Educational Certificate (PDF)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setCertFile(e.target.files[0])}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
            />
            {user.educational_certificate && !certFile && (
              <button
                type="button"
                onClick={() => handleDownload(user.educational_certificate?._id || user.educational_certificate)}
                className="text-sm text-blue-400 hover:underline mt-1"
              >
                Download Current Certificate
              </button>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 disabled:opacity-50 flex items-center justify-center min-w-[100px]"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
