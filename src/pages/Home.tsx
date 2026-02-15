import React, {useState} from 'react';
import GameMap from '../components/map/GameMap';
import NavBar from "../components/NavBar";
import ZoomControler from "../components/ZoomControler"; // Import the new map component

const Home: React.FC = () => {
    const [hexWidth, setHexWidth] = useState(250);

    return (
        <div className="w-full h-screen flex flex-col overflow-hidden">
            <NavBar/>
            <ZoomControler setHexWidth={setHexWidth}/>
            {/* The GameMap component will now take up the main area */}
            <div className="w-full flex items-center justify-center">
                <GameMap hexWidth={hexWidth}/>
            </div>
        </div>
    );
}

export default Home;
