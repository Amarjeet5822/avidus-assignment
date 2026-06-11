import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks, deleteTask, updateTask } from "../../store/features/taskUser/taskUserSlice";
import { MdDelete, MdEdit, MdCheck, MdClose } from "react-icons/md";
import toast from "react-hot-toast";

const TaskMonitoring = () => {
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((state) => state.taskUser);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", is_completed: false });

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      dispatch(deleteTask(id))
        .unwrap()
        .then(() => toast.success("Task Deleted Successfully"))
        .catch((err) => toast.error(err.message || "Failed to delete task"));
    }
  };

  const startEdit = (task) => {
    setEditingId(task._id);
    setEditForm({ name: task.name, is_completed: task.is_completed });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id) => {
    dispatch(updateTask({ id, name: editForm.name, is_completed: editForm.is_completed }))
      .unwrap()
      .then(() => toast.success("Task Updated Successfully"))
      .catch((err) => toast.error(err.message || "Failed to update task"));
    setEditingId(null);
  };

  if (loading && !tasks?.length) return <p className="text-gray-500">Loading tasks...</p>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Task Monitoring</h2>
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks?.map((task) => (
              <tr key={task._id} className="hover:bg-gray-50">
                {editingId === task._id ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="text" 
                        value={editForm.name} 
                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {task.user_id?.first_name 
                        ? `${task.user_id.first_name} ${task.user_id.last_name || ''}`.trim() 
                        : task.user_id?.email || task.user_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select 
                        value={editForm.is_completed} 
                        onChange={e => setEditForm({...editForm, is_completed: e.target.value === 'true'})}
                        className="border rounded px-2 py-1"
                      >
                        <option value="false">Pending</option>
                        <option value="true">Completed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                      <button onClick={() => saveEdit(task._id)} className="text-green-600 hover:text-green-800" title="Save"><MdCheck size={20} /></button>
                      <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700" title="Cancel"><MdClose size={20} /></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {task.user_id?.first_name 
                        ? `${task.user_id.first_name} ${task.user_id.last_name || ''}`.trim() 
                        : task.user_id?.email || task.user_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${task.is_completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {task.is_completed ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-3">
                      <button 
                        onClick={() => startEdit(task)}
                        className="text-blue-500 hover:text-blue-700 transition"
                        title="Edit Task"
                      >
                        <MdEdit size={20} />
                      </button>
                      <button 
                        onClick={() => handleDelete(task._id)}
                        className="text-red-500 hover:text-red-700 transition"
                        title="Delete Task"
                      >
                        <MdDelete size={20} />
                      </button>
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

export default TaskMonitoring;
