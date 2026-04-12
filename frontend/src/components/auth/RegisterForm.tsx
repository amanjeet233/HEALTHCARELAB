import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaLock, FaEnvelope, FaMapMarkerAlt, FaChevronRight, FaPhone, FaUser, FaBirthdayCake } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useModal } from '../../context/ModalContext';
import type { RegisterRequest } from '../../types/auth';
import LoadingSpinner from '../common/LoadingSpinner';
import AuthInput from './AuthInput';

const phoneRegExp = /^(\+91[-\s]?)?[6789]\d{9}$/;

const registerSchema = yup.object().shape({
    name: yup.string().required('Full name required'),
    email: yup.string().email('Valid email required').required('Email required'),
    phone: yup.string().matches(phoneRegExp, 'Invalid phone number').required('Phone required'),
    password: yup.string()
        .required('Password required')
        .min(8, 'Minimum 8 characters')
        .matches(/[a-z]/, 'Add lowercase')
        .matches(/[A-Z]/, 'Add uppercase')
        .matches(/[0-9]/, 'Add number'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password')], 'Passwords match failure')
        .required('Confirm required'),
    role: yup.string().oneOf(['PATIENT', 'MEDICAL_OFFICER', 'TECHNICIAN']).required('Role required'),
    address: yup.string().when('role', {
        is: 'PATIENT',
        then: (schema) => schema.required('Address required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    dateOfBirth: yup.string().when('role', {
        is: 'PATIENT',
        then: (schema) => schema.required('DOB required'),
        otherwise: (schema) => schema.notRequired(),
    })
});

type RegisterInputs = yup.InferType<typeof registerSchema>;

const RegisterForm: React.FC = () => {
    const { register: registerUser } = useAuth();
    const { closeModal } = useModal();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const {
        register: registerFields,
        handleSubmit: handleRegisterSubmit,
        watch: watchRegister,
        formState: { errors: registerErrors },
        reset: resetRegister
    } = useForm<RegisterInputs | any>({
        resolver: yupResolver(registerSchema) as any,
        defaultValues: { role: 'PATIENT' } as RegisterInputs
    });

    const selectedRole = watchRegister('role');

    const onRegisterSubmit = async (data: RegisterInputs) => {
        setIsSubmitting(true);
        try {
            await registerUser(data as unknown as RegisterRequest);
            closeModal();
            resetRegister();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleRegisterSubmit(onRegisterSubmit as any)} className="space-y-3">
            <div className="grid grid-cols-2 max-[520px]:grid-cols-1 gap-3">
                <AuthInput label="Full Name" icon={<FaUser />} error={registerErrors.name} {...registerFields('name')} placeholder="YOUR NAME" />
                <AuthInput label="Email" icon={<FaEnvelope />} error={registerErrors.email} {...registerFields('email')} placeholder="YOU@EXAMPLE.COM" type="email" />
                <AuthInput label="Phone" icon={<FaPhone />} error={registerErrors.phone} {...registerFields('phone')} placeholder="+91 XXXXX XXXXX" />
                <AuthInput label="Password" icon={<FaLock />} error={registerErrors.password} {...registerFields('password')} placeholder="••••••••" type="password" />
                <AuthInput label="Confirm Password" icon={<FaLock />} error={registerErrors.confirmPassword} {...registerFields('confirmPassword')} placeholder="••••••••" type="password" />

                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1 block">Role</label>
                    <div className="relative">
                        <select
                            {...registerFields('role')}
                            className="w-full h-11 bg-white border border-slate-200 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 rounded-xl py-2.5 px-3 text-[13px] font-semibold text-slate-700 outline-none transition-all uppercase tracking-[0.08em] appearance-none cursor-pointer"
                        >
                            <option value="PATIENT">Patient</option>
                            <option value="MEDICAL_OFFICER">Medical Officer</option>
                            <option value="TECHNICIAN">Technician</option>
                        </select>
                        <FaChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 rotate-90 pointer-events-none" />
                    </div>
                </div>
            </div>

            {selectedRole === 'PATIENT' && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-2 max-[520px]:grid-cols-1 gap-3"
                >
                    <AuthInput label="Address" icon={<FaMapMarkerAlt />} error={registerErrors.address} {...registerFields('address')} placeholder="CITY, COUNTRY" />
                    <AuthInput label="Date Of Birth" icon={<FaBirthdayCake />} error={registerErrors.dateOfBirth} {...registerFields('dateOfBirth')} type="date" />
                </motion.div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#008080] h-10 rounded-2xl text-white font-bold text-[12px] tracking-[0.08em] uppercase transition-all hover:brightness-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isSubmitting ? <LoadingSpinner size="sm" /> : <>Create An Account <FaChevronRight className="text-[10px]" /></>}
            </button>
        </form>
    );
};

export default RegisterForm;
