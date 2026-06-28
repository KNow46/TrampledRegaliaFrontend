import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await axios.post('http://localhost:8000/api/register/', {
                username,
                email,
                password,
            });

            navigate('/login');
        } catch (err) {
            setError('Registration failed. Please try again.');
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#3b2f1c_0%,#17120b_45%,#050403_100%)] px-4">
            <div className="w-full max-w-md">
                <div className="relative rounded-md border-4 border-yellow-800 bg-stone-900/95 p-8 shadow-[0_0_35px_rgba(0,0,0,0.9)]">
                    <div className="absolute -inset-2 -z-10 rounded-lg border border-yellow-600/40 bg-gradient-to-br from-yellow-900/30 via-stone-950 to-black" />

                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-yellow-600 to-transparent" />

                        <h2 className="text-4xl font-black tracking-widest text-yellow-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]">
                            REGISTER
                        </h2>

                        <p className="mt-3 text-sm tracking-wide text-yellow-100/70">
                            Forge your kingdom and begin your reign
                        </p>

                        <div className="mx-auto mt-4 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-yellow-600 to-transparent" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-yellow-500">
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Name of the ruler"
                                className="w-full rounded-sm border-2 border-yellow-900 bg-stone-800 px-4 py-3 text-yellow-100 placeholder:text-stone-500 shadow-inner outline-none transition focus:border-yellow-500 focus:bg-stone-700 focus:ring-2 focus:ring-yellow-700/50"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-yellow-500">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Royal messenger address"
                                className="w-full rounded-sm border-2 border-yellow-900 bg-stone-800 px-4 py-3 text-yellow-100 placeholder:text-stone-500 shadow-inner outline-none transition focus:border-yellow-500 focus:bg-stone-700 focus:ring-2 focus:ring-yellow-700/50"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-yellow-500">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Secret royal seal"
                                className="w-full rounded-sm border-2 border-yellow-900 bg-stone-800 px-4 py-3 text-yellow-100 placeholder:text-stone-500 shadow-inner outline-none transition focus:border-yellow-500 focus:bg-stone-700 focus:ring-2 focus:ring-yellow-700/50"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full border-2 border-yellow-700 bg-gradient-to-b from-yellow-600 to-yellow-900 px-4 py-3 font-black uppercase tracking-widest text-stone-950 shadow-[0_4px_0_#3f2f10] transition hover:from-yellow-500 hover:to-yellow-800 active:translate-y-1 active:shadow-none"
                        >
                            Forge Kingdom
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="w-full border-2 border-stone-600 bg-gradient-to-b from-stone-700 to-stone-950 px-4 py-3 font-bold uppercase tracking-widest text-yellow-400 shadow-[0_4px_0_#090706] transition hover:border-yellow-700 hover:text-yellow-300 active:translate-y-1 active:shadow-none"
                        >
                            Return to Login
                        </button>
                    </form>

                    {error && (
                        <div className="mt-5 border-2 border-red-900 bg-red-950/70 px-4 py-3 text-center text-sm font-bold text-red-300 shadow-inner">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Register;