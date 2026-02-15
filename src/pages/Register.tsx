import React, {useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';

const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/register/', {username, email, password});
            navigate('/login');
        } catch (err) {
            setError('Registration failed. Please try again.');
            console.error(err);
        }
    };

    return (
        <div className="bg-form-bg p-8 rounded-lg shadow-lg max-w-md w-full mx-auto">
            <h2 className="text-game-text text-2xl mb-5 font-bold text-center">Register</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4 text-left">
                    <label className="block mb-1 text-label-text">Username:</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required/>
                </div>
                <div className="mb-4 text-left">
                    <label className="block mb-1 text-label-text">Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                </div>
                <div className="mb-4 text-left">
                    <label className="block mb-1 text-label-text">Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                </div>
                <button type="submit"
                        className="w-full py-3 text-lg bg-button-strong hover:bg-button-strong-hover text-white font-bold rounded">Register
                </button>
            </form>
            {error && <p className="text-error mt-4 text-center">{error}</p>}
        </div>
    );
}

export default Register;
