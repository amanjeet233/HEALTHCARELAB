import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MoreVertical, Shield, User as UserIcon, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { type User, adminService } from '../../services/adminService';
import { notify } from '../../utils/toast';

interface Props {
    users: User[];
}

const UserManagementTable: React.FC<Props> = ({ users: initialUsers }) => {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    const filteredUsers = users.filter(user =>
        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (roleFilter === 'all' || user.role?.toString().toUpperCase() === roleFilter.toUpperCase())
    );

    const handleRoleChange = async (userId: number, newRole: string) => {
        try {
            await adminService.updateUserRole(userId, newRole);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
            notify.success(`Neural permissions updated.`);
        } catch (error) {
            notify.error('Update synchronization failed.');
        }
    };

    const handleStatusToggle = async (userId: number) => {
        try {
            await adminService.toggleUserStatus(userId.toString());
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u));
            notify.success(`User status modified.`);
        } catch (error) {
            notify.error('Status toggle failure.');
        }
    };

    const getRoleColor = (role: string) => {
        const r = (role || '').toUpperCase();
        if (r === 'ADMIN') return 'text-red-600 bg-red-50 border-red-100';
        if (r === 'MEDICAL_OFFICER') return 'text-teal-700 bg-teal-50 border-teal-100';
        if (r === 'TECHNICIAN') return 'text-blue-700 bg-blue-50 border-blue-100';
        return 'text-slate-600 bg-slate-50 border-slate-100';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="relative w-full max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text/30 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search neural registry..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/40 border border-primary/5 rounded-2xl pl-12 pr-6 py-4 text-[11px] font-bold text-text outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-text/20 uppercase tracking-widest"
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-grow md:flex-grow-0">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text/30" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full bg-white/40 border border-primary/5 rounded-2xl pl-12 pr-10 py-4 text-[10px] font-black text-text uppercase tracking-[0.2em] outline-none appearance-none cursor-pointer hover:bg-white/60 transition-all"
                        >
                            <option value="all">All Roles</option>
                            <option value="PATIENT">Patients</option>
                            <option value="TECHNICIAN">Technicians</option>
                            <option value="MEDICAL_OFFICER">Medical Officers</option>
                            <option value="ADMIN">Admins</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white/40 backdrop-blur-xl border border-primary/5 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-primary/5">
                                <th className="px-8 py-6 text-[10px] font-black text-text/40 uppercase tracking-[0.2em]">Node Designation</th>
                                <th className="px-8 py-6 text-[10px] font-black text-text/40 uppercase tracking-[0.2em]">Clinical Role</th>
                                <th className="px-8 py-6 text-[10px] font-black text-text/40 uppercase tracking-[0.2em]">Registration</th>
                                <th className="px-8 py-6 text-[10px] font-black text-text/40 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-text/40 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {filteredUsers.map((user, i) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="border-b border-primary/5 hover:bg-primary/5 transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
                                                    <UserIcon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[13px] font-black text-text uppercase italic">{user.name}</h4>
                                                    <p className="text-[10px] font-medium text-text/40">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${getRoleColor(user.role)}`}>
                                                <Shield className="w-3 h-3" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">{user.role}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-[11px] font-bold text-text/60 uppercase tracking-tighter">
                                            {user.joinDate}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`flex items-center gap-2 ${user.status === 'active' ? 'text-cta' : 'text-red-400'}`}>
                                                {user.status === 'active' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                                <span className="text-[10px] font-black uppercase tracking-widest italic">{user.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleStatusToggle(user.id)}
                                                    className="p-3 hover:bg-white rounded-xl text-text/20 hover:text-red-500 transition-all cursor-pointer"
                                                    title="Toggle Access status"
                                                >
                                                    <AlertCircle className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleRoleChange(user.id, 'doctor')}
                                                    className="p-3 hover:bg-white rounded-xl text-text/20 hover:text-primary transition-all cursor-pointer"
                                                    title="Swap Neural Role"
                                                >
                                                    <Activity className="w-4 h-4" />
                                                </button>
                                                <button className="p-3 hover:bg-white rounded-xl text-text/20 hover:text-text/60 transition-all cursor-pointer">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="py-24 text-center space-y-4 opacity-20">
                        <Activity className="w-12 h-12 mx-auto" />
                        <p className="text-[12px] font-black uppercase tracking-[0.3em]">No registry matches detected.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagementTable;
