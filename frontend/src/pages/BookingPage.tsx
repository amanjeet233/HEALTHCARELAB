import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, 
    Users, 
    Calendar, 
    Clock, 
    MapPin, 
    CreditCard, 
    CheckCircle2, 
    ChevronRight, 
    ChevronLeft, 
    Plus, 
    ShieldCheck, 
    Zap, 
    ShoppingCart, 
    Printer, 
    Home,
    AlertCircle,
    ArrowRight,
    Search,
    Loader2
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { familyMemberService, type FamilyMemberResponse } from '@/services/familyMemberService';
import { addressService, type AddressDTO } from '@/services/addressService';
import { bookingService } from '@/services/booking';
import { paymentService } from '@/services/paymentService';
import type { BookingResponse, CreateBookingRequest } from '@/types/booking';
import api from '@/services/api';
import { notify } from '@/utils/toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import GlassCard from '@/components/common/GlassCard';
import GlassButton from '@/components/common/GlassButton';

type WizardStep = 'booking' | 'payment' | 'confirmation';
type PaymentMethodUi = 'credit-card' | 'debit-card' | 'upi' | 'wallet';
type PersonType = 'self' | 'family';

interface BookingLocationState {
  cartItems?: Array<{
    cartItemId?: number;
    testId?: number;
    packageId?: number;
    testName?: string;
    packageName?: string;
    name?: string;
    quantity?: number;
    price?: number;
    discount?: number;
    finalPrice?: number;
  }>;
  total?: number;
  booking?: BookingResponse;
}

const TIME_SLOTS = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];

const getMinDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split('T')[0];
};

const mapPaymentMethod = (method: PaymentMethodUi): 'CARD' | 'UPI' | 'NET_BANKING' => {
  if (method === 'upi') return 'UPI';
  if (method === 'wallet') return 'NET_BANKING';
  return 'CARD';
};

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const state = (location.state || {}) as BookingLocationState;
  const { cart, fetchCart, clearCart } = useCart();
  const { currentUser } = useAuth();

  const [wizardStep, setWizardStep] = useState<WizardStep>('booking');
  const [bookingStep, setBookingStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberResponse[]>([]);
  const [addresses, setAddresses] = useState<AddressDTO[]>([]);
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState<{ code: string; discount: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodUi>('credit-card');
  const [confirmedBookingId, setConfirmedBookingId] = useState<number | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingResponse | null>(state.booking || null);
  const [confirmationNumber, setConfirmationNumber] = useState<string>('');

  const [personType, setPersonType] = useState<PersonType>('self');
  const [familyMemberId, setFamilyMemberId] = useState<number | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [addressId, setAddressId] = useState<number | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<AddressDTO>({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: false
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await fetchCart();
        const [members, userAddresses] = await Promise.all([
          familyMemberService.getFamilyMembers().catch(() => []),
          addressService.getAll().catch(() => [])
        ]);
        setFamilyMembers(members);
        setAddresses(userAddresses);
        const defaultAddress = userAddresses.find((a) => a.isDefault) || userAddresses[0];
        if (defaultAddress?.id) setAddressId(defaultAddress.id);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchCart]);

  useEffect(() => {
    const loadBookingDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const booking = await bookingService.getBookingById(Number(id));
        setConfirmedBooking(booking);
        setConfirmedBookingId(booking.id);
        setConfirmationNumber(booking.bookingReference || booking.reference || `HLTH-${booking.id}`);
        setWizardStep('confirmation');
        setScheduledDate(booking.bookingDate || booking.collectionDate || '');
        setScheduledTime(booking.timeSlot || booking.scheduledTime || '');
        if (booking.familyMemberId) {
          setPersonType('family');
          setFamilyMemberId(booking.familyMemberId);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadBookingDetails();
  }, [id]);

  const selectedItem = useMemo(() => {
    if (confirmedBooking) {
      return {
        testId: confirmedBooking.testId || confirmedBooking.labTestId,
        packageId: confirmedBooking.packageId,
        testName: confirmedBooking.testName || confirmedBooking.labTestName,
        packageName: confirmedBooking.packageName,
        name: confirmedBooking.packageName || confirmedBooking.testName || confirmedBooking.labTestName,
        price: confirmedBooking.totalAmount || confirmedBooking.finalAmount || confirmedBooking.amount
      };
    }
    const fromState = state.cartItems?.[0];
    if (fromState) return fromState;
    if (cart?.items?.length) {
      const first = cart.items[0];
      return {
        cartItemId: first.cartItemId,
        testId: first.testId,
        packageId: first.packageId,
        testName: first.testName,
        packageName: first.packageName,
        name: first.name,
        quantity: first.quantity,
        price: first.price,
        discount: first.discount,
        finalPrice: first.finalPrice
      };
    }
    return null;
  }, [confirmedBooking, state.cartItems, cart?.items]);

  const itemName = selectedItem?.packageName || selectedItem?.testName || selectedItem?.name || 'Diagnostic Arsenal';
  const originalPrice = Number(selectedItem?.price || 0);
  const baseDiscount = Math.floor(originalPrice * 0.4);
  const promoDiscount = promo?.discount || 0;
  const subtotal = Math.max(0, originalPrice - baseDiscount - promoDiscount);
  const tax = Math.floor(subtotal * 0.1);
  const total = subtotal + tax;

  const selectedAddress =
    addresses.find((a) => a.id === addressId) ||
    (confirmedBooking?.collectionAddress
      ? {
          label: 'Saved',
          street: confirmedBooking.collectionAddress,
          city: '',
          state: '',
          postalCode: ''
        }
      : undefined);
  const patientName =
    confirmedBooking?.patientName ||
    (personType === 'self'
      ? currentUser?.name || 'Self'
      : (familyMembers.find((m) => m.id === familyMemberId)?.name || 'Biosynthetic Node'));

  const validateBookingStep = () => {
    if (bookingStep === 1 && personType === 'family' && !familyMemberId) {
      notify.error('Specify family unit member');
      return false;
    }
    if (bookingStep === 2 && (!scheduledDate || !scheduledTime)) {
      notify.error('Temporal parameters required (Date/Time)');
      return false;
    }
    if (bookingStep === 3) {
      if (!addressId && !showNewAddress) {
        notify.error('Geospatial coordinate required (Address)');
        return false;
      }
      if (showNewAddress && (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.postalCode)) {
        notify.error('Incomplete coordinate metadata');
        return false;
      }
    }
    return true;
  };

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (code === 'PROMO20') {
      setPromo({ code, discount: 200 });
      notify.success('Promo sequence activated');
      return;
    }
    setPromo(null);
    notify.error('Invalid promo signature');
  };

  const handleNextBookingStep = () => {
    if (!validateBookingStep()) return;
    if (bookingStep < 3) {
      setBookingStep((s) => s + 1);
      return;
    }
    setWizardStep('payment');
  };

  const handleSaveNewAddress = async () => {
    try {
      const saved = await addressService.save(newAddress);
      setAddresses((prev) => [saved, ...prev]);
      if (saved.id) setAddressId(saved.id);
      setShowNewAddress(false);
      notify.success('Coordinate recorded');
    } catch (error) {
      console.error(error);
      notify.error('Failed to encode coordinates');
    }
  };

  const ensureAddressPersisted = async (): Promise<AddressDTO | null> => {
    if (addressId) {
      return addresses.find((a) => a.id === addressId) || null;
    }
    if (showNewAddress && newAddress.street && newAddress.city && newAddress.state && newAddress.postalCode) {
      const saved = await addressService.save(newAddress);
      setAddresses((prev) => [saved, ...prev]);
      if (saved.id) setAddressId(saved.id);
      setShowNewAddress(false);
      return saved;
    }
    return null;
  };

  const handlePayNow = async () => {
    if (!selectedItem) return;
    setPaying(true);
    try {
      const persistedAddress = await ensureAddressPersisted();
      if (!persistedAddress) {
        notify.error('Coordinate persistent failure');
        setPaying(false);
        return;
      }

      const bookingPayload: CreateBookingRequest = {
        testId: selectedItem.testId,
        packageId: selectedItem.packageId,
        familyMemberId: personType === 'family' ? familyMemberId || undefined : undefined,
        bookingDate: scheduledDate,
        timeSlot: scheduledTime,
        collectionType: 'HOME',
        collectionAddress: `${persistedAddress.street}, ${persistedAddress.city || ''}, ${persistedAddress.state || ''} ${persistedAddress.postalCode || ''}`.replace(/\s+/g, ' ').trim(),
        discount: baseDiscount + promoDiscount,
        notes: `Booked for ${patientName}`
      };

      const created = await bookingService.createBooking(bookingPayload);

      await paymentService.initiatePayment({
        bookingId: created.id,
        amount: total,
        paymentMethod: mapPaymentMethod(paymentMethod),
        paymentGateway: 'RAZORPAY',
        transactionId: `TXN-${Date.now()}`
      });

      await api.post('/api/emails/send-booking-confirmation', { bookingId: created.id }).catch(() => null);
      await clearCart().catch(() => null);

      setConfirmedBooking(created);
      setConfirmedBookingId(created.id);
      setConfirmationNumber(created.bookingReference || created.reference || `HLTH-${created.id}`);
      setWizardStep('confirmation');
      navigate(`/booking/${created.id}`, {
        replace: true,
        state: {
          booking: created
        }
      });
      notify.success('PAYMENT SUCCESSFUL | BOOKING SECURED');
    } catch (error: any) {
      console.error(error);
      notify.error(error?.message || 'Transaction failure');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
            <Loader2 className="w-12 h-12 text-cyan-600 animate-spin mx-auto mb-4" />
            <p className="text-[10px] font-black text-cyan-800/60 uppercase tracking-widest">Constructing Booking Matrix...</p>
        </div>
      </div>
    );
  }

  if (!selectedItem) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <GlassCard className="max-w-md p-12 text-center border-white/60">
          <AlertCircle className="w-16 h-16 text-rose-300 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-[#164E63] tracking-tight mb-3 uppercase">Inventory Empty</h2>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-tighter mb-10 leading-relaxed">No diagnostic protocols detected in your immediate workspace.</p>
          <GlassButton onClick={() => navigate('/tests')}>INITIATE EXTRACTION</GlassButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12 min-h-screen pb-32">
      <header className="mb-16">
          <button 
              onClick={() => navigate('/cart')}
              className="group flex items-center gap-2 text-cyan-800/60 font-black text-[10px] uppercase tracking-[0.2em] mb-8 hover:text-cyan-600 transition-colors"
          >
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              RETURN TO INVENTORY
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                          <ShieldCheck size={20} />
                      </div>
                      <span className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-cyan-800/60">
                          Terminal / Secure Booking
                      </span>
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-black text-[#164E63] tracking-tighter uppercase leading-none">
                      {wizardStep === 'confirmation' ? 'Booking Secured' : `Securing: ${itemName}`}
                  </h1>
              </div>

              {wizardStep !== 'confirmation' && (
                  <div className="flex items-center gap-6 bg-cyan-950/5 backdrop-blur-xl px-8 py-5 rounded-[32px] border border-white/40 shadow-xl shadow-cyan-900/5">
                      {[1, 2, 3, 4].map((step) => (
                          <div key={step} className="flex items-center gap-4">
                              <div className="relative">
                                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-500 ${
                                      (wizardStep === 'booking' && bookingStep === step) || (wizardStep === 'payment' && step === 4)
                                      ? 'bg-[#164E63] text-white shadow-2xl shadow-cyan-900/40 scale-110 rotate-3'
                                      : (wizardStep === 'booking' && bookingStep > step) || wizardStep === 'payment'
                                      ? 'bg-emerald-500 text-white'
                                      : 'bg-white/60 text-slate-300 border border-white/80'
                                  }`}>
                                      {((wizardStep === 'booking' && bookingStep > step) || wizardStep === 'payment') && step < 4 ? <CheckCircle2 size={20} /> : step}
                                  </div>
                                  {(wizardStep === 'booking' && bookingStep === step) && (
                                      <div className="absolute -inset-1 bg-cyan-400/20 blur-lg rounded-2xl animate-pulse" />
                                  )}
                              </div>
                              {step < 4 && <div className="w-8 h-px bg-gradient-to-r from-slate-200/50 to-transparent" />}
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main Workspace */}
          <main className="lg:col-span-8">
              <AnimatePresence mode="wait">
                  {wizardStep === 'booking' && (
                      <motion.div key="booking" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                          <GlassCard className="p-10 border-white/40 min-h-[500px] flex flex-col">
                              <div className="flex-1">
                                  {bookingStep === 1 && (
                                      <div className="space-y-10">
                                          <div>
                                              <h2 className="text-2xl font-black text-[#164E63] uppercase tracking-tight mb-2">Subject Selection</h2>
                                              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Identify target for biosample extraction</p>
                                          </div>
                                          
                                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                               <button 
                                                   onClick={() => { setPersonType('self'); setFamilyMemberId(null); }}
                                                   className={`group p-10 rounded-[48px] border-2 transition-all flex flex-col items-center gap-6 text-center glass-pane ${
                                                       personType === 'self' 
                                                       ? 'border-cyan-500 bg-cyan-500/5 text-[#164E63] shadow-2xl shadow-cyan-500/10' 
                                                       : 'border-white bg-white/40 text-slate-400 hover:border-cyan-200'
                                                   }`}
                                               >
                                                   <div className={`p-6 rounded-3xl transition-transform group-hover:scale-110 duration-500 ${personType === 'self' ? 'bg-cyan-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                                                       <User size={48} />
                                                   </div>
                                                   <div>
                                                       <span className="block text-2xl font-black uppercase tracking-tight mb-1">Personal Terminal</span>
                                                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">{currentUser?.name}</span>
                                                   </div>
                                               </button>

                                               <button 
                                                   onClick={() => setPersonType('family')}
                                                   className={`group p-10 rounded-[48px] border-2 transition-all flex flex-col items-center gap-6 text-center glass-pane ${
                                                       personType === 'family' 
                                                       ? 'border-[#164E63] bg-[#164E63]/5 text-[#164E63] shadow-2xl shadow-cyan-900/10' 
                                                       : 'border-white bg-white/40 text-slate-400 hover:border-cyan-200'
                                                   }`}
                                               >
                                                   <div className={`p-6 rounded-3xl transition-transform group-hover:scale-110 duration-500 ${personType === 'family' ? 'bg-[#164E63] text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                                                       <Users size={48} />
                                                   </div>
                                                   <div>
                                                       <span className="block text-2xl font-black uppercase tracking-tight mb-1">Family Unit</span>
                                                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">Managed Nodes</span>
                                                   </div>
                                               </button>
                                           </div>

                                          <AnimatePresence>
                                              {personType === 'family' && (
                                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
                                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Select Managed Member</label>
                                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                          {familyMembers.map((member) => (
                                                              <button 
                                                                  key={member.id}
                                                                  onClick={() => setFamilyMemberId(member.id)}
                                                                  className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                                                                      familyMemberId === member.id 
                                                                      ? 'border-cyan-500 bg-white text-[#164E63] shadow-lg' 
                                                                      : 'border-white bg-white/50 text-slate-500 hover:bg-white'
                                                                  }`}
                                                              >
                                                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${familyMemberId === member.id ? 'bg-cyan-500 text-white' : 'bg-slate-100'}`}>
                                                                      <User size={18} />
                                                                  </div>
                                                                  <div className="text-left">
                                                                      <span className="block text-sm font-black uppercase tracking-tight leading-none mb-1">{member.name}</span>
                                                                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{member.relation}</span>
                                                                  </div>
                                                              </button>
                                                          ))}
                                                      </div>
                                                  </motion.div>
                                              )}
                                          </AnimatePresence>
                                      </div>
                                  )}

                                  {bookingStep === 2 && (
                                      <div className="space-y-10">
                                          <div>
                                              <h2 className="text-2xl font-black text-[#164E63] uppercase tracking-tight mb-2">Temporal Sync</h2>
                                              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Select extraction window from centralized grid</p>
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                              <div>
                                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Available Sequences (Date)</label>
                                                  <GlassCard className="p-2 border-white bg-white/30">
                                                      <input 
                                                          type="date" 
                                                          min={getMinDate()}
                                                          value={scheduledDate}
                                                          onChange={(e) => setScheduledDate(e.target.value)}
                                                          className="w-full bg-transparent border-none p-4 text-xl font-black text-[#164E63] outline-none"
                                                      />
                                                  </GlassCard>
                                              </div>

                                              <div>
                                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Operation Window (Slot)</label>
                                                  <div className="grid grid-cols-2 gap-4">
                                                      {TIME_SLOTS.map((slot) => (
                                                          <button 
                                                              key={slot}
                                                              onClick={() => setScheduledTime(slot)}
                                                              className={`p-4 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-widest ${
                                                                  scheduledTime === slot
                                                                  ? 'bg-[#164E63] text-white border-[#164E63] shadow-lg scale-[1.02]'
                                                                  : 'bg-white/50 text-slate-400 border-white hover:border-cyan-200'
                                                              }`}
                                                          >
                                                              {slot}
                                                          </button>
                                                      ))}
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  )}

                                  {bookingStep === 3 && (
                                      <div className="space-y-10">
                                          <div className="flex justify-between items-start">
                                              <div>
                                                  <h2 className="text-2xl font-black text-[#164E63] uppercase tracking-tight mb-2">Coordinate Selection</h2>
                                                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Identify landing coordinate for phlebotomy drone</p>
                                              </div>
                                              <GlassButton variant="secondary" className="text-[10px] py-3" onClick={() => setShowNewAddress(!showNewAddress)}>
                                                  {showNewAddress ? 'SCAN SAVED' : 'ADD COORDINATE'}
                                              </GlassButton>
                                          </div>

                                          <AnimatePresence mode="wait">
                                              {showNewAddress ? (
                                                  <motion.div key="new" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                                                      <div className="grid grid-cols-2 gap-4">
                                                          <input className="bg-white/50 border border-white rounded-2xl p-4 text-[11px] font-black uppercase text-[#164E63] outline-none placeholder:text-slate-300" placeholder="Label (Home/Work)" value={newAddress.label} onChange={(e) => setNewAddress(p => ({ ...p, label: e.target.value }))} />
                                                          <input className="bg-white/50 border border-white rounded-2xl p-4 text-[11px] font-black uppercase text-[#164E63] outline-none placeholder:text-slate-300" placeholder="Street / Sector" value={newAddress.street} onChange={(e) => setNewAddress(p => ({ ...p, street: e.target.value }))} />
                                                      </div>
                                                      <div className="grid grid-cols-3 gap-4">
                                                          <input className="bg-white/50 border border-white rounded-2xl p-4 text-[11px] font-black uppercase text-[#164E63] outline-none" placeholder="City" value={newAddress.city || ''} onChange={(e) => setNewAddress(p => ({ ...p, city: e.target.value }))} />
                                                          <input className="bg-white/50 border border-white rounded-2xl p-4 text-[11px] font-black uppercase text-[#164E63] outline-none" placeholder="State" value={newAddress.state || ''} onChange={(e) => setNewAddress(p => ({ ...p, state: e.target.value }))} />
                                                          <input className="bg-white/50 border border-white rounded-2xl p-4 text-[11px] font-black uppercase text-[#164E63] outline-none" placeholder="Postal Code" value={newAddress.postalCode || ''} onChange={(e) => setNewAddress(p => ({ ...p, postalCode: e.target.value }))} />
                                                      </div>
                                                      <GlassButton className="w-full py-5" onClick={handleSaveNewAddress}>ENCODE & SAVE</GlassButton>
                                                  </motion.div>
                                              ) : (
                                                  <motion.div key="saved" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                      {addresses.map((addr) => (
                                                          <button 
                                                              key={addr.id}
                                                              onClick={() => setAddressId(addr.id || null)}
                                                              className={`flex items-start gap-4 p-6 rounded-[32px] border-2 transition-all text-left ${
                                                                  addressId === addr.id 
                                                                  ? 'border-emerald-500 bg-white text-[#164E63]' 
                                                                  : 'border-white bg-white/20 text-slate-500 hover:bg-white'
                                                              }`}
                                                          >
                                                              <div className={`p-3 rounded-xl shrink-0 ${addressId === addr.id ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                                                                  <MapPin size={20} />
                                                              </div>
                                                              <div>
                                                                  <div className="flex items-center gap-2 mb-1">
                                                                       <span className="text-sm font-black uppercase tracking-tight">{addr.label}</span>
                                                                       {addr.isDefault && <span className="text-[8px] font-black bg-cyan-100 text-cyan-600 px-1.5 py-0.5 rounded uppercase">Primary</span>}
                                                                  </div>
                                                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter line-clamp-2 leading-normal">
                                                                      {addr.street}, {addr.city}, {addr.state} {addr.postalCode}
                                                                  </p>
                                                              </div>
                                                          </button>
                                                      ))}
                                                  </motion.div>
                                              )}
                                          </AnimatePresence>
                                      </div>
                                  )}
                              </div>

                              <div className="mt-20 pt-10 border-t border-slate-100/50 flex flex-col md:flex-row justify-between gap-6">
                                  <GlassButton 
                                      variant="secondary" 
                                      className="py-5 px-10 order-2 md:order-1" 
                                      disabled={bookingStep === 1}
                                      onClick={() => setBookingStep(s => Math.max(1, s - 1))}
                                  >
                                      PREVIOUS PHASE
                                  </GlassButton>
                                  <GlassButton 
                                      className="py-5 px-20 order-1 md:order-2"
                                      onClick={handleNextBookingStep}
                                      icon={<ChevronRight size={18} />}
                                  >
                                      {bookingStep === 3 ? 'PROCEED TO SETTLEMENT' : 'VALIDATE & CONTINUE'}
                                  </GlassButton>
                              </div>
                          </GlassCard>
                      </motion.div>
                  )}

                  {wizardStep === 'payment' && (
                      <motion.div key="payment" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                          <GlassCard className="p-10 border-white/40">
                              <div className="mb-12">
                                  <h2 className="text-3xl font-black text-[#164E63] uppercase tracking-tight mb-2 text-center">Settlement Protocol</h2>
                                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">Confirm payload settlement via encrypted gateway</p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                                  {(['credit-card', 'debit-card', 'upi', 'wallet'] as PaymentMethodUi[]).map((m) => (
                                      <button 
                                          key={m}
                                          onClick={() => setPaymentMethod(m)}
                                          className={`flex items-center gap-4 p-6 rounded-3xl border-2 transition-all ${
                                            paymentMethod === m
                                            ? 'border-[#164E63] bg-white text-[#164E63] shadow-xl'
                                            : 'border-white bg-white/20 text-slate-400 hover:bg-white'
                                          }`}
                                      >
                                          <div className={`p-3 rounded-xl ${paymentMethod === m ? 'bg-[#164E63] text-white' : 'bg-slate-100'}`}>
                                              <CreditCard size={20} />
                                          </div>
                                          <span className="text-sm font-black uppercase tracking-widest">{m.replace('-', ' ')}</span>
                                          {paymentMethod === m && <CheckCircle2 size={18} className="ml-auto text-emerald-500" />}
                                      </button>
                                  ))}
                              </div>

                              <div className="p-8 bg-emerald-50 rounded-[32px] border border-emerald-100 flex items-center gap-6 mb-12">
                                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-50 shrink-0">
                                      <ShieldCheck size={32} />
                                  </div>
                                  <div>
                                      <h4 className="text-sm font-black text-emerald-800 uppercase tracking-widest mb-1 leading-none">AIP-256 Encrypted</h4>
                                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Your financial sequence is proxied through a 100% secure tactical layer.</p>
                                  </div>
                              </div>

                              <div className="flex gap-4">
                                  <GlassButton variant="secondary" className="flex-1 py-5" onClick={() => setWizardStep('booking')}>CANCEL</GlassButton>
                                  <GlassButton 
                                      className="flex-[2] py-5 text-lg" 
                                      onClick={handlePayNow}
                                      disabled={paying}
                                      icon={paying ? <Loader2 size={24} className="animate-spin" /> : <Zap size={24} />}
                                  >
                                      {paying ? 'PROCESSING...' : `AUTHORIZE ₹${total}`}
                                  </GlassButton>
                              </div>
                          </GlassCard>
                      </motion.div>
                  )}

                  {wizardStep === 'confirmation' && (
                      <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                          <GlassCard className="p-16 border-white/80 bg-white/40 text-center flex flex-col items-center shadow-2xl shadow-emerald-900/10">
                              <div className="w-24 h-24 bg-emerald-500 rounded-[40px] flex items-center justify-center text-white mb-8 shadow-xl shadow-emerald-500/30">
                                  <CheckCircle2 size={48} />
                              </div>
                              <h2 className="text-4xl font-black text-[#164E63] tracking-tighter uppercase mb-4 leading-none">Protocol Confirmed</h2>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-12">SID: {confirmationNumber || '---'}</p>

                              <div className="w-full max-w-xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                                  <div className="p-6 bg-white/60 rounded-[32px] border border-white text-left">
                                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Subject</span>
                                      <p className="text-xl font-black text-[#164E63] tracking-tight uppercase leading-none">{confirmedBooking?.patientName || patientName}</p>
                                  </div>
                                  <div className="p-6 bg-white/60 rounded-[32px] border border-white text-left">
                                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">Temporal Slot</span>
                                      <p className="text-xl font-black text-[#164E63] tracking-tight uppercase leading-none">
                                          {confirmedBooking?.bookingDate || confirmedBooking?.collectionDate || scheduledDate} / {confirmedBooking?.timeSlot || confirmedBooking?.scheduledTime || scheduledTime}
                                      </p>
                                  </div>
                                  <div className="p-6 bg-white/60 rounded-[32px] border border-white text-left md:col-span-2">
                                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">Landing Coordinate</span>
                                      <p className="text-sm font-black text-[#164E63] tracking-tight uppercase leading-normal">
                                          {confirmedBooking?.collectionAddress || (selectedAddress ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.postalCode}` : 'MANUAL INPUT COORDINATE')}
                                      </p>
                                  </div>
                              </div>

                              <div className="flex flex-wrap justify-center gap-4">
                                  <GlassButton onClick={() => navigate('/bookings')} icon={<ShoppingCart size={18} />}>MY PROTOCOLS</GlassButton>
                                  <GlassButton variant="secondary" onClick={() => window.print()} icon={<Printer size={18} />}>EXTRACT PDF</GlassButton>
                                  <GlassButton variant="tertiary" onClick={() => navigate('/')} icon={<Home size={18} />}>HUB CENTRAL</GlassButton>
                              </div>
                          </GlassCard>
                      </motion.div>
                  )}
              </AnimatePresence>
          </main>

          {/* Sidebar Area */}
          <aside className="lg:col-span-4 space-y-8">
              <GlassCard className="p-10 border-white/60 sticky top-12 bg-white/60 glass-pane shadow-2xl shadow-cyan-900/5">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 border-b border-slate-100/50 pb-4">Payload Summary</h3>
                    
                    <div className="space-y-8 mb-12">
                        <div className="flex items-start gap-4 p-6 bg-cyan-500/5 rounded-3xl border border-cyan-500/10">
                            <div className="p-3 bg-cyan-500 text-white rounded-2xl shadow-lg shadow-cyan-900/10 shrink-0">
                                <ShoppingCart size={20} />
                            </div>
                            <div>
                                <span className="block text-[8px] font-black text-cyan-600/60 uppercase tracking-widest mb-1">Diagnostic Bundle</span>
                                <p className="text-xl font-black text-[#164E63] tracking-tighter uppercase leading-tight">{itemName}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4 pt-10 border-t border-slate-100/50">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                <span className="text-slate-400">Net Payload</span>
                                <span className="text-[#164E63] font-black">₹{originalPrice}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                                <span>Tier Offset (40%)</span>
                                <span className="font-black">-₹{baseDiscount}</span>
                            </div>
                            {promo && (
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-cyan-600">
                                    <span>Signature ({promo.code})</span>
                                    <span className="font-black">-₹{promo.discount}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                <span className="text-slate-400">System Tax (10%)</span>
                                <span className="text-[#164E63] font-black">₹{tax}</span>
                            </div>
                            <div className="pt-6 mt-6 border-t-2 border-slate-100 flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest mb-1">Settlement Total</span>
                                    <span className="text-[14px] font-black text-[#164E63] uppercase tracking-[0.1em]">Total Due</span>
                                </div>
                                <span className="text-5xl font-black text-[#164E63] tracking-tighter leading-none">₹{total}</span>
                            </div>
                        </div>
                    </div>

                   {wizardStep !== 'confirmation' && (
                       <div className="space-y-6">
                           <div>
                               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Promotion Signature</label>
                               <div className="flex gap-2">
                                   <input 
                                       value={promoInput}
                                       onChange={(e) => setPromoInput(e.target.value)}
                                       placeholder="PROMO20"
                                       className="flex-1 bg-white/50 border border-white rounded-xl px-4 py-3 text-sm font-bold text-[#164E63] outline-none focus:border-cyan-400 transition-all placeholder:text-slate-200"
                                   />
                                   <GlassButton variant="secondary" className="px-6 py-3 text-[10px]" onClick={handleApplyPromo}>APPLY</GlassButton>
                               </div>
                           </div>
                       </div>
                   )}
              </GlassCard>
              
              <div className="px-10">
                  <div className="flex items-center gap-3 mb-4">
                      <ShieldCheck size={16} className="text-emerald-500" />
                      <span className="text-[10px] font-black text-[#164E63] uppercase tracking-widest">Security Override Active</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-300 uppercase leading-relaxed tracking-widest">All diagnostic bookings are processed through the HLTH-v3 encrypted neural gateway. Biometric data isolation is guaranteed.</p>
              </div>
          </aside>
      </div>
    </div>
  );
};

export default BookingPage;
