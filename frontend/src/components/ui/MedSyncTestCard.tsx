import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TestCard, TestCardSkeleton } from '../TestCard';

export interface MedSyncTestCardData {
  id: number;
  name: string;
  canonicalTag?: string;
  slug?: string;
  category?: string;
  itemType?: 'TEST' | 'PACKAGE';
  isPackage?: boolean;
  parametersCount?: number;
  testsIncluded?: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  turnaroundTime?: string;
  reportTATMessage?: string;
  reportTAT?: string;
  itemTags?: { display_text: string; display_colour: string }[];
}

export const MedSyncTestCardSkeleton = () => {
    return <TestCardSkeleton />;
};

const MedSyncTestCard: React.FC<{ item: MedSyncTestCardData }> = ({ item }) => {
  const navigate = useNavigate();

  const handleBook = (testId: number) => {
    // Legacy route
  };

  // Convert MedSyncTestCardData to TestCardProps's expected test format
  const mappedTest = {
    id: item.id,
    name: item.name,
    slug: item.slug || item.canonicalTag || String(item.id),
    category: item.category || 'General',
    price: item.price,
    originalPrice: item.originalPrice || item.price,
    shortDesc: item.reportTATMessage || '',
    sampleType: 'Blood', // Default fallback
    fastingRequired: 0,
    turnaroundTime: item.turnaroundTime || item.reportTAT || '24-48 Hours',
    rating: 4.5,
    isPackage: item.isPackage || item.itemType === 'PACKAGE',
    testsIncluded: item.testsIncluded || item.parametersCount,
    recommendedFor: item.itemTags && item.itemTags.length > 0 ? item.itemTags[0].display_text : undefined
  };

  return (
    <TestCard 
      test={mappedTest} 
      onViewDetails={(slug) => navigate(`/test/${slug}`)} 
      onBook={handleBook} 
    />
  );
};

export default MedSyncTestCard;
