import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { familyMemberService, type FamilyMemberRequest, type FamilyMemberResponse } from '../../services/familyMemberService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FamilyMemberCard from '../../components/family/FamilyMemberCard';
import FamilyMemberForm from '../../components/family/FamilyMemberForm';
import { notify } from '../../utils/toast';

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 md:px-5 py-8 md:py-9">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[clamp(1.55rem,1.15rem+1.3vw,2.2rem)] font-black text-gray-900 uppercase tracking-tight mb-1.5">
              Family Members
            </h1>
            <p className="text-[clamp(0.82rem,0.78rem+0.22vw,0.92rem)] text-gray-600">Manage health records for your family members</p>
          </div>
          {!isShowingForm && (
            <button
              onClick={() => setIsShowingForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#0D7C7C] to-[#004B87] text-white font-600 rounded-lg hover:shadow-lg transition-all whitespace-nowrap text-sm"
            >
              <FaPlus /> Add Member
            </button>
          )}
        </div>
      </div>

      {/* Form Section */}
      {isShowingForm && (
        <div className="mb-8">
          <FamilyMemberForm
            onSubmit={handleAddMember}
            isSubmitting={isSubmitting}
            onCancel={() => setIsShowingForm(false)}
          />
        </div>
      )}

      {/* Members Grid */}
      {members.length === 0 ? (
        <div className="text-center py-14 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <h3 className="text-base font-600 text-gray-900 mb-2">No family members yet</h3>
          <p className="text-sm text-gray-600 mb-5">Add family members to manage their health records</p>
          <button
            onClick={() => setIsShowingForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0D7C7C] text-white font-600 rounded-lg hover:bg-[#0a6666] transition-colors text-sm"
          >
            <FaPlus /> Add First Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
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
