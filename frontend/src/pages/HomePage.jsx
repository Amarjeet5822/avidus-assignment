import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks, createTask, updateTask, deleteTask } from "../store/features/taskUser/taskUserSlice";
import { MdDelete, MdEdit, MdCheck, MdClose } from "react-icons/md";
import toast from "react-hot-toast";

const HomePage = () => {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state) => state.taskUser);
  const [taskName, setTaskName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editFormName, setEditFormName] = useState("");

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (taskName.trim() === "") return;
    dispatch(createTask({ name: taskName, is_completed: false }))
      .unwrap()
      .then(() => toast.success("Task Created Successfully"))
      .catch((err) => toast.error(err.message || "Failed to create task"));
    setTaskName("");
  };

  const handleToggleStatus = (task) => {
    dispatch(updateTask({ id: task._id, name: task.name, is_completed: !task.is_completed }))
      .unwrap()
      .then(() => toast.success("Task Updated Successfully"))
      .catch((err) => toast.error(err.message || "Failed to update task"));
  };

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
    setEditFormName(task.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (task) => {
    if (editFormName.trim() === "") return;
    dispatch(updateTask({ id: task._id, name: editFormName, is_completed: task.is_completed }))
      .unwrap()
      .then(() => toast.success("Task Updated Successfully"))
      .catch((err) => toast.error(err.message || "Failed to update task"));
    setEditingId(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl mt-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Tasks</h1>
      
      <form onSubmit={handleCreateTask} className="mb-8 flex gap-4">
        <input 
          type="text" 
          placeholder="What needs to be done?"
          className="flex-1 px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
        />
        <button 
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold shadow-md transition"
        >
          Add Task
        </button>
      </form>

      {loading && !tasks?.length && <p className="text-gray-500">Loading tasks...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {tasks && tasks.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <li key={task._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                {editingId === task._id ? (
                  <div className="flex items-center gap-4 flex-1">
                    <input 
                      type="text" 
                      value={editFormName}
                      onChange={(e) => setEditFormName(e.target.value)}
                      className="flex-1 px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                      autoFocus
                    />
                    <button onClick={() => saveEdit(task)} className="text-green-600 hover:text-green-800" title="Save"><MdCheck size={24} /></button>
                    <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700" title="Cancel"><MdClose size={24} /></button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4 flex-1">
                      <input 
                        type="checkbox" 
                        checked={task.is_completed}
                        onChange={() => handleToggleStatus(task)}
                        className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                      />
                      <span className={`text-lg ${task.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {task.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => startEdit(task)}
                        className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition"
                        title="Edit Task"
                      >
                        <MdEdit size={24} />
                      </button>
                      <button 
                        onClick={() => handleDelete(task._id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
                        title="Delete Task"
                      >
                        <MdDelete size={24} />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-8 text-center text-gray-500">No tasks found. Create one above!</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
