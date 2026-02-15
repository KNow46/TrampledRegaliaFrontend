import React, {useState} from 'react';
import {Routes, Route, Navigate} from 'react-router-dom'; // Added Navigate
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import CastleView from "./pages/CastleView";


const App: React.FC = () => {
    const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('access'));
    // Removed useEffect that caused immediate redirect

    return (
        <div className="App">
            <div className="content-area">
                <Routes>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/login" element={<Login setAuthToken={setAuthToken}/>}/>
                    <Route path="/home" element={<Home/>}/>
                    <Route path="/castle" element={<CastleView/>}/>
                    {/* Redirect from root path based on authentication */}
                    <Route path="/" element={authToken ? <Navigate to="/home"/> : <Navigate to="/login"/>}/>
                    {/* Catch-all route for unknown paths, redirects to login if not authenticated, or home if authenticated */}
                    <Route path="*" element={authToken ? <Navigate to="/home"/> : <Navigate to="/login"/>}/>
                </Routes>
            </div>
        </div>
    );
}

export default App;