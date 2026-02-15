import React, {useEffect, useRef} from "react";
import {calculateOffSetFromCenter, calculateScale} from "../../functions/utils";

interface LevelTileProps {
    xFromCenterNotScaled: number;
    yFromCenterNotScaled: number;
    level: number;
}

const LevelTile: React.FC<LevelTileProps> = ({xFromCenterNotScaled, yFromCenterNotScaled, level}) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        updatePosition()
        window.addEventListener('resize', () => {
            updatePosition()
        });
    }, [xFromCenterNotScaled, yFromCenterNotScaled]);

    const updatePosition = () => {
        if (ref.current) {
            ref.current.style.transform =
                `translate(
                ${calculateOffSetFromCenter(xFromCenterNotScaled)}px, 
                ${calculateOffSetFromCenter(yFromCenterNotScaled)}px)`;
        }
    }
    return (
        <div className="bg-gray-800 text-white absolute border-white border-2 rounded-md text-center items-center
        shadow-lg px-1 font-extrabold text-md sm:text-lg top-1/2 left-1/2 bg-opacity-750 pr-2 "
             ref={ref}>
            {level}
        </div>
    )
}
export default LevelTile;
