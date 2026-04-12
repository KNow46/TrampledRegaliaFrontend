import React, {useEffect, useRef} from "react";
import {calculateOffSetFromCenter, calculateScale} from "../../functions/utils";
import LevelTile from "./LevelTile";
import type { BuildingDetails } from '../../types';

interface BuildingMeshProps {
    xFromCenterNotScaled: number;
    yFromCenterNotScaled: number;
    widthNotScaled: number;
    heightNotScaled: number;
    details: BuildingDetails | null;
    onClick: () => void;
}

const BuildingMesh: React.FC<BuildingMeshProps> = ({
                                                       xFromCenterNotScaled,
                                                       yFromCenterNotScaled,
                                                       widthNotScaled,
                                                       heightNotScaled,
                                                       details,
                                                       onClick
                                                   }) => {
    const ref = useRef<HTMLDivElement>(null);
    const updatePosition = () => {
        if (ref.current) {
            ref.current.style.transform =
                `translate(
                ${calculateOffSetFromCenter(xFromCenterNotScaled)}px, 
                ${calculateOffSetFromCenter(yFromCenterNotScaled)}px)`;
            ref.current.style.width = `${widthNotScaled * calculateScale()}px`;
            ref.current.style.height = `${heightNotScaled * calculateScale()}px`;
        }
    }
    useEffect(() => {
        updatePosition()
        window.addEventListener('resize', () => {
            updatePosition()
        });
    }, [xFromCenterNotScaled, yFromCenterNotScaled, widthNotScaled, heightNotScaled]);
    return (
        <div>
            {details &&
                <LevelTile
                    yFromCenterNotScaled={yFromCenterNotScaled}
                    xFromCenterNotScaled={xFromCenterNotScaled}
                    level={details.level ?? 0}
                />
            }
            <div className="cursor-pointer absolute top-1/2 left-1/2 hover:bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0)_80%)] transition"
                 onClick={onClick}
                 ref={ref}>
            </div>

        </div>
    )
}
export default BuildingMesh;
