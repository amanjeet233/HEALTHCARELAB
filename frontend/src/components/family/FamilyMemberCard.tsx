import React from 'react';
import { FaUser, FaTrash, FaCalendar, FaVenusMars } from 'react-icons/fa';
import type { FamilyMemberResponse } from '../../services/familyMemberService';

interface FamilyMemberCardProps {
  member: FamilyMemberResponse;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

const FamilyMemberCard: React.FC<FamilyMemberCardProps> = ({
  member,
  onDelete,
  isDeleting = false
}) => {
  const age = new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 bg-gradient-to-br from-[#0D7C7C] to-[#004B87] rounded-full flex items-center justify-center text-white shadow-md">
            <FaUser className="text-lg" />
          </div>

          {/* Member Info */}
          <div className="flex-1">
            <h3 className="text-lg font-black text-gray-900">{member.name}</h3>

            <div className="mt-2 space-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-600 text-[#0D7C7C]">Relation:</span>
                <span className="capitalize">{member.relation}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <FaCalendar className="text-[#0D7C7C]" />
                <span>Age: {age} years</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <FaVenusMars className="text-[#0D7C7C]" />
                <span className="capitalize">{member.gender}</span>
              </div>

              {member.phoneNumber && (
                <div className="text-gray-600">
                  <span className="font-600 text-[#0D7C7C]">Phone:</span> {member.phoneNumber}
                </div>
              )}

              {member.email && (
                <div className="text-gray-600 truncate">
                  <span className="font-600 text-[#0D7C7C]">Email:</span> {member.email}
                </div>
              )}

              {member.medicalHistory && (
                <div className="text-gray-600 text-xs">
                  <span className="font-600 text-[#0D7C7C]">Medical History:</span>
                  <p className="mt-1 line-clamp-2">{member.medicalHistory}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(member.id)}
          disabled={isDeleting}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          title="Delete family member"
        >
          <FaTrash className={`${isDeleting ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default FamilyMemberCard;
