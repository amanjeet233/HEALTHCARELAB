import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal } from '../../context/ModalContext';
import ForgotPasswordModal from './ForgotPasswordModal';
import ResetPasswordModal from './ResetPasswordModal';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthModal: React.FC = () => {
    const { activeModal, closeModal, authModalTab, setAuthModalTab } = useModal();

    const isOpen = activeModal === 'AUTH';

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeModal();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, closeModal]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop Layer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={closeModal}
                    className="absolute inset-0 bg-ever-green/25 backdrop-blur-[2px]"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 0 }} // Removed y offset to prevent viewport gaps
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 350 }}
                    className="relative w-[92%] max-w-[520px] bg-white rounded-[2.5rem] shadow-radical overflow-hidden border border-white/40 flex flex-col max-h-[94vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* High-Contrast Close Button */}
                    <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 p-2.5 bg-ever-green/10 rounded-xl text-ever-green hover:bg-ever-green hover:text-white transition-all z-50 shadow-sm"
                        aria-label="Close modal"
                    >
                        <FaTimes className="text-sm" />
                    </button>

                    {/* Header Block */}
                    <div className="bg-ever-green pt-8 pb-10 px-8 text-white relative overflow-hidden shrink-0">
                        {/* Medical Grid Background Ornament */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

                        <div className="relative z-10">
                            <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none">
                                HEALTH<span className="text-secondary tracking-[-0.05em] ml-0.5">LAB OS</span>
                            </h3>
                            <div className="flex items-center gap-2 mt-2 opacity-60">
                                <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse shadow-[0_0_8px_rgba(131,178,191,0.5)]" />
                                <p className="text-[9px] font-black uppercase tracking-[0.3em]">
                                    SECURE ACCESS TERMINAL
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form Component Scroller */}
                    <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar flex-1">
                        {/* Pro Tab Navigation */}
                        <div className="flex bg-primary-teal/5 p-1 rounded-2xl mb-8 relative">
                            {['login', 'register'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setAuthModalTab(tab as 'login' | 'register')}
                                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative z-10 ${authModalTab === tab ? 'text-white' : 'text-ever-green/50 hover:text-ever-green'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                            <motion.div
                                className="absolute inset-y-1 bg-primary-teal rounded-[12px] shadow-sm z-0"
                                initial={false}
                                animate={{
                                    left: authModalTab === 'login' ? '4px' : 'calc(50% + 2px)',
                                    right: authModalTab === 'login' ? 'calc(50% + 2px)' : '4px'
                                }}
                                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                            />
                        </div>

                        <AnimatePresence mode="wait">
                            {authModalTab === 'login' ? (
                                <motion.div
                                    key="login"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <LoginForm onForgotPassword={() => setAuthModalTab('forgot-password')} />
                                </motion.div>
                            ) : authModalTab === 'register' ? (
                                <motion.div
                                    key="register"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <RegisterForm />
                                </motion.div>
                            ) : authModalTab === 'forgot-password' ? (
                                <ForgotPasswordModal onBack={() => setAuthModalTab('login')} />
                            ) : authModalTab === 'reset-password' ? (
                                <ResetPasswordModal onSuccess={() => setAuthModalTab('login')} />
                            ) : null}
                        </AnimatePresence>

                        {/* Footer Subtitle */}
                        {['login', 'register'].includes(authModalTab) && (
                            <div className="mt-10 text-center pt-8 border-t border-primary-teal/5">
                                <p className="text-[11px] font-black text-muted-gray/50 uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                                    {authModalTab === 'login' ? "Account not established?" : "Already synced?"}
                                    <button
                                        onClick={() => setAuthModalTab(authModalTab === 'login' ? 'register' : 'login')}
                                        className="text-primary-teal hover:underline decoration-2 underline-offset-4 decoration-primary-teal/30"
                                    >
                                        {authModalTab === 'login' ? "REGISTER SECURE ACCOUNT" : "AUTHENTICATE ACCESS"}
                                    </button>
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div >
        </AnimatePresence >
    );
};

export default AuthModal;

