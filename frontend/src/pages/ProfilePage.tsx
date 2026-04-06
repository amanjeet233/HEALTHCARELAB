import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Activity, ShieldCheck } from 'lucide-react';
import { healthDataService, type HealthProfile } from '../services/healthDataService';
import HealthProfileSection from '../components/profile/HealthProfileSection';
import HealthDataForm from '../components/profile/HealthDataForm';
import QuizHistorySection from '../components/quiz/QuizHistorySection';
import { notify } from '../utils/toast';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<HealthProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'biometrics' | 'history'>('biometrics');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await healthDataService.getHealthData();
            setProfile(data);
        } catch (error) {
            notify.error('Failed to load health telemetry.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (updatedData: Partial<HealthProfile>) => {
        try {
            const result = await healthDataService.updateHealthData(updatedData);
            setProfile(result);
            setIsEditing(false);
            notify.success('Health profile synchronized successfully.');
        } catch (error) {
            notify.error('Failed to update telemetry node.');
        }
    };

    if (isLoading) {
        return (
            <div className="profile-loading">
                <div className="loading-spinner">
                    <div className="spinner-ring" />
                    <Activity className="spinner-icon" />
                </div>
                <span className="loading-text">
                    Loading Health Profile...
                </span>
            </div>
        );
    }

    return (
        <div className="profile-page">
            {/* Page Header */}
            <div className="profile-header">
                <div className="profile-header-left">
                    {/* Header Badge */}
                    <div className="profile-header-badge">
                        <div className="profile-header-badge-icon">
                            <User />
                        </div>
                        <span className="profile-header-label">Patient Profile</span>
                    </div>

                    {/* Title */}
                    <h1>
                        Your <span className="profile-header-highlight">Health Profile</span>
                    </h1>

                    {/* Tab Switcher */}
                    {!isEditing && (
                        <nav className="profile-tabs">
                            {[
                                { id: 'biometrics', label: 'Health Data' },
                                { id: 'history', label: 'History' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="profileTabLine"
                                            className="tab-underline"
                                        />
                                    )}
                                </button>
                            ))}
                        </nav>
                    )}
                </div>

                {/* Status Indicator */}
                <div className="profile-status">
                    <div className="status-text">
                        <span className="status-label">System Status</span>
                        <div className="status-value">
                            <span className="status-indicator" />
                            <span className="status-value-text">Active</span>
                        </div>
                    </div>
                    <div className="status-divider" />
                    <div className="status-security">
                        <ShieldCheck className="status-security-icon" />
                        <span className="status-security-text">Encrypted</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <AnimatePresence mode="wait">
                {isEditing ? (
                    <motion.div
                        key="edit-form"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                        className="profile-content"
                    >
                        {profile && (
                            <HealthDataForm
                                initialData={profile}
                                onSave={handleSave}
                                onCancel={() => setIsEditing(false)}
                            />
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="profile-content"
                    >
                        {activeTab === 'biometrics' ? (
                            profile && (
                                <HealthProfileSection
                                    profile={profile}
                                    onEdit={() => setIsEditing(true)}
                                />
                            )
                        ) : (
                            <QuizHistorySection />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfilePage;
