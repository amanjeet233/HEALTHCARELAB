import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import { smartReportService, type SmartAnalysis, type ParameterTrend, type CriticalValue } from '../../services/smartReportService';
import { reportService } from '../../services/reportService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SmartReportViewer from '../../components/reports/SmartReportViewer';
import ParameterTrends from '../../components/reports/ParameterTrends';
import api from '../../services/api';
import { notify } from '../../utils/toast';

interface ReportSummary {
  id: number;
  bookingReference: string;
  testName: string;
  reportDate: string;
}

const SmartReportsPage: React.FC = () => {
  const navigate = useNavigate();

  // Data States
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [smartAnalysis, setSmartAnalysis] = useState<SmartAnalysis | null>(null);
  const [trends, setTrends] = useState<ParameterTrend[]>([]);

  // UI States
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load reports on mount
  useEffect(() => {
    fetchReports();
  }, []);

  // Load analysis and trends when report is selected
  useEffect(() => {
    if (selectedReportId) {
      loadAnalysis(selectedReportId);
    }
  }, [selectedReportId]);

  const fetchReports = async () => {
    try {
      setIsLoadingReports(true);
      setError(null);
      const data = await reportService.getMyReports();
      // Only keep reports that are VERIFIED or COMPLETED
      const readyReports = data
        .filter(r => r.status === 'VERIFIED' || r.status === 'COMPLETED')
        .map(r => ({
          id: r.bookingId,
          bookingReference: `BK-${r.bookingId}`,
          testName: r.testName,
          reportDate: r.reportDate
        }));
      setReports(readyReports);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports');
      notify.error('Failed to load reports');
    } finally {
      setIsLoadingReports(false);
    }
  };

  const loadAnalysis = async (reportId: number) => {
    try {
      setIsLoadingAnalysis(true);
      setError(null);

      // Load smart analysis
      const analysis = await smartReportService.getSmartAnalysis(reportId);
      setSmartAnalysis(analysis);

      // Load parameter trends (using a test ID, would come from report data)
      // For demo purposes, using reportId as testId
      const paramTrends = await smartReportService.getParameterTrends(reportId, reportId);
      setTrends(paramTrends);

      notify.success('Analysis loaded successfully');
    } catch (err: any) {
      console.error('Error loading analysis:', err);
      const errorMsg = err.message || 'Failed to load analysis';
      setError(errorMsg);
      notify.error(errorMsg);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  // If loading initial reports
  if (isLoadingReports) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If no report selected
  if (!selectedReportId || !smartAnalysis) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/reports')}
            className="flex items-center gap-2 text-[#0D7C7C] font-600 hover:text-[#004B87] transition-colors mb-6"
          >
            <FaArrowLeft /> Back to Reports
          </button>
          <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">
            Smart Reports
          </h1>
          <p className="text-gray-600 mt-2">AI-powered analysis and health insights</p>
        </div>

        {/* Reports List */}
        {reports.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <FaExclamationTriangle className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-600 text-gray-900 mb-2">No Reports Available</h3>
            <p className="text-gray-600 mb-6">
              You don't have any reports ready for smart analysis yet.
            </p>
            <button
              onClick={() => navigate('/reports')}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0D7C7C] text-white font-600 rounded-lg hover:bg-[#0a6666] transition-colors"
            >
              <FaArrowLeft /> View My Reports
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <div 
                key={report.id}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setSelectedReportId(report.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <span className="font-bold text-lg">AI</span>
                  </div>
                  <span className="text-xs font-600 text-gray-400 uppercase tracking-wider">
                    {report.bookingReference}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {report.testName}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Tested on {new Date(report.reportDate).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-2 text-[#0D7C7C] font-600 text-sm">
                  View Smart Analysis →
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <button
          onClick={() => setSelectedReportId(null)}
          className="flex items-center gap-2 text-[#0D7C7C] font-600 hover:text-[#004B87] transition-colors mb-6"
        >
          <FaArrowLeft /> Back to Reports
        </button>
        <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">
          Report Analysis
        </h1>
        <p className="text-gray-600 mt-2">AI-powered insights and recommendations for your health</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <p className="font-600">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoadingAnalysis ? (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Smart Report Viewer */}
          <div className="mb-12">
            <SmartReportViewer analysis={smartAnalysis} />
          </div>

          {/* Parameter Trends */}
          {trends.length > 0 && (
            <div className="mb-12">
              <ParameterTrends trends={trends} />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-8 border-t border-gray-200">
            <button
              onClick={() => navigate('/reports')}
              className="flex-1 px-6 py-2.5 bg-gradient-to-r from-[#0D7C7C] to-[#004B87] text-white font-600 rounded-lg hover:shadow-lg transition-all"
            >
              Download Full Report
            </button>
            <button
              onClick={async () => {
                try {
                  const resp = await api.post(`/api/reports/${selectedReportId}/share`);
                  const link = `${window.location.origin}/public/view-report/${resp.data.data}`;
                  await navigator.clipboard.writeText(link);
                  notify.success('Sharing link copied to clipboard! (Expires in 7 days)');
                } catch (err) {
                  notify.error('Failed to generate sharing link');
                }
              }}
              className="flex-1 px-6 py-2.5 bg-gray-100 text-gray-700 font-600 rounded-lg hover:bg-gray-200 transition-all"
            >
              Share Report
            </button>
            <button
              onClick={async () => {
                try {
                  await api.delete(`/api/reports/share/${selectedReportId}/revoke`);
                  notify.success('Sharing access revoked successfully');
                } catch (err) {
                  notify.error('Failed to revoke sharing link');
                }
              }}
              className="flex-1 px-6 py-2.5 bg-red-50 text-red-600 font-600 rounded-lg hover:bg-red-100 transition-all border border-red-200"
            >
              Revoke Access
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SmartReportsPage;
