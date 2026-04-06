import api from './api';

export interface ReportResultItem {
    id: number;
    parameterId: number;
    parameterName: string;
    resultValue: string;
    unit: string;
    normalRange: string;
    abnormalStatus: string;
    isAbnormal: boolean;
    isCritical: boolean;
}

export interface ReportResult {
    id: number;
    bookingId: number;
    technicianId: number;
    submittedAt: string;
    results: ReportResultItem[];
}

interface RawReportListItem {
    id?: number;
    reportId?: number;
    bookingId?: number;
    testName?: string;
    bookingDate?: string;
    submittedAt?: string;
    status?: string;
    results?: ReportResultItem[];
    report?: ReportResult;
}

// Enriched report for UI display (combines booking + report data)
export interface ReportDisplay {
    id: number;
    bookingId: number;
    testName: string;
    bookingDate: string;
    status: string;
    report: ReportResult | null;
    hasReport: boolean;
}

export interface ReportSubmitItem {
    parameterId: number;
    resultValue: string;
    unit: string;
    normalRange: string;
    notes?: string;
    status?: string;
}

export const reportService = {
    /**
     * Get all reports for the logged-in user
     */
    getReportsByUser: async (): Promise<ReportDisplay[]> => {
        try {
            const response = await api.get('/api/reports/my');
            const list = (response.data?.data || response.data?.content || response.data || []) as RawReportListItem[];

            if (!Array.isArray(list)) return [];

            return list.map((item, index) => {
                const nestedReport = item.report || null;
                const normalizedReport: ReportResult | null = nestedReport || (item.id || item.reportId ? {
                    id: item.id || item.reportId || 0,
                    bookingId: item.bookingId || 0,
                    technicianId: 0,
                    submittedAt: item.submittedAt || item.bookingDate || new Date().toISOString(),
                    results: item.results || []
                } : null);

                return {
                    id: item.bookingId || item.id || item.reportId || index,
                    bookingId: item.bookingId || normalizedReport?.bookingId || 0,
                    testName: item.testName || 'Lab Report',
                    bookingDate: item.bookingDate || item.submittedAt || normalizedReport?.submittedAt || new Date().toISOString(),
                    status: item.status || (normalizedReport ? 'COMPLETED' : 'PENDING'),
                    report: normalizedReport,
                    hasReport: !!normalizedReport
                };
            });
        } catch (error) {
            console.error('Error fetching user reports:', error);
            throw error;
        }
    },

    /**
     * Alias for explicit endpoint semantics used by reports page
     */
    getMyReports: async (): Promise<ReportDisplay[]> => {
        return reportService.getReportsByUser();
    },

    /**
     * Get report by booking ID
     */
    getReportByBooking: async (bookingId: number): Promise<ReportResult> => {
        try {
            const response = await api.get(`/api/reports/booking/${bookingId}`);
            return (response.data?.data || response.data) as ReportResult;
        } catch (error) {
            console.error(`Error fetching report for booking ${bookingId}:`, error);
            throw error;
        }
    },

    /**
     * Download report as PDF
     */
    downloadReport: async (reportId: number): Promise<void> => {
        try {
            const response = await api.get(`/api/reports/${reportId}/pdf`, {
                responseType: 'blob'
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `report-${reportId}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error(`Error downloading report ${reportId}:`, error);
            throw error;
        }
    },

    /**
     * Get report PDF as blob URL for viewing
     */
    getReportPdfUrl: async (reportId: number): Promise<string> => {
        try {
            const response = await api.get(`/api/reports/${reportId}/pdf`, {
                responseType: 'blob'
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error(`Error loading report PDF ${reportId}:`, error);
            throw error;
        }
    },

    /**
     * Upload/submit report results (for technicians)
     */
    uploadReport: async (bookingId: number, results: ReportSubmitItem[], technicianId?: number): Promise<ReportResult> => {
        try {
            const response = await api.post('/api/reports/results', {
                bookingId,
                technicianId,
                results
            });
            return (response.data?.data || response.data) as ReportResult;
        } catch (error) {
            console.error('Error submitting report:', error);
            throw error;
        }
    },

    /**
     * Upload report file (for technicians)
     */
    uploadReportFile: async (bookingId: number, file: File): Promise<void> => {
        try {
            const formData = new FormData();
            formData.append('bookingId', bookingId.toString());
            formData.append('file', file);
            await api.post('/api/reports/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },

    /**
     * Verify a report (marks as verified by medical officer)
     */
    verifyReport: async (reportId: number): Promise<void> => {
        try {
            await api.post(`/api/reports/verify/${reportId}`);
        } catch (error) {
            console.error(`Error verifying report ${reportId}:`, error);
            throw error;
        }
    },

    /**
     * Get report by staff access
     */
    getReportByStaff: async (reportId: number): Promise<ReportResult> => {
        try {
            const response = await api.get(`/api/reports/${reportId}/staff`);
            return (response.data?.data || response.data) as ReportResult;
        } catch (error) {
            console.error(`Error fetching report by staff ${reportId}:`, error);
            throw error;
        }
    },

    /**
     * Share report with staff members
     */
    shareReportWithStaff: async (reportId: number, staffIds: number[]): Promise<void> => {
        try {
            await api.post(`/api/reports/${reportId}/share`, { staffIds });
        } catch (error) {
            console.error(`Error sharing report ${reportId}:`, error);
            throw error;
        }
    },

    /**
     * Get reports shared with current staff member
     */
    getSharedReports: async (): Promise<ReportDisplay[]> => {
        try {
            const response = await api.get('/api/reports/shared');
            const list = (response.data?.data || response.data?.content || response.data || []) as RawReportListItem[];

            if (!Array.isArray(list)) return [];

            return list.map((item, index) => {
                const nestedReport = item.report || null;
                const normalizedReport: ReportResult | null = nestedReport || (item.id || item.reportId ? {
                    id: item.id || item.reportId || 0,
                    bookingId: item.bookingId || 0,
                    technicianId: 0,
                    submittedAt: item.submittedAt || item.bookingDate || new Date().toISOString(),
                    results: item.results || []
                } : null);

                return {
                    id: item.bookingId || item.id || item.reportId || index,
                    bookingId: item.bookingId || normalizedReport?.bookingId || 0,
                    testName: item.testName || 'Lab Report',
                    bookingDate: item.bookingDate || item.submittedAt || normalizedReport?.submittedAt || new Date().toISOString(),
                    status: item.status || (normalizedReport ? 'COMPLETED' : 'PENDING'),
                    report: normalizedReport,
                    hasReport: !!normalizedReport
                };
            });
        } catch (error) {
            console.error('Error fetching shared reports:', error);
            return [];
        }
    }
};
