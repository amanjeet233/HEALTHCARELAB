import api from './api';

export interface TestPackageResponse {
    id: number;
    name: string;
    packageName: string;
    packageCode: string;
    description: string;
    price: number;
    discountedPrice: number;
    discountPercentage: number;
    savings: number;
    totalTests: number;
    tests: { id: number; name: string }[];
    category: string;
    isPopular?: boolean;
}

export interface PackageAnalytics {
    packageId: number;
    packageName: string;
    totalBookings: number;
    totalRevenue: number;
    averageRating: number;
    popularityScore: number;
    monthlyTrend: Array<{ month: string; bookings: number }>;
}

export interface PopularPackage {
    id: number;
    name: string;
    bookingCount: number;
    rating: number;
    revenue: number;
}

export type TestPackage = TestPackageResponse;

const normalizePackage = (pkg: any): TestPackageResponse => ({
    id: pkg.id || 0,
    name: pkg.name || pkg.packageName || '',
    packageName: pkg.packageName || pkg.name || '',
    packageCode: pkg.packageCode || '',
    description: pkg.description || '',
    price: pkg.price || 0,
    discountedPrice: pkg.discountedPrice ?? pkg.finalPrice ?? pkg.price ?? 0,
    discountPercentage: pkg.discountPercentage || 0,
    savings: pkg.savings || (pkg.price && pkg.discountedPrice ? pkg.price - pkg.discountedPrice : 0),
    totalTests: pkg.totalTests || (pkg.tests?.length || 0),
    tests: pkg.tests || [],
    category: pkg.category || 'General',
    isPopular: pkg.isPopular || false
});

export const packageService = {
    getAllPackages: async (params?: { page?: number; size?: number; category?: string }): Promise<TestPackageResponse[]> => {
        const response = await api.get('/api/lab-tests/packages', { params });
        let data: any[] = [];
        if (response.data?.content) {
            data = response.data.content;
        } else if (response.data?.data?.content) {
            data = response.data.data.content;
        } else {
            data = response.data?.data || response.data || [];
        }
        return data.map(normalizePackage);
    },

    getPackageById: async (id: number): Promise<TestPackageResponse> => {
        const response = await api.get(`/api/lab-tests/packages/${id}`);
        return normalizePackage(response.data?.data || response.data);
    },

    getBestDeals: async (): Promise<TestPackageResponse[]> => {
        const response = await api.get('/api/lab-tests/packages/best-deals');
        const data = response.data?.data || response.data || [];
        return data.map(normalizePackage);
    },

    /**
     * Get package analytics and performance metrics
     */
    getPackageAnalytics: async (packageId?: number): Promise<PackageAnalytics[]> => {
        try {
            const endpoint = packageId ? `/api/packages/analytics/${packageId}` : '/api/packages/analytics';
            const response = await api.get(endpoint);
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error fetching package analytics:', error);
            return [];
        }
    },

    /**
     * Get popular packages ranked by bookings
     */
    getPopularPackages: async (limit: number = 10): Promise<PopularPackage[]> => {
        try {
            const response = await api.get('/api/packages/popular', { params: { limit } });
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error fetching popular packages:', error);
            return [];
        }
    },

    /**
     * Get package performance metrics for admin
     */
    getPackagePerformance: async (params?: { period?: string }): Promise<any> => {
        try {
            const response = await api.get('/api/packages/performance', { params });
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error fetching package performance:', error);
            return null;
        }
    },

    /**
     * Get package comparison data
     */
    comparePackages: async (packageIds: number[]): Promise<TestPackageResponse[]> => {
        try {
            const response = await api.post('/api/packages/compare', { packageIds });
            const data = response.data?.data || response.data || [];
            return data.map(normalizePackage);
        } catch (error) {
            console.error('Error comparing packages:', error);
            return [];
        }
    }
};
