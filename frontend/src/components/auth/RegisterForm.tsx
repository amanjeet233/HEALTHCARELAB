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
        <form onSubmit={handleRegisterSubmit(onRegisterSubmit as any)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                    <AuthInput label="Full Name" icon={<FaUser />} error={registerErrors.name} {...registerFields('name')} placeholder="JOHN DOE" />
                </div>

                <AuthInput label="Email Address" icon={<FaEnvelope />} error={registerErrors.email} {...registerFields('email')} placeholder="UID@BIO.OS" type="email" />
                <AuthInput label="Cellular Link" icon={<FaPhone />} error={registerErrors.phone} {...registerFields('phone')} placeholder="+91 XXXXX XXXXX" />

                <AuthInput label="Secure Passcode" icon={<FaLock />} error={registerErrors.password} {...registerFields('password')} placeholder="••••••••" type="password" />
                <AuthInput label="Verify Passcode" icon={<FaLock />} error={registerErrors.confirmPassword} {...registerFields('confirmPassword')} placeholder="••••••••" type="password" />

                <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-gray/60 px-1">Network Role</label>
                    <div className="relative">
                        <select
                            {...registerFields('role')}
                            className="w-full bg-off-white border border-primary-teal/10 focus:border-primary-teal focus:ring-4 focus:ring-primary-teal/5 rounded-2xl py-4 px-6 text-[11px] font-black text-ever-green outline-none transition-all uppercase tracking-widest appearance-none cursor-pointer"
                        >
                            <option value="PATIENT">Biological User</option>
                            <option value="MEDICAL_OFFICER">Clinical Specialist</option>
                            <option value="TECHNICIAN">Diagnostic Entity</option>
                        </select>
                        <FaChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] text-primary-teal rotate-90 pointer-events-none opacity-40" />
                    </div>
                </div>

                {selectedRole === 'PATIENT' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5"
                    >
                        <AuthInput label="Geo-Location" icon={<FaMapMarkerAlt />} error={registerErrors.address} {...registerFields('address')} placeholder="CITY, COUNTRY" />
                        <AuthInput label="Birthday" icon={<FaBirthdayCake />} error={registerErrors.dateOfBirth} {...registerFields('dateOfBirth')} type="date" />
                    </motion.div>
                )}
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-teal text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-lg shadow-primary-teal/10 hover:shadow-primary-teal/20 transition-all flex items-center justify-center gap-4 mt-2 active:scale-95 disabled:opacity-50"
            >
                {isSubmitting ? <LoadingSpinner size="sm" /> : <>AUTHENTICATE SECURE ACCOUNT <FaChevronRight className="text-[10px]" /></>}
            </button>
        </form>
    );
};

export default RegisterForm;
