import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        //Field Validation checks
        if (!formData.name || !formData.email || !formData.password) {
            setError('All architectural credentials must be filled.');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password security guidelines require a minimum of 6 characters.');
            return;
        }

        setIsSubmitting(true);
        const result = await register(formData.name, formData.email, formData.password);
        setIsSubmitting(false);

        if (result.success) {
            toast.success('Registration finalized! Welcome to the application.');
            navigate('/dashboard');
        } else {
            setError(result.message);
            toast.error(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 px-4">
            <div className="w-full max-w-md bg-white border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-8 transform transition-all duration-300">

                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 mb-3">
                        <UserPlus size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Register Profile</h2>
                    <p className="text-sm text-slate-500 mt-1">Provision a brand-new user node space</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                        <AlertCircle size={18} className="shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Full Name</label>
                        <div className="relative">
                            <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Email Address</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="email"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200"
                                placeholder="EMAIL-ADDRESS"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Workspace Password</label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="password"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200"
                                placeholder="Min 6 characters"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-medium rounded-xl text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-slate-950/10 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Provisioning Account...' : 'Create Account'}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-8">
                    Already registered?{' '}
                    <Link to="/login" className="text-emerald-500 font-medium hover:underline">Log in here</Link>
                </p>
            </div>
        </div>
    );
}