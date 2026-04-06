import React from 'react';
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface RecommendationCardProps {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'lifestyle' | 'medical' | 'nutrition' | 'exercise';
  icon?: React.ReactNode;
  action?: string;
  onActionClick?: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  title,
  description,
  priority,
  category,
  icon,
  action,
  onActionClick
}) => {
  const priorityStyles = {
    high: 'border-l-4 border-red-500 bg-red-50',
    medium: 'border-l-4 border-yellow-500 bg-yellow-50',
    low: 'border-l-4 border-green-500 bg-green-50'
  };

  const priorityBadgeStyles = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };

  const categoryColors = {
    lifestyle: 'bg-blue-100 text-blue-800',
    medical: 'bg-purple-100 text-purple-800',
    nutrition: 'bg-orange-100 text-orange-800',
    exercise: 'bg-emerald-100 text-emerald-800'
  };

  return (
    <div className={`rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${priorityStyles[priority]}`}>
      <div className="flex items-start gap-3">
        {/* Icon Section */}
        <div className="flex-shrink-0 pt-1">
          {icon ? (
            <>{icon}</>
          ) : (
            priority === 'high' ? (
              <AlertCircle className="w-5 h-5 text-red-600" />
            ) : priority === 'medium' ? (
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <div className="flex gap-2 flex-wrap justify-end">
              <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${priorityBadgeStyles[priority]}`}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${categoryColors[category]}`}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-3">{description}</p>

          {/* Action Button */}
          {action && (
            <button
              onClick={onActionClick}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              {action} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
