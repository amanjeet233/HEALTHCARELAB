package com.healthcare.labtestbooking.entity.enums;

public enum BookingStatus {
    BOOKED,
    SAMPLE_COLLECTED,
    PROCESSING,
    REFLEX_PENDING,
    PENDING_VERIFICATION,
    VERIFIED,
    COMPLETED,
    CANCELLED,

    /**
     * @deprecated Legacy status kept for database backwards-compatibility only.
     * No new bookings should be placed in CONFIRMED state.
     * The only valid transition is CONFIRMED → CANCELLED.
     */
    @Deprecated
    CONFIRMED
}
