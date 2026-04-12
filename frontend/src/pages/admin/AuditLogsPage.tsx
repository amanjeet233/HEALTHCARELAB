import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaFilter } from 'react-icons/fa';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { notify } from '../../utils/toast';
import api from '../../services/api';

interface AuditLog {
  id: number;
  userId: number;
  userName: string;
  action: string;
  resource: string;
  resourceId: number;
  description: string;
  timestamp: string;
  ipAddress?: string;
  status: 'SUCCESS' | 'FAILURE';
}

const AuditLogsPage: React.FC = () => {
  const navigate = useNavigate();

  // Data States
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);

  // Filter States
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedResource, setSelectedResource] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 20;

  // Load audit logs on mount
  useEffect(() => {
    loadAuditLogs();
  }, []);

  // Filter logs when filters change
  useEffect(() => {
    applyFilters();
  }, [selectedAction, selectedResource, selectedStatus, dateFrom, dateTo, auditLogs]);

  const loadAuditLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get('/api/audit-logs?limit=1000');
      const logs = (response.data?.data || response.data || []) as AuditLog[];

      // Sort by timestamp descending
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setAuditLogs(logs);

      notify.success('Audit logs loaded successfully');
    } catch (err: any) {
      console.error('Error loading audit logs:', err);
      const errorMsg = err.message || 'Failed to load audit logs';
      setError(errorMsg);
      notify.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = auditLogs;

    // Filter by action
    if (selectedAction) {
      filtered = filtered.filter(log => log.action === selectedAction);
    }

    // Filter by resource
    if (selectedResource) {
      filtered = filtered.filter(log => log.resource === selectedResource);
    }

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter(log => log.status === selectedStatus);
    }

    // Filter by date range
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(log => new Date(log.timestamp) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => new Date(log.timestamp) <= toDate);
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create') || actionLower.includes('add')) return '➕';
    if (actionLower.includes('update') || actionLower.includes('edit')) return '✏️';
    if (actionLower.includes('delete') || actionLower.includes('remove')) return '🗑️';
    if (actionLower.includes('read') || actionLower.includes('view')) return '👁️';
    return '📋';
  };

  const getStatusColor = (status: string) => {
    return status === 'SUCCESS'
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700';
  };

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const allActions = [...new Set(auditLogs.map(log => log.action))].sort();
  const allResources = [...new Set(auditLogs.map(log => log.resource))].sort();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-[#0D7C7C] font-600 hover:text-[#004B87] transition-colors mb-6"
        >
          <FaArrowLeft /> Back to Admin Dashboard
        </button>
        <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">
          Audit Logs
        </h1>
        <p className="text-gray-600 mt-2">System activity and user action logs</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <p className="font-600">{error}</p>
        </div>
      )}

      {/* Filter Section */}
      <div className="mb-8 bg-white border-2 border-gray-200 rounded-lg p-6">
        <h3 className="font-black text-gray-900 uppercase tracking-tight mb-6 flex items-center gap-2">
          <FaFilter /> Filters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Action Filter */}
          <div>
            <label className="block text-xs font-600 text-gray-700 mb-2 uppercase">Action</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#0D7C7C] focus:outline-none transition-colors text-sm"
            >
              <option value="">All Actions</option>
              {allActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>

          {/* Resource Filter */}
          <div>
            <label className="block text-xs font-600 text-gray-700 mb-2 uppercase">Resource</label>
            <select
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#0D7C7C] focus:outline-none transition-colors text-sm"
            >
              <option value="">All Resources</option>
              {allResources.map(resource => (
                <option key={resource} value={resource}>{resource}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-600 text-gray-700 mb-2 uppercase">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#0D7C7C] focus:outline-none transition-colors text-sm"
            >
              <option value="">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILURE">Failure</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-xs font-600 text-gray-700 mb-2 uppercase">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#0D7C7C] focus:outline-none transition-colors text-sm"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs font-600 text-gray-700 mb-2 uppercase">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#0D7C7C] focus:outline-none transition-colors text-sm"
            />
          </div>
        </div>

        {/* Clear Filters */}
        <div className="mt-4">
          <button
            onClick={() => {
              setSelectedAction('');
              setSelectedResource('');
              setSelectedStatus('');
              setDateFrom('');
              setDateTo('');
            }}
            className="text-sm text-[#0D7C7C] hover:text-[#004B87] font-600 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 text-sm text-gray-600">
        Showing <span className="font-bold text-gray-900">{paginatedLogs.length}</span> of <span className="font-bold text-gray-900">{filteredLogs.length}</span> audit log{filteredLogs.length !== 1 ? 's' : ''}
      </div>

      {/* Logs Table */}
      {filteredLogs.length > 0 ? (
        <>
          <div className="overflow-x-auto border-2 border-gray-200 rounded-lg mb-8">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-black text-gray-900 uppercase">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-black text-gray-900 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-black text-gray-900 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-black text-gray-900 uppercase">Resource</th>
                  <th className="px-4 py-3 text-left text-xs font-black text-gray-900 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-black text-gray-900 uppercase">Description</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-600">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-gray-700 font-600">{log.userName}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className="flex items-center gap-2">
                        <span>{getActionIcon(log.action)}</span>
                        <span className="font-600">{log.action}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">{log.resource}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`px-2 py-1 rounded-full font-600 ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-600 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-600 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600">No audit logs found</p>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
