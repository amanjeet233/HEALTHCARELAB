import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Heart, Calendar, MapPin, DollarSign, ArrowLeft, Check, Phone, MapPinIcon, FileText } from 'lucide-react';
import { labTestService } from '../services/labTest';
import { bookingService } from '../services/booking';
import { notify } from '../utils/toast';
import type { LabTestResponse } from '../types/labTest';

interface BookingFormData {
  testId: number;
  collectionDate: string;
  collectionType: 'HOME' | 'CENTER';
  mobileNumber: string;
  pincode: string;
  address: string;
  specialNotes: string;
  agreeToTerms: boolean;
}

interface BookingResponse {
  id: number;
  bookingReference: string;
  testId: number;
  testName: string;
  amount: number;
  status: string;
  scheduledDate: string;
  collectionType: string;
  sampleType: string;
  turnaroundTime: string;
}

type BookingStep = 'form' | 'payment' | 'confirmation';

const BookingPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const testId = parseInt(id || searchParams.get('testId') || '0', 10);

    // State
    const [step, setStep] = useState<BookingStep>('form');
    const [test, setTest] = useState<LabTestResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState<BookingFormData>({
        testId: testId,
        collectionDate: '',
        collectionType: 'CENTER',
        mobileNumber: '',
        pincode: '',
        address: '',
        specialNotes: '',
        agreeToTerms: false,
    });

    // Booking response
    const [booking, setBooking] = useState<BookingResponse | null>(null);

    // Errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load test details
    useEffect(() => {
        const loadTest = async () => {
            try {
                setLoading(true);
                const response = await labTestService.getLabTestById(testId);
                setTest(response);
            } catch (error) {
                console.error('Error loading test:', error);
                notify.error('Failed to load test details');
                navigate('/tests');
            } finally {
                setLoading(false);
            }
        };
        if (testId) loadTest();
    }, [testId]);

    // Validation functions
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.collectionDate) {
            newErrors.collectionDate = 'Please select a collection date';
        } else {
            const selectedDate = new Date(formData.collectionDate);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            if (selectedDate < tomorrow) {
                newErrors.collectionDate = 'Collection date must be at least 24 hours from now';
            }
        }

        if (!formData.mobileNumber) {
            newErrors.mobileNumber = 'Mobile number is required';
        } else if (!/^[0-9]{10}$/.test(formData.mobileNumber)) {
            newErrors.mobileNumber = 'Mobile number must be 10 digits';
        }

        if (!formData.pincode) {
            newErrors.pincode = 'Pincode is required';
        } else if (!/^[0-9]{6}$/.test(formData.pincode)) {
            newErrors.pincode = 'Pincode must be 6 digits';
        }

        if (formData.collectionType === 'HOME' && !formData.address) {
            newErrors.address = 'Address is required for home collection';
        }

        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'Please agree to terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            notify.error('Please fix the errors in the form');
            return;
        }

        setSubmitting(true);
        try {
            // Call backend API to create booking
            const bookingRequest = {
                testId: formData.testId,
                collectionDate: formData.collectionDate,
                collectionType: formData.collectionType === 'HOME' ? 'HOME' : 'LAB' as const,
                mobileNumber: formData.mobileNumber,
                pincode: formData.pincode,
                address: formData.address || undefined,
                specialNotes: formData.specialNotes || undefined,
            };

            const response = await bookingService.createBooking(bookingRequest as any);
            
            // Transform API response to BookingResponse format
            const booking: BookingResponse = {
                id: response.id,
                bookingReference: response.reference || response.bookingReference,
                testId: response.testId,
                testName: response.testName || test?.testName || 'Test',
                amount: response.totalAmount || response.amount,
                status: 'PENDING_CONFIRMATION',
                scheduledDate: response.bookingDate || formData.collectionDate,
                collectionType: response.collectionType || formData.collectionType,
                sampleType: test?.sampleType || 'Blood',
                turnaroundTime: test?.reportTimeHours ? `${test.reportTimeHours} hours` : '24 hours',
            };

            setBooking(booking);
            setStep('payment');
            notify.success('Booking details saved. Proceeding to payment...');
        } catch (error: any) {
            console.error('Booking error:', error);
            notify.error(error?.message || 'Failed to create booking');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle payment
    const handlePayment = async () => {
        setSubmitting(true);
        try {
            // TODO: Integration with payment gateway
            console.log('Processing payment for booking:', booking?.id);
            
            // Simulate successful payment
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            setStep('confirmation');
            notify.success('Payment successful! Booking confirmed.');
        } catch (error: any) {
            console.error('Payment error:', error);
            notify.error('Payment failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!test) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Test not found</h2>
                    <button
                        onClick={() => navigate('/tests')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Tests
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <button
                    onClick={() => step === 'form' ? navigate('/tests') : setStep('form')}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-8"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {step === 'form' ? 'Back to Tests' : 'Edit Booking Details'}
                </button>

                {/* Step Indicator */}
                <div className="flex justify-center gap-4 mb-12">
                    <div className={`flex items-center gap-3 px-6 py-3 rounded-lg font-semibold ${step === 'form' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${step === 'form' ? 'bg-white text-blue-600' : 'bg-gray-300 text-gray-700'}`}>1</div>
                        Booking Details
                    </div>
                    <div className="w-12 h-1 bg-gray-300 self-center"></div>
                    <div className={`flex items-center gap-3 px-6 py-3 rounded-lg font-semibold ${step === 'payment' ? 'bg-blue-600 text-white' : step === 'confirmation' ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-400'}`}>
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${step === 'payment' || step === 'confirmation' ? 'bg-white text-blue-600' : 'bg-gray-300 text-gray-600'}`}>2</div>
                        Payment
                    </div>
                    <div className="w-12 h-1 bg-gray-300 self-center"></div>
                    <div className={`flex items-center gap-3 px-6 py-3 rounded-lg font-semibold ${step === 'confirmation' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${step === 'confirmation' ? 'bg-white text-blue-600' : 'bg-gray-300 text-gray-600'}`}>3</div>
                        Confirmation
                    </div>
                </div>

                {/* Form Step */}
                {step === 'form' && (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Test Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                                <div className="flex items-center gap-3 mb-6">
                                    <Heart className="w-6 h-6 text-red-500" />
                                    <h3 className="text-lg font-bold text-gray-900">Test Summary</h3>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Test Name</p>
                                        <p className="font-semibold text-gray-900">{test.testName}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Sample Type</p>
                                        <p className="font-semibold text-gray-900">{test.sampleType}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Report Time</p>
                                        <p className="font-semibold text-gray-900">{test.reportTimeHours || 24} hours</p>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <p className="text-sm text-gray-600 mb-1">Test Price</p>
                                        <p className="text-2xl font-bold text-blue-600">₹{test.price}</p>
                                    </div>

                                    {formData.collectionType === 'HOME' && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Collection Fee</p>
                                            <p className="text-lg font-semibold text-gray-900">₹100</p>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-gray-200">
                                        <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            ₹{(test.price || 0) + (formData.collectionType === 'HOME' ? 100 : 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Booking Form */}
                        <form onSubmit={handleFormSubmit} className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8 space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8">Booking Details</h2>

                            {/* Collection Date */}
                            <div>
                                <label htmlFor="collectionDate" className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    When do you want the sample collected?
                                </label>
                                <input
                                    id="collectionDate"
                                    type="date"
                                    value={formData.collectionDate}
                                    onChange={(e) => {
                                        setFormData({ ...formData, collectionDate: e.target.value });
                                        if (errors.collectionDate) setErrors({ ...errors, collectionDate: '' });
                                    }}
                                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.collectionDate ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.collectionDate && <p className="text-red-600 text-sm mt-1">{errors.collectionDate}</p>}
                            </div>

                            {/* Collection Location */}
                            <div>
                                <label className="flex items-center gap-2 text-gray-900 font-semibold mb-4">
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                    Where should we collect the sample?
                                </label>
                                <div className="space-y-3">
                                    {['CENTER', 'HOME'].map((type) => (
                                        <label
                                            key={type}
                                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.collectionType === type ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}
                                        >
                                            <input
                                                type="radio"
                                                name="collectionType"
                                                value={type}
                                                checked={formData.collectionType === type as 'HOME' | 'CENTER'}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, collectionType: e.target.value as 'HOME' | 'CENTER' });
                                                    if (errors.address) setErrors({ ...errors, address: '' });
                                                }}
                                                className="w-5 h-5 text-blue-600"
                                            />
                                            <span className="ml-4">
                                                <p className="font-semibold text-gray-900">{type === 'CENTER' ? 'Collection Center' : 'Home Collection'}</p>
                                                <p className="text-sm text-gray-600">{type === 'CENTER' ? 'Visit our nearest lab location' : 'Phlebotomist will visit your home (+₹100)'}</p>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Mobile Number */}
                            <div>
                                <label className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
                                    <Phone className="w-5 h-5 text-blue-600" />
                                    Mobile Number
                                </label>
                                <div className="flex">
                                    <span className="px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-l-lg font-semibold text-gray-700">+91</span>
                                    <input
                                        type="tel"
                                        placeholder="Enter 10-digit number"
                                        value={formData.mobileNumber}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setFormData({ ...formData, mobileNumber: val });
                                            if (errors.mobileNumber) setErrors({ ...errors, mobileNumber: '' });
                                        }}
                                        className={`flex-1 px-4 py-3 border-2 border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.mobileNumber ? 'border-red-500' : ''}`}
                                    />
                                </div>
                                {errors.mobileNumber && <p className="text-red-600 text-sm mt-1">{errors.mobileNumber}</p>}
                            </div>

                            {/* Pincode */}
                            <div>
                                <label className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
                                    <MapPinIcon className="w-5 h-5 text-blue-600" />
                                    Pincode
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit pincode"
                                    value={formData.pincode}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                        setFormData({ ...formData, pincode: val });
                                        if (errors.pincode) setErrors({ ...errors, pincode: '' });
                                    }}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.pincode ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.pincode && <p className="text-red-600 text-sm mt-1">{errors.pincode}</p>}
                            </div>

                            {/* Address (conditional) */}
                            {formData.collectionType === 'HOME' && (
                                <div>
                                    <label className="text-gray-900 font-semibold mb-3 block">
                                        Full Address (for home collection)
                                    </label>
                                    <textarea
                                        placeholder="Enter your complete address"
                                        value={formData.address}
                                        onChange={(e) => {
                                            setFormData({ ...formData, address: e.target.value });
                                            if (errors.address) setErrors({ ...errors, address: '' });
                                        }}
                                        rows={3}
                                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
                                </div>
                            )}

                            {/* Special Notes */}
                            <div>
                                <label className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    Special Instructions (Optional)
                                </label>
                                <textarea
                                    placeholder="Any special instructions or medical conditions we should know about?"
                                    value={formData.specialNotes}
                                    onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Terms Checkbox */}
                            <div>
                                <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer ${errors.agreeToTerms ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}>
                                    <input
                                        type="checkbox"
                                        checked={formData.agreeToTerms}
                                        onChange={(e) => {
                                            setFormData({ ...formData, agreeToTerms: e.target.checked });
                                            if (errors.agreeToTerms) setErrors({ ...errors, agreeToTerms: '' });
                                        }}
                                        className="w-5 h-5 text-blue-600 mt-1"
                                    />
                                    <span className="text-gray-700">
                                        I agree to the terms & conditions and privacy policy
                                    </span>
                                </label>
                                {errors.agreeToTerms && <p className="text-red-600 text-sm mt-1">{errors.agreeToTerms}</p>}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:bg-gray-400 flex items-center justify-center gap-3 text-lg"
                            >
                                <DollarSign className="w-6 h-6" />
                                {submitting ? 'Processing...' : 'Proceed to Payment'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Payment Step */}
                {step === 'payment' && booking && (
                    <PaymentSection booking={booking} onConfirm={handlePayment} submitting={submitting} />
                )}

                {/* Confirmation Step */}
                {step === 'confirmation' && booking && (
                    <ConfirmationSection booking={booking} onDone={() => navigate('/my-bookings')} />
                )}
            </div>
        </div>
    );
};

// Payment Section Component
const PaymentSection: React.FC<{ booking: BookingResponse; onConfirm: () => void; submitting: boolean }> = ({ booking, onConfirm, submitting }) => {
    const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI' | 'NETBANKING' | 'WALLET'>('CARD');

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h3>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-600">Test</p>
                            <p className="font-semibold text-gray-900">{booking.testName}</p>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Test Amount</p>
                            <p className="text-xl font-bold text-gray-900">₹{booking.amount - (booking.collectionType === 'HOME' ? 100 : 0)}</p>
                        </div>

                        {booking.collectionType === 'HOME' && (
                            <div>
                                <p className="text-sm text-gray-600">Collection Fee</p>
                                <p className="font-semibold text-gray-900">₹100</p>
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                            <p className="text-3xl font-bold text-green-600">₹{booking.amount}</p>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Scheduled Date</p>
                            <p className="font-semibold text-gray-900">{new Date(booking.scheduledDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <form onSubmit={(e) => { e.preventDefault(); onConfirm(); }} className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>

                <div className="space-y-3">
                    {[
                        { id: 'CARD', label: 'Credit/Debit Card', desc: 'Visa, Mastercard, RuPay' },
                        { id: 'UPI', label: 'UPI', desc: 'Google Pay, PhonePe, BHIM' },
                        { id: 'NETBANKING', label: 'Net Banking', desc: 'All major banks' },
                        { id: 'WALLET', label: 'Wallet', desc: 'Paytm, Amazon Pay' },
                    ].map((method) => (
                        <label
                            key={method.id}
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === method.id ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}
                        >
                            <input
                                type="radio"
                                name="paymentMethod"
                                value={method.id}
                                checked={paymentMethod === method.id as any}
                                onChange={(e) => setPaymentMethod(e.target.value as any)}
                                className="w-5 h-5 text-blue-600"
                            />
                            <span className="ml-4">
                                <p className="font-semibold text-gray-900">{method.label}</p>
                                <p className="text-sm text-gray-600">{method.desc}</p>
                            </span>
                        </label>
                    ))}
                </div>

                {/* Security Notice */}
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-green-900">100% Secure Payment</p>
                        <p className="text-sm text-green-700">Your payment is encrypted and secure</p>
                    </div>
                </div>

                {/* Pay Button */}
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:bg-gray-400 flex items-center justify-center gap-3 text-lg"
                >
                    <DollarSign className="w-6 h-6" />
                    {submitting ? 'Processing Payment...' : `Pay ₹${booking.amount}`}
                </button>
            </form>
        </div>
    );
};

// Confirmation Section Component
const ConfirmationSection: React.FC<{ booking: BookingResponse; onDone: () => void }> = ({ booking, onDone }) => {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Success Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-12 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                            <Check className="w-10 h-10 text-green-600" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
                    <p className="text-green-100 text-lg">Your test has been successfully booked</p>
                </div>

                <div className="p-8 space-y-8">
                    {/* Booking Reference */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
                        <p className="text-sm text-gray-600 mb-2">Booking Reference</p>
                        <p className="text-3xl font-bold text-blue-600 font-mono">{booking.bookingReference}</p>
                    </div>

                    {/* Booking Details */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Test Name</p>
                                <p className="font-semibold text-gray-900 text-lg">{booking.testName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Sample Type</p>
                                <p className="font-semibold text-gray-900">{booking.sampleType}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Collection Type</p>
                                <p className="font-semibold text-gray-900">{booking.collectionType === 'HOME' ? 'Home Collection' : 'Collection Center'}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Scheduled Date</p>
                                <p className="font-semibold text-gray-900 text-lg">{new Date(booking.scheduledDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
                                <p className="font-semibold text-green-600 text-lg">₹{booking.amount}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Status</p>
                                <p className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 font-semibold rounded-full text-sm">PENDING CONFIRMATION</p>
                            </div>
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="font-bold text-gray-900 mb-4 text-lg">Next Steps</h3>
                        <ol className="space-y-3">
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
                                <span className="text-gray-700">A certified phlebotomist will contact you 24 hours before collection</span>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
                                <span className="text-gray-700">Safe sample collection will be done at your preferred location</span>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
                                <span className="text-gray-700">Reports will be delivered in {booking.turnaroundTime} via email and WhatsApp</span>
                            </li>
                        </ol>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={() => {
                                // TODO: Generate and download PDF receipt
                                console.log('Downloading receipt for booking:', booking.id);
                            }}
                            className="flex-1 py-4 border-2 border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all"
                        >
                            Download Receipt
                        </button>
                        <button
                            onClick={onDone}
                            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
                        >
                            View My Bookings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;

