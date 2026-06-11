import React, { useState } from "react";
import AnalyticsSection from "../components/admin/AnalyticsSection";
import UserManagement from "../components/admin/UserManagement";
import TaskMonitoring from "../components/admin/TaskMonitoring";
import ActivityLogs from "../components/admin/ActivityLogs";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("analytics");

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col shadow-lg">
        <div className="p-6 text-2xl font-bold border-b border-gray-700">
          Admin Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            className={`w-full text-left px-4 py-3 rounded transition ${activeTab === 'analytics' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Analytics
          </button>
          <button 
            className={`w-full text-left px-4 py-3 rounded transition ${activeTab === 'users' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            onClick={() => setActiveTab('users')}
          >
            👥 User Management
          </button>
          <button 
            className={`w-full text-left px-4 py-3 rounded transition ${activeTab === 'tasks' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            onClick={() => setActiveTab('tasks')}
          >
            📋 Task Monitoring
          </button>
          <button 
            className={`w-full text-left px-4 py-3 rounded transition ${activeTab === 'logs' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            onClick={() => setActiveTab('logs')}
          >
            📜 Activity Logs
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {activeTab === 'analytics' && <AnalyticsSection />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'tasks' && <TaskMonitoring />}
        {activeTab === 'logs' && <ActivityLogs />}
      </main>
    </div>
  );
};

export default AdminDashboard;
