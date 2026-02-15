import React from "react";
import {useNavigate} from "react-router-dom";
import {useResources} from "../functions/data";

const NavBar: React.FC = () => {
    const {resources, production} = useResources();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('world_id');
        navigate('/login');
        window.location.reload();
    };

    return (
        <nav
            className="absolute top-0 left-0 w-full bg-gray-900/70 backdrop-blur-sm text-white p-3 shadow-lg z-20 flex items-center justify-between gap-4">

            {/* Left Side: Resources (Scrollable on overflow) */}
            <div
                className="flex items-center gap-3 sm:gap-4 overflow-x-auto overflow-y-hidden min-w-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {Object.keys(resources).map(resource_name => (
                    <div key={resource_name}
                         className="flex items-center flex-shrink-0 gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-gray-600/50 shadow-md">
                        <img src={`/images/${resource_name}.png`} alt={resource_name}
                             className="w-6 h-6 sm:w-7 sm:h-7 select-none pointer-events-none"/>
                        <div className={'flex flex-col'}>
                            <span
                                className="text-sm sm:text-base font-bold text-yellow-200">{new Intl.NumberFormat().format(resources[resource_name])}</span>
                            <span
                                className="text-green-400">
                                + {new Intl.NumberFormat().format(production[resource_name] ? production[resource_name] : 0)} /h
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Right Side: Actions */}
            <div className="flex items-center flex-shrink-0 gap-4">
                <button
                    onClick={() => navigate('/home')}
                    className="h-12 w-12 flex-shrink-0 flex items-center justify-center bg-yellow-500/20 hover:bg-yellow-500/40 border-2 border-yellow-400/50 rounded-full transition-all duration-300 transform hover:scale-110"
                    title="Go to Map"
                >
                    <img src={`/images/mapIcon.png`} alt="Map" className="h-8 w-8 sm:h-9 sm:h-9 select-none"/>
                </button>
                <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm sm:text-base transition-colors duration-200"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default NavBar;

