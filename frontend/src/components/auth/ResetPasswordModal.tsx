import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaLock, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

interface Props {
    onSuccess: () => void;
}

const ResetPasswordModal: React.FC<Props> = ({ onSuccess }) => {
    const { resetPassword } = useAuth();
    const [passcode, setPasscode] = useState('');
    const [confirm, setConfirm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passcode !== confirm) return;
        setIsSubmitting(true);
        try {
            await resetPassword('placeholder-token', passcode);
            onSuccess();
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
            className="space-y-6"
        >
            <div className="text-center space-y-2">
                <h4 className="text-xl font-black uppercase tracking-tighter text-ever-green italic">RESET PROTOCOL</h4>
                <p className="text-[10px] text-muted-gray font-bold uppercase tracking-widest leading-loose max-w-[300px] mx-auto opacity-70">
                    Reconfigure your secure neural passcode.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="group space-y-2 px-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-gray/60 px-1">New Passcode</label>
                    <div className="relative">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 transition-colors text-sm pointer-events-none text-muted-gray group-focus-within:text-primary-teal opacity-60">
                            <FaLock />
                        </div>
                        <input
                            type="password"
                            required
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-off-white border-2 border-primary-teal/5 focus:border-primary-teal/20 focus:bg-white focus:ring-4 focus:ring-primary-teal/5 rounded-2xl py-4 pl-14 pr-6 text-[11px] font-bold text-ever-green outline-none transition-all placeholder:text-muted-gray/30 h-14"
                        />
                    </div>
                </div>

                <div className="group space-y-2 px-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-gray/60 px-1">Confirm Configuration</label>
                    <div className="relative">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 transition-colors text-sm pointer-events-none text-muted-gray group-focus-within:text-primary-teal opacity-60">
                            <FaLock />
                        </div>
                        <input
                            type="password"
                            required
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-off-white border-2 border-primary-teal/5 focus:border-primary-teal/20 focus:bg-white focus:ring-4 focus:ring-primary-teal/5 rounded-2xl py-4 pl-14 pr-6 text-[11px] font-bold text-ever-green outline-none transition-all placeholder:text-muted-gray/30 h-14"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || passcode !== confirm}
                    className="w-full bg-primary-teal text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-lg shadow-primary-teal/20 hover:shadow-primary-teal/30 transition-all active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50"
                >
                    {isSubmitting ? <LoadingSpinner size="sm" /> : <>UPDATE PASSCODE <FaChevronRight className="text-[10px]" /></>}
                </button>
            </form>
        </motion.div>
    );
};

export default ResetPasswordModal;
