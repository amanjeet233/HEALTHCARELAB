import React, { useState } from 'react';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { TestParameterForm } from '../../components/admin/TestParameterForm';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

interface TestParameter {
  id?: number;
  name: string;
  unit: string;
  dataType: string;
  isActive?: boolean;
  description?: string;
}

export const TestParametersPage: React.FC = () => {
  const [parameters, setParameters] = useState<TestParameter[]>([
    { id: 1, name: 'Hemoglobin', unit: 'g/dL', dataType: 'NUMERIC', isActive: true },
    { id: 2, name: 'White Blood Cells', unit: 'cells/mcL', dataType: 'NUMERIC', isActive: true },
    { id: 3, name: 'Platelet Count', unit: '10^3/mcL', dataType: 'NUMERIC', isActive: true }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [selectedParam, setSelectedParam] = useState<TestParameter | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<TestParameter | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleEdit = (param: TestParameter) => {
    setSelectedParam(param);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      // TODO: Implement API call
      setParameters(parameters.filter(p => p.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedParam(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    // Reload parameters from API
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Parameters</h1>
          <p className="text-gray-600 mt-2">Manage test parameters and their properties</p>
        </div>
        <button
          onClick={() => {
            setSelectedParam(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Parameter
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <TestParameterForm
              parameterData={selectedParam || undefined}
              onSuccess={handleFormSuccess}
              onClose={handleFormClose}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <ConfirmationModal
          title="Delete Test Parameter"
          message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
          isLoading={deleting}
          destructive
        />
      )}

      {/* Parameters List */}
      {parameters.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No test parameters found</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first parameter
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
          <table className="w-full">
            <thead classList="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Parameter Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Unit</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Data Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {parameters.map(param => (
                <tr key={param.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{param.name}</p>
                    {param.description && (
                      <p className="text-sm text-gray-600">{param.description}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{param.unit}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      {param.dataType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        param.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {param.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(param)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(param)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats */}
      {parameters.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-900">
              <strong>{parameters.filter(p => p.isActive).length}</strong> Active Parameters
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>{parameters.length}</strong> Total Parameters
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
