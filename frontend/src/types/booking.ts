export type BookingStatus = 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'SAMPLE_COLLECTED';

export interface CreateBookingRequest {
    testId: number;
    collectionDate: string; // YYYY-MM-DD
    collectionType: "LAB" | "HOME";
    mobileNumber: string;
    pincode: string;
    address?: string; // Required for HOME collection
    specialNotes?: string;
}

export interface BookingSearchParams {
    status?: string;
    search?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    size?: number;
    sort?: string;
}

export interface BookingResponse {
    id: number;
    bookingReference: string;
    patientId?: number;
    patientName?: string;
    patientEmail?: string;
    patientPhone: string;
    doctorId?: number;
    doctorName?: string;
    technicianId?: number;
    technicianName?: string;
    testId: number;
    testName: string;
    collectionDate: string; // YYYY-MM-DD
    collectionType: "LAB" | "HOME";
    collectionAddress?: string;
    pincode: string;
    status: BookingStatus;
    amount: number;
    paymentStatus?: string;
    paymentMethod?: string;
    sampleType?: string;
    turnaroundTime?: string;
    reportTimeHours?: number;
    createdAt?: string;
    updatedAt?: string;
    specialNotes?: string;
}

export interface BookingPageResponse {
    content: BookingResponse[];
    pageable: unknown;
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: unknown;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}
