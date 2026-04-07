import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { familyMemberService, type FamilyMemberRequest, type FamilyMemberResponse } from '../services/familyMemberService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { GenericPageSkeleton } from '../components/ui/PageSkeleton';
import FamilyMemberCard from '../components/family/FamilyMemberCard';
import FamilyMemberForm from '../components/family/FamilyMemberForm';
import { notify } from '../utils/toast';

const FamilyMembersPage: React.FC = () => {
  const [members, setMembers] = useState<FamilyMemberResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isShowingForm, setIsShowingForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const data = await familyMemberService.getFamilyMembers();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching family members:', error);
      notify.error('Failed to load family members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (data: FamilyMemberRequest) => {
    try {
      setIsSubmitting(true);
      const newMember = await familyMemberService.addFamilyMember(data);
      setMembers([...members, newMember]);
      setIsShowingForm(false);
      notify.success('Family member added successfully!');
    } catch (error: any) {
      console.error('Error adding family member:', error);
      notify.error(error.message || 'Failed to add family member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this family member?')) return;

    try {
      setDeletingId(id);
      await familyMemberService.deleteFamilyMember(id);
      setMembers(members.filter(m => m.id !== id));
      notify.success('Family member deleted successfully');
    } catch (error: any) {
      console.error('Error deleting family member:', error);
      notify.error(error.message || 'Failed to delete family member');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <GenericPageSkeleton />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight mb-2">
              Family Members
            </h1>
            <p className="text-gray-600">Manage health records for your family members</p>
          </div>
          {!isShowingForm && (
            <button
              onClick={() => setIsShowingForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0D7C7C] to-[#004B87] text-white font-600 rounded-lg hover:shadow-lg transition-all whitespace-nowrap"
            >
              <FaPlus /> Add Member
            </button>
          )}
        </div>
      </div>

      {/* Form Section */}
      {isShowingForm && (
        <div className="mb-12">
          <FamilyMemberForm
            onSubmit={handleAddMember}
            isSubmitting={isSubmitting}
            onCancel={() => setIsShowingForm(false)}
          />
        </div>
      )}

      {/* Members Grid */}
      {members.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <h3 className="text-lg font-600 text-gray-900 mb-2">No family members yet</h3>
          <p className="text-gray-600 mb-6">Add family members to manage their health records</p>
          <button
            onClick={() => setIsShowingForm(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0D7C7C] text-white font-600 rounded-lg hover:bg-[#0a6666] transition-colors"
          >
            <FaPlus /> Add First Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map(member => (
            <FamilyMemberCard
              key={member.id}
              member={member}
              onDelete={handleDeleteMember}
              isDeleting={deletingId === member.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FamilyMembersPage;
