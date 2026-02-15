import React, {useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';

interface LoginProps {
    setAuthToken: (token: string | null) => void;
}

const Login: React.FC<LoginProps> = ({setAuthToken}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    console.log('test')
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/token/', {username, password});
            localStorage.setItem('access', response.data.access);
            localStorage.setItem('refresh', response.data.refresh);
            setAuthToken(response.data.access);
            navigate('/home');
        } catch (err) {
            setError('Login failed. Invalid credentials.');
            console.error(err);
        }
    };

    return (
        <div className="bg-form-bg p-8 rounded-lg shadow-lg max-w-md w-full mx-auto">
            <h2 className="text-game-text text-2xl mb-5 font-bold text-center">Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4 text-left">
                    <label className="block mb-1 text-label-text">Username:</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required/>
                </div>
                <div className="mb-4 text-left">
                    <label className="block mb-1 text-label-text">Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                </div>
                <button type="submit"
                        className="w-full py-3 text-lg bg-button-strong hover:bg-button-strong-hover text-white font-bold rounded">Login
                </button>
            </form>
            {error && <p className="text-error mt-4 text-center">{error}</p>}
        </div>
    );
}

export default Login;
