import React, { useState, useEffect } from 'react';
import { X, MapPin, Building, Home, CheckCircle2, ShieldCheck } from 'lucide-react';
import { AddressDTO } from '../../services/addressService';

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (address: AddressDTO) => Promise<void>;
    initialData?: AddressDTO | null;
}

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState<AddressDTO>({
        label: 'Home',
        street: '',
        city: '',
        state: '',
        country: 'India',
        postalCode: '',
        isDefault: false
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    label: 'Home',
                    street: '',
                    city: '',
                    state: '',
                    country: 'India',
                    postalCode: '',
                    isDefault: false
                });
            }
            setErrors({});
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.label) newErrors.label = 'Label is required';
        if (!formData.street) newErrors.street = 'Street details are required';
        if (!formData.postalCode) newErrors.postalCode = 'Postal code is required';
        else if (!/^\d{6}$/.test(formData.postalCode)) newErrors.postalCode = 'Invalid 6-digit code';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving address:', error);
        } finally {
            setLoading(false);
        }
    };

    const labels = [
        { id: 'Home', icon: Home },
        { id: 'Office', icon: Building },
        { id: 'Other', icon: MapPin }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-zoomIn">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {initialData ? 'Edit Address' : 'Add New Address'}
                            </h2>
                            <p className="text-sm text-gray-500">Configure your shipping coordinates</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex gap-3">
                            {labels.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, label: item.id })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${formData.label === item.id
                                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                                        : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                                        }`}
                                >
                                    <item.icon size={18} />
                                    <span className="text-sm font-semibold">{item.id}</span>
                                </button>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Street / Locality</label>
                            <textarea
                                value={formData.street}
                                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                placeholder="House no, Building, Street..."
                                rows={2}
                                className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:border-blue-500 transition-all font-medium text-gray-900 text-sm ${errors.street ? 'border-red-500' : 'border-gray-100'}`}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">City</label>
                                <input
                                    type="text"
                                    value={formData.city || ''}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 transition-all font-medium text-gray-900 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Postal Code</label>
                                <input
                                    type="text"
                                    value={formData.postalCode || ''}
                                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                    className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:border-blue-500 transition-all font-medium text-gray-900 text-sm ${errors.postalCode ? 'border-red-500' : 'border-gray-100'}`}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">State</label>
                                <input
                                    type="text"
                                    value={formData.state || ''}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 transition-all font-medium text-gray-900 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Country</label>
                                <input
                                    type="text"
                                    value={formData.country || 'India'}
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl font-medium text-gray-400 text-sm cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <label className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${formData.isDefault ? 'border-emerald-500 bg-emerald-50' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${formData.isDefault ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                    <CheckCircle2 size={18} />
                                </div>
                                <span className="text-sm font-bold text-gray-900">Set as Primary</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={formData.isDefault}
                                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                className="w-5 h-5 text-emerald-600 rounded border-gray-300"
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <ShieldCheck className="w-5 h-5" />
                            {loading ? 'Saving...' : initialData ? 'Update Address' : 'Save Address'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddressModal;
