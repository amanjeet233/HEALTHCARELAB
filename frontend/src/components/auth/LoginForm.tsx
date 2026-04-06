import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaLock, FaEnvelope, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useModal } from '../../context/ModalContext';
import type { LoginRequest } from '../../types/auth';
import LoadingSpinner from '../common/LoadingSpinner';
import AuthInput from './AuthInput';

const loginSchema = yup.object({
    email: yup.string().email('Valid email required').required('Email required'),
    password: yup.string().required('Password required'),
    role: yup.string().oneOf(['PATIENT', 'MEDICAL_OFFICER', 'TECHNICIAN', 'ADMIN']).required(),
}).required();

interface LoginFormProps {
    onForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onForgotPassword }) => {
    const { login } = useAuth();
    const { closeModal } = useModal();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const {
        register: loginFields,
        handleSubmit: handleLoginSubmit,
        formState: { errors: loginErrors },
        reset: resetLogin
    } = useForm<LoginRequest>({
        resolver: yupResolver(loginSchema) as any,
        defaultValues: { role: 'PATIENT' } as LoginRequest
    });

    const onLoginSubmit = async (data: LoginRequest) => {
        setIsSubmitting(true);
        try {
            await login(data);
            closeModal();
            resetLogin();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-5">
            <AuthInput
                label="Secure ID (Email)"
                icon={<FaEnvelope />}
                error={loginErrors.email}
                {...loginFields('email')}
                placeholder="user@healthlab.os"
                type="email"
            />
            <AuthInput
                label="Secure Passcode (Password)"
                icon={<FaLock />}
                error={loginErrors.password}
                {...loginFields('password')}
                placeholder="••••••••"
                type="password"
            />

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-gray/60 px-1">Access Tier</label>
                <div className="relative">
                    <select
                        {...loginFields('role')}
                        className="w-full bg-off-white border border-primary-teal/10 focus:border-primary-teal focus:ring-4 focus:ring-primary-teal/5 rounded-2xl py-4 px-6 text-[11px] font-black text-ever-green outline-none transition-all uppercase tracking-widest appearance-none cursor-pointer"
                    >
                        <option value="PATIENT">User Patient</option>
                        <option value="MEDICAL_OFFICER">Medical Officer</option>
                        <option value="TECHNICIAN">Laboratory Specialist</option>
                        <option value="ADMIN">System Administrator</option>
                    </select>
                    <FaChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] text-primary-teal rotate-90 pointer-events-none opacity-40" />
                </div>
            </div>

            <div className="flex justify-end pr-1">
                <button type="button" onClick={onForgotPassword} className="text-[10px] font-black uppercase tracking-widest text-primary-teal/60 hover:text-primary-teal transition-all">
                    Forgot Key?
                </button>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-teal text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-lg shadow-primary-teal/10 hover:shadow-primary-teal/20 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
            >
                {isSubmitting ? <LoadingSpinner size="sm" /> : <>AUTHENTICATE ACCESS <FaChevronRight className="text-[10px]" /></>}
            </button>
        </form>
    );
};

export default LoginForm;
