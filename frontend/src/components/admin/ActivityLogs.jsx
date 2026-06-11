import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchHistoryLogs } from "../../store/features/historyUser/historyUserSlice";

const formatDateStr = (val) => {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hh = String(hours).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${minutes} ${ampm}`;
};

const ActivityLogs = () => {
  const dispatch = useDispatch();
  const { logs, loading } = useSelector((state) => state.historyUser);

  useEffect(() => {
    dispatch(fetchHistoryLogs());
  }, [dispatch]);

  if (loading && !logs?.length) return <p className="text-gray-500">Loading history logs...</p>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Activity Logs</h2>
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[300px]">Changes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs?.map((log) => {
              const renderChanges = () => {
                if (log.tag === 'Created' || log.action === 'CREATE') return <span className="text-gray-400 italic">Entity Created</span>;
                if (log.tag === 'Deleted' || log.action === 'DELETE') return <span className="text-gray-400 italic">Entity Deleted</span>;

                if (log.new_value) {
                  const keys = Object.keys(log.new_value);
                  if (keys.length === 0) return <span className="text-gray-400 italic">No changes recorded</span>;

                  return (
                    <ul className="space-y-1">
                      {keys.map(key => {
                        const isDate = key === 'updatedAt' || key === 'createdAt';
                        const oldValStr = isDate ? formatDateStr(log.old_value?.[key]) : String(log.old_value?.[key] ?? 'none');
                        const newValStr = isDate ? formatDateStr(log.new_value[key]) : String(log.new_value[key]);

                        return (
                          <li key={key} className="text-sm">
                            <span className="font-medium text-gray-700">{key}:</span>{' '}
                            <span className="line-through text-red-400 mr-1">{oldValStr}</span>
                            ➔
                            <span className="text-green-600 ml-1">{newValStr}</span>
                          </li>
                        );
                      })}
                    </ul>
                  );
                }
                return <span className="text-gray-400 italic">N/A</span>;
              };

              return (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateStr(log.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                    {log.entity_type}
                    <div className="text-xs text-gray-400 font-mono mt-1">{log.entity_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${log.tag === 'Created' || log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                        log.tag === 'Updated' || log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'}`}>
                      {log.tag || log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono">
                    {renderChanges()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityLogs;
