import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, deleteUser, updateUser } from "../../store/features/authUser/authUserSlice";
import { MdDelete, MdEdit, MdCheck, MdClose } from "react-icons/md";
import toast from "react-hot-toast";

const UserManagement = () => {
  const dispatch = useDispatch();
  const { usersList, loading } = useSelector((state) => state.authUser);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "", password: "", is_active: true });

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      dispatch(deleteUser(id))
        .unwrap()
        .then(() => toast.success("User Deleted Successfully"))
        .catch((err) => toast.error(err.message || "Failed to delete user"));
    }
  };

  const startEdit = (user) => {
    setEditingId(user._id);
    setEditForm({ 
      name: user.first_name || "", 
      email: user.email, 
      role: user.role,
      password: "",
      is_active: user.is_active !== undefined ? user.is_active : true
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id) => {
    const payload = {
      id,
      name: editForm.name,
      email: editForm.email,
      role: editForm.role,
      is_active: editForm.is_active,
    };
    if (editForm.password.trim() !== "") {
      payload.password = editForm.password;
    }
    dispatch(updateUser(payload))
      .unwrap()
      .then(() => toast.success("User Updated Successfully"))
      .catch((err) => toast.error(err.message || "Failed to update user"));
    setEditingId(null);
  };

  if (loading && !usersList?.length) return <p className="text-gray-500">Loading users...</p>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">User Management</h2>
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Password</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usersList?.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                {editingId === user._id ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="text" 
                        value={editForm.name} 
                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="email" 
                        value={editForm.email} 
                        onChange={e => setEditForm({...editForm, email: e.target.value})}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select 
                        value={editForm.role} 
                        onChange={e => setEditForm({...editForm, role: e.target.value})}
                        className="border rounded px-2 py-1 w-full"
                      >
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select 
                        value={editForm.is_active} 
                        onChange={e => setEditForm({...editForm, is_active: e.target.value === 'true'})}
                        className="border rounded px-2 py-1 w-full"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="password" 
                        placeholder="(Leave blank if unchanged)"
                        value={editForm.password} 
                        onChange={e => setEditForm({...editForm, password: e.target.value})}
                        className="border rounded px-2 py-1 w-full text-xs"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                      <button onClick={() => saveEdit(user._id)} className="text-green-600 hover:text-green-800" title="Save"><MdCheck size={20} /></button>
                      <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700" title="Cancel"><MdClose size={20} /></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.first_name || '-'} {user.last_name || ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active !== false ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                        {user.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 italic">Hidden</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-3">
                      <button 
                        onClick={() => startEdit(user)}
                        className="text-blue-500 hover:text-blue-700 transition"
                        title="Edit User"
                      >
                        <MdEdit size={20} />
                      </button>
                      {user.role !== 'Admin' && (
                        <button 
                          onClick={() => handleDelete(user._id)}
                          className="text-red-500 hover:text-red-700 transition"
                          title="Delete User"
                        >
                          <MdDelete size={20} />
                        </button>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
