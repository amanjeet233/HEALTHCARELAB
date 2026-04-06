import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaUser, FaCalendarAlt, FaVenusMars, FaPhone, FaEnvelope } from 'react-icons/fa';
import type { FamilyMemberRequest } from '../../services/familyMemberService';
import LoadingSpinner from '../common/LoadingSpinner';

const validationSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  relation: yup.string().required('Relation is required'),
  dateOfBirth: yup.string().required('Date of birth is required'),
  gender: yup.string().oneOf(['MALE', 'FEMALE', 'OTHER']).required('Gender is required'),
  phoneNumber: yup.string().matches(/^[0-9+\-\s]*$/, 'Invalid phone number').optional(),
  email: yup.string().email('Invalid email').optional(),
  medicalHistory: yup.string().optional()
});

interface FamilyMemberFormProps {
  onSubmit: (data: FamilyMemberRequest) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

const FamilyMemberForm: React.FC<FamilyMemberFormProps> = ({
  onSubmit,
  isSubmitting = false,
  onCancel
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FamilyMemberRequest>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      gender: 'MALE'
    }
  });

  const relations = ['Spouse', 'Parent', 'Child', 'Sibling', 'Grandparent', 'Grandchild', 'Other'];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Add Family Member</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="space-y-2">
          <label className="block text-sm font-600 text-gray-700">Full Name *</label>
          <div className="relative">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0D7C7C]" />
            <input
              type="text"
              placeholder="Enter name"
              className={`w-full pl-12 pr-4 py-2.5 border-2 rounded-lg focus:outline-none transition-all ${
                errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#0D7C7C] focus:ring-2 focus:ring-[#0D7C7C]/10'
              }`}
              {...register('name')}
            />
          </div>
          {errors.name && <p className="text-xs text-red-600 font-600">{errors.name.message}</p>}
        </div>

        {/* Relation */}
        <div className="space-y-2">
          <label className="block text-sm font-600 text-gray-700">Relation *</label>
          <select
            className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none transition-all ${
              errors.relation ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#0D7C7C] focus:ring-2 focus:ring-[#0D7C7C]/10'
            }`}
            {...register('relation')}
          >
            <option value="">Select relation</option>
            {relations.map(rel => (
              <option key={rel} value={rel}>{rel}</option>
            ))}
          </select>
          {errors.relation && <p className="text-xs text-red-600 font-600">{errors.relation.message}</p>}
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <label className="block text-sm font-600 text-gray-700">Date of Birth *</label>
          <div className="relative">
            <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0D7C7C]" />
            <input
              type="date"
              className={`w-full pl-12 pr-4 py-2.5 border-2 rounded-lg focus:outline-none transition-all ${
                errors.dateOfBirth ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#0D7C7C] focus:ring-2 focus:ring-[#0D7C7C]/10'
              }`}
              {...register('dateOfBirth')}
            />
          </div>
          {errors.dateOfBirth && <p className="text-xs text-red-600 font-600">{errors.dateOfBirth.message}</p>}
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label className="block text-sm font-600 text-gray-700">Gender *</label>
          <div className="relative">
            <FaVenusMars className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0D7C7C]" />
            <select
              className={`w-full pl-12 pr-4 py-2.5 border-2 rounded-lg focus:outline-none transition-all ${
                errors.gender ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#0D7C7C] focus:ring-2 focus:ring-[#0D7C7C]/10'
              }`}
              {...register('gender')}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          {errors.gender && <p className="text-xs text-red-600 font-600">{errors.gender.message}</p>}
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <label className="block text-sm font-600 text-gray-700">Phone Number (Optional)</label>
          <div className="relative">
            <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0D7C7C]" />
            <input
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              className={`w-full pl-12 pr-4 py-2.5 border-2 rounded-lg focus:outline-none transition-all ${
                errors.phoneNumber ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#0D7C7C] focus:ring-2 focus:ring-[#0D7C7C]/10'
              }`}
              {...register('phoneNumber')}
            />
          </div>
          {errors.phoneNumber && <p className="text-xs text-red-600 font-600">{errors.phoneNumber.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-600 text-gray-700">Email (Optional)</label>
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0D7C7C]" />
            <input
              type="email"
              placeholder="email@example.com"
              className={`w-full pl-12 pr-4 py-2.5 border-2 rounded-lg focus:outline-none transition-all ${
                errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#0D7C7C] focus:ring-2 focus:ring-[#0D7C7C]/10'
              }`}
              {...register('email')}
            />
          </div>
          {errors.email && <p className="text-xs text-red-600 font-600">{errors.email.message}</p>}
        </div>
      </div>

      {/* Medical History */}
      <div className="space-y-2">
        <label className="block text-sm font-600 text-gray-700">Medical History (Optional)</label>
        <textarea
          placeholder="Any relevant medical history or conditions..."
          rows={4}
          className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none transition-all resize-none ${
            errors.medicalHistory ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#0D7C7C] focus:ring-2 focus:ring-[#0D7C7C]/10'
          }`}
          {...register('medicalHistory')}
        />
        {errors.medicalHistory && <p className="text-xs text-red-600 font-600">{errors.medicalHistory.message}</p>}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#0D7C7C] to-[#004B87] text-white font-600 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" />
              Adding...
            </>
          ) : (
            'Add Family Member'
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-600 rounded-lg hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default FamilyMemberForm;
