import React, { useState } from 'react';
import { login } from '../services/mockApi';

interface LoginPageProps {
    onLoginSuccess: (user: string, token: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            setError('Please enter both username and password');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { user, token } = await login(username, password);
            onLoginSuccess(user, token);
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark p-4">
            <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#111622] p-8 shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="flex flex-col items-center mb-8">
                    <span className="material-symbols-outlined text-5xl text-primary mb-2">shield_with_heart</span>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h1>
                    <p className="text-slate-500 text-sm">Sign in to access the CyberGuard Dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {error && (
                        <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold text-center">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full rounded-lg bg-slate-100 dark:bg-slate-800 border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:ring-0 text-slate-900 dark:text-white transition-all"
                            placeholder="Enter your username"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg bg-slate-100 dark:bg-slate-800 border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:ring-0 text-slate-900 dark:text-white transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 w-full py-3 rounded-lg bg-primary text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {loading ? <span className="material-symbols-outlined animate-spin text-base">progress_activity</span> : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
