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
        <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-3">
            <AuthInput
                label="Email"
                icon={<FaEnvelope />}
                error={loginErrors.email}
                {...loginFields('email')}
                placeholder="YOU@EXAMPLE.COM"
                type="email"
            />
            <AuthInput
                label="Password"
                icon={<FaLock />}
                error={loginErrors.password}
                {...loginFields('password')}
                placeholder="••••••••"
                type="password"
            />

            <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1 block">Role</label>
                <div className="relative">
                    <select
                        {...loginFields('role')}
                        className="w-full h-10 bg-white border border-slate-200 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 rounded-xl py-2 px-3 text-[12px] font-semibold text-slate-700 outline-none transition-all uppercase tracking-[0.08em] appearance-none cursor-pointer"
                    >
                        <option value="PATIENT">Patient</option>
                        <option value="MEDICAL_OFFICER">Medical Officer</option>
                        <option value="TECHNICIAN">Technician</option>
                        <option value="ADMIN">System Administrator</option>
                    </select>
                    <FaChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 rotate-90 pointer-events-none" />
                </div>
            </div>

            <div className="flex justify-end pr-1">
                <button type="button" onClick={onForgotPassword} className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#008080] hover:opacity-80 transition-all">
                    Forgot Password?
                </button>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#008080] h-10 rounded-2xl text-white font-bold text-[12px] tracking-[0.08em] uppercase transition-all hover:brightness-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isSubmitting ? <LoadingSpinner size="sm" /> : <>Sign In <FaChevronRight className="text-[10px]" /></>}
            </button>
        </form>
    );
};

export default LoginForm;
