import React from 'react';
import { FaLightbulb, FaCheckCircle, FaExclamationTriangle, FaHeartbeat } from 'react-icons/fa';
import type { SmartAnalysis } from '../../services/smartReportService';

interface SmartReportViewerProps {
  analysis: SmartAnalysis;
  isLoading?: boolean;
}

const SmartReportViewer: React.FC<SmartReportViewerProps> = ({ analysis, isLoading }) => {
  if (isLoading) {
    return <div className="p-8 text-center">Loading analysis...</div>;
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-100 border-green-500 text-green-700';
      case 'MEDIUM': return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case 'HIGH': return 'bg-orange-100 border-orange-500 text-orange-700';
      case 'CRITICAL': return 'bg-red-100 border-red-500 text-red-700';
      default: return 'bg-gray-100 border-gray-500 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Health Score Card */}
      <div className="bg-gradient-to-br from-[#0D7C7C] to-[#004B87] rounded-lg p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80 uppercase font-600 tracking-widest mb-2">Overall Health Score</p>
            <p className="text-6xl font-black">{analysis.healthScore}/100</p>
          </div>
          <div className="text-6xl opacity-30">
            <FaHeartbeat />
          </div>
        </div>
        <p className="mt-4 text-sm opacity-80">{analysis.summary}</p>
      </div>

      {/* Risk Level */}
      <div className={`border-4 rounded-lg p-6 ${getRiskColor(analysis.riskLevel)}`}>
        <div className="flex items-center gap-3 mb-2">
          {analysis.riskLevel === 'LOW' && <FaCheckCircle className="text-2xl" />}
          {analysis.riskLevel === 'MEDIUM' && <FaExclamationTriangle className="text-2xl" />}
          {analysis.riskLevel === 'HIGH' && <FaExclamationTriangle className="text-2xl" />}
          {analysis.riskLevel === 'CRITICAL' && <FaExclamationTriangle className="text-2xl" />}
          <span className="font-black uppercase tracking-wider text-lg">Risk Level: {analysis.riskLevel}</span>
        </div>
        <p className="text-xs opacity-80">Assessment based on your latest test results</p>
      </div>

      {/* Key Findings */}
      {analysis.keyFindings && analysis.keyFindings.length > 0 && (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h3 className="flex items-center gap-2 font-black text-gray-900 uppercase mb-4 tracking-tight">
            <FaLightbulb className="text-[#0D7C7C]" />
            Key Findings
          </h3>
          <ul className="space-y-3">
            {analysis.keyFindings.map((finding, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-[#0D7C7C] font-black mt-1">•</span>
                <span className="text-sm text-gray-700">{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="font-black text-gray-900 uppercase mb-4 tracking-tight text-[#004B87]">
            Recommendations
          </h3>
          <ul className="space-y-3">
            {analysis.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
                <span className="text-blue-600 font-black">✓</span>
                <span className="text-sm text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Last Updated */}
      <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
        Last updated: {new Date(analysis.lastUpdated).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </div>
    </div>
  );
};

export default SmartReportViewer;
