import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

interface Props {
    onBack: () => void;
}

const ForgotPasswordModal: React.FC<Props> = ({ onBack }) => {
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await forgotPassword(email);
            setIsSent(true);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
        >
            <div className="text-center space-y-2">
                <h4 className="text-xl font-black uppercase tracking-tighter text-ever-green italic">RECOVERY PROTOCOL</h4>
                <p className="text-[10px] text-muted-gray font-bold uppercase tracking-widest leading-loose max-w-[300px] mx-auto opacity-70">
                    {isSent
                        ? "A recovery signal has been transmitted to your secure ID."
                        : "Transmit your identifier to re-establish neural link access."}
                </p>
            </div>

            {!isSent ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="group space-y-2 px-1">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-gray/60 px-1">Verification Email</label>
                        <div className="relative">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 transition-colors text-sm pointer-events-none text-muted-gray group-focus-within:text-primary-teal opacity-60">
                                <FaEnvelope />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="UID@RECOVERY.OS"
                                className="w-full bg-off-white border-2 border-primary-teal/5 focus:border-primary-teal/20 focus:bg-white focus:ring-4 focus:ring-primary-teal/5 rounded-2xl py-4 pl-14 pr-6 text-[11px] font-bold text-ever-green outline-none transition-all placeholder:text-muted-gray/30 h-14"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-ever-green text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-lg hover:bg-primary-teal transition-all active:scale-95 flex items-center justify-center gap-4"
                    >
                        {isSubmitting ? <LoadingSpinner size="sm" /> : <>SEND PING SIGNAL <FaChevronRight className="text-[10px]" /></>}
                    </button>
                </form>
            ) : (
                <div className="bg-primary-teal/5 border border-primary-teal/10 rounded-2xl p-6 text-center space-y-4">
                    <div className="w-12 h-12 bg-primary-teal/10 rounded-full flex items-center justify-center mx-auto text-primary-teal">
                        <FaEnvelope className="text-xl animate-bounce" />
                    </div>
                    <p className="text-[11px] font-black text-ever-green uppercase tracking-widest leading-relaxed">
                        Transmission Complete. <br />Check your neural inbox.
                    </p>
                </div>
            )}

            <button
                onClick={onBack}
                className="w-full text-center text-[10px] font-black uppercase tracking-widest text-primary-teal hover:underline decoration-2 underline-offset-4"
            >
                Return to Access Gateway
            </button>
        </motion.div>
    );
};

export default ForgotPasswordModal;
