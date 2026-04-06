import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Loader } from 'lucide-react';

const schema = yup.object({
  name: yup.string().required('Parameter name is required'),
  description: yup.string().optional(),
  unit: yup.string().required('Unit is required'),
  referenceValue: yup.number().optional(),
  referenceMin: yup.number().optional(),
  referenceMax: yup.number().optional(),
  dataType: yup.string().required('Data type is required'),
  isActive: yup.boolean().optional()
});

interface TestParameter {
  id?: number;
  name: string;
  description?: string;
  unit: string;
  referenceValue?: number;
  referenceMin?: number;
  referenceMax?: number;
  dataType: string;
  isActive?: boolean;
}

interface TestParameterFormProps {
  parameterData?: TestParameter;
  onSuccess?: () => void;
  onClose?: () => void;
}

export const TestParameterForm: React.FC<TestParameterFormProps> = ({
  parameterData,
  onSuccess,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: parameterData?.name || '',
      description: parameterData?.description || '',
      unit: parameterData?.unit || '',
      referenceValue: parameterData?.referenceValue || 0,
      referenceMin: parameterData?.referenceMin || 0,
      referenceMax: parameterData?.referenceMax || 0,
      dataType: parameterData?.dataType || 'NUMERIC',
      isActive: parameterData?.isActive !== false
    }
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError('');
    try {
      // TODO: Implement API call to save test parameter
      // await testParameterService.saveTestParameter(parameterData?.id, data);
      reset();
      onSuccess?.();
    } catch (err) {
      setError((err as any).message || 'Failed to save test parameter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {parameterData ? 'Edit Test Parameter' : 'Add Test Parameter'}
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Parameter Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parameter Name *
          </label>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <input
                  {...field}
                  type="text"
                  placeholder="e.g., White Blood Cell Count"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
              </>
            )}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                placeholder="Enter parameter description..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          />
        </div>

        {/* Unit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unit *
          </label>
          <Controller
            name="unit"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <input
                  {...field}
                  type="text"
                  placeholder="e.g., cells/mcL"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
              </>
            )}
          />
        </div>

        {/* Data Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Type *
          </label>
          <Controller
            name="dataType"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <select
                  {...field}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="NUMERIC">Numeric</option>
                  <option value="TEXT">Text</option>
                  <option value="BOOLEAN">Boolean</option>
                  <option value="DATE">Date</option>
                </select>
                {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
              </>
            )}
          />
        </div>

        {/* Reference Values */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Reference Range (Optional)</h4>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Min Value
              </label>
              <Controller
                name="referenceMin"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Reference Value
              </label>
              <Controller
                name="referenceValue"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="Reference"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Max Value
              </label>
              <Controller
                name="referenceMax"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Active Status */}
        <div>
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  {...field}
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            )}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            {parameterData ? 'Update' : 'Create'} Parameter
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
