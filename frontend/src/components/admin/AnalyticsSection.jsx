import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../store/features/authUser/authUserSlice";
import { fetchTasks } from "../../store/features/taskUser/taskUserSlice";

const AnalyticsSection = () => {
  const dispatch = useDispatch();
  const { usersList, loading: usersLoading } = useSelector((state) => state.authUser);
  const { tasks, loading: tasksLoading } = useSelector((state) => state.taskUser);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchTasks());
  }, [dispatch]);

  const totalUsers = usersList?.length || 0;
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => t.is_completed).length || 0;
  const pendingTasks = totalTasks - completedTasks;

  if (usersLoading || tasksLoading) {
    return <p className="text-gray-500">Loading analytics...</p>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Analytics Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 flex flex-col justify-center items-center">
          <h3 className="text-gray-500 text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-4xl font-bold text-gray-800">{totalUsers}</p>
        </div>

        {/* Total Tasks */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500 flex flex-col justify-center items-center">
          <h3 className="text-gray-500 text-lg font-semibold mb-2">Total Tasks</h3>
          <p className="text-4xl font-bold text-gray-800">{totalTasks}</p>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 flex flex-col justify-center items-center">
          <h3 className="text-gray-500 text-lg font-semibold mb-2">Completed Tasks</h3>
          <p className="text-4xl font-bold text-gray-800">{completedTasks}</p>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500 flex flex-col justify-center items-center">
          <h3 className="text-gray-500 text-lg font-semibold mb-2">Pending Tasks</h3>
          <p className="text-4xl font-bold text-gray-800">{pendingTasks}</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;
