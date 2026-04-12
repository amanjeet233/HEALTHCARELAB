import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TestCard, TestCardSkeleton } from '../TestCard';

export interface MedSyncTestCardData {
  id: number;
  name: string;
  canonicalTag?: string;
  slug?: string;
  testCode?: string;
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
  isTopBooked?: boolean;
  isTopDeal?: boolean;
}

export const MedSyncTestCardSkeleton = ({ variant = 'default' }: { variant?: 'default' | 'small' }) => {
    return <TestCardSkeleton variant={variant} />;
};

const toSafeString = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }
  return fallback;
};

const toSafeNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  if (typeof value === 'bigint') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const MedSyncTestCard: React.FC<{ item: MedSyncTestCardData; variant?: 'default' | 'small' }> = ({ item, variant = 'default' }) => {
  const navigate = useNavigate();

  const handleBook = (testId: number) => {
    // Legacy route
  };

  // Convert MedSyncTestCardData to TestCardProps's expected test format
  const mappedTest = {
    id: toSafeNumber(item.id, 0),
    name: toSafeString(item.name, 'Unknown Test'),
    slug: toSafeString(item.slug) || toSafeString(item.canonicalTag) || toSafeString(item.testCode) || String(toSafeNumber(item.id, 0)),
    category: toSafeString(item.category, 'General'),
    price: toSafeNumber(item.price, 0),
    originalPrice: toSafeNumber(item.originalPrice, toSafeNumber(item.price, 0)),
    shortDesc: item.reportTATMessage || '',
    sampleType: 'Blood', // Default fallback
    fastingRequired: 0,
    turnaroundTime: item.turnaroundTime || item.reportTAT || '24-48 Hours',
    rating: 4.5,
    isPackage: item.isPackage || item.itemType === 'PACKAGE',
    testsIncluded: item.testsIncluded || item.parametersCount,
    recommendedFor: item.itemTags && item.itemTags.length > 0 ? item.itemTags[0].display_text : undefined,
    isTopBooked: item.isTopBooked ?? false,
    isTopDeal: item.isTopDeal ?? false,
  };

  return (
    <TestCard 
      test={mappedTest} 
      onViewDetails={(slug) => {
        const finalSlug = String(slug || mappedTest.id);
        if (mappedTest.isPackage) {
          navigate(`/packages/${finalSlug}`);
          return;
        }
        navigate(`/test/${finalSlug}`);
      }} 
      onBook={handleBook} 
      variant={variant}
    />
  );
};

export default MedSyncTestCard;
