import api from './api';

export interface FamilyMemberRequest {
  name: string;
  relation: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phoneNumber?: string;
  email?: string;
  medicalHistory?: string;
}

export interface FamilyMemberResponse extends FamilyMemberRequest {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export const familyMemberService = {
  /**
   * Add a new family member
   */
  async addFamilyMember(data: FamilyMemberRequest): Promise<FamilyMemberResponse> {
    const response = await api.post('/api/family-members', data);
    return response.data.data;
  },

  /**
   * Get all family members of the authenticated user
   */
  async getFamilyMembers(): Promise<FamilyMemberResponse[]> {
    const response = await api.get('/api/family-members');
    return response.data.data || [];
  },

  /**
   * Delete a family member by ID
   */
  async deleteFamilyMember(id: number): Promise<void> {
    await api.delete(`/api/family-members/${id}`);
  }
};
