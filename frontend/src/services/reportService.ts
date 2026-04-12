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

const unwrap = <T>(response: any): T => {
    if (response?.data?.data !== undefined) return response.data.data as T;
    if (response?.data !== undefined) return response.data as T;
    return response as T;
};

const mapSummaryToDisplay = (item: any, index: number): ReportDisplay => {
    const hasReport = !!item?.reportId;
    return {
        id: item?.reportId || item?.bookingId || index,
        bookingId: item?.bookingId || 0,
        testName: item?.testName || item?.packageName || 'Lab Report',
        bookingDate: item?.generatedAt || item?.estimatedReadyAt || new Date().toISOString(),
        status: (item?.status || (hasReport ? 'READY' : 'PENDING')).toUpperCase(),
        report: hasReport
            ? {
                  id: item.reportId,
                  bookingId: item.bookingId,
                  technicianId: 0,
                  submittedAt: item.generatedAt || new Date().toISOString(),
                  results: []
              }
            : null,
        hasReport
    };
};

export const reportService = {
    getReportsByUser: async (): Promise<ReportDisplay[]> => {
        const response = await api.get('/api/users/reports', { params: { limit: 100, offset: 0 } });
        const list = unwrap<any[]>(response) || [];
        return Array.isArray(list) ? list.map(mapSummaryToDisplay) : [];
    },

    getMyReports: async (): Promise<ReportDisplay[]> => {
        return reportService.getReportsByUser();
    },

    getReportByBooking: async (bookingId: number): Promise<ReportResult> => {
        const reports = await reportService.getMyReports();
        const found = reports.find((r) => r.bookingId === bookingId && r.report);
        if (!found?.report) throw new Error('Report not found for booking');
        return found.report;
    },

    downloadReport: async (reportId: number): Promise<void> => {
        const response = await api.get(`/api/users/reports/${reportId}/pdf`, { responseType: 'blob' });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `report-${reportId}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
    },

    getReportPdfUrl: async (reportId: number): Promise<string> => {
        const response = await api.get(`/api/users/reports/${reportId}/pdf`, { responseType: 'blob' });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        return URL.createObjectURL(blob);
    },

    uploadReport: async (bookingId: number, results: ReportSubmitItem[], technicianId?: number): Promise<ReportResult> => {
        const response = await api.post('/api/reports/results', {
            bookingId,
            technicianId,
            results
        });
        return unwrap<ReportResult>(response);
    },

    uploadReportFile: async (bookingId: number, file: File): Promise<void> => {
        const formData = new FormData();
        formData.append('bookingId', bookingId.toString());
        formData.append('file', file);
        await api.post('/api/reports/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    verifyReport: async (reportId: number): Promise<void> => {
        await api.post(`/api/reports/verify/${reportId}`);
    },

    getReportByStaff: async (reportId: number): Promise<ReportResult> => {
        const response = await api.get(`/api/reports/${reportId}/staff`);
        return unwrap<ReportResult>(response);
    },

    shareReportWithStaff: async (reportId: number, staffIds: number[]): Promise<void> => {
        await api.post(`/api/reports/${reportId}/share`, { staffIds });
    },

    getSharedReports: async (): Promise<ReportDisplay[]> => {
        const response = await api.get('/api/reports/shared');
        const list = unwrap<any[]>(response) || [];
        return Array.isArray(list) ? list.map(mapSummaryToDisplay) : [];
    },

    shareUserReport: async (reportId: number, email: string, accessType: 'view' | 'download' = 'view'): Promise<void> => {
        await api.post(`/api/users/reports/${reportId}/share`, { email, accessType });
    }
};

