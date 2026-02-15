import React, {useEffect, useState} from 'react';

interface ZoomControllerProps {
    setHexWidth: React.Dispatch<React.SetStateAction<number>>;
}

const ZoomControler: React.FC<ZoomControllerProps> = ({setHexWidth}) => {
    const [hover, setHover] = useState('none'); // 'none' | 'plus' | 'minus'
    const [zoomLevel, setZoomLevel] = useState(3);
    const maxZoomLevel = 5;

    useEffect(() => {
        const zoomLevelToHexWidthMap: { [key: number]: number } = {
            0: 100,
            1: 150,
            2: 200,
            3: 250,
            4: 300,
            5: 400,
            6: 500,
        }
        setHexWidth(zoomLevelToHexWidthMap[zoomLevel]);
    }, [zoomLevel, setHexWidth]);

    const calculatePointerPosition = () => {
        return -(zoomLevel - maxZoomLevel / 2) / maxZoomLevel * 25 + 1
    }
    return (
        <div
            className="absolute right-[20px] sm:top-[60%] top-[70%] sm:h-[200px] h-[150px] w-[60px] z-[20]
                 opacity-50 hover:opacity-100 transition-opacity select-none"
            onMouseLeave={() => setHover('none')}
        >
            <img
                src="/images/zoom-slider/outer.png"
                alt="outer"
                className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none"
            />

            <img
                src="/images/zoom-slider/plusHovered.png"
                alt="plus hovered"
                className={`absolute inset-0 w-full h-full object-contain z-20 transition-opacity pointer-events-none
                    ${hover === 'plus' ? 'opacity-100' : 'opacity-0'}`}
            />

            <img
                src="/images/zoom-slider/minusHovered.png"
                alt="minus hovered"
                className={`absolute inset-0 w-full h-full object-contain z-20 transition-opacity pointer-events-none
                    ${hover === 'minus' ? 'opacity-100' : 'opacity-0'}`}
            />

            <img
                src="/images/zoom-slider/pointer.png"
                alt="minus hovered"
                className={`absolute inset-0 w-full h-full object-contain z-20 transition-opacity pointer-events-none`}
                style={{
                    top: `${calculatePointerPosition()}%`
                }}
            />

            <div
                className="absolute top-0 left-0 w-full h-1/3 z-30"
                onMouseEnter={() => setHover('plus')}
                onMouseLeave={() => setHover('none')}
                onClick={() => {
                    if (zoomLevel < maxZoomLevel) {
                        setZoomLevel(zoomLevel + 1)
                    }
                }}
            />

            <div
                className="absolute bottom-0 left-0 w-full h-1/3 z-30"
                onMouseEnter={() => setHover('minus')}
                onMouseLeave={() => setHover('none')}
                onClick={() => {
                    if (zoomLevel > 0) {
                        setZoomLevel(zoomLevel - 1)
                    }
                }}
            />
        </div>
    );
};

export default ZoomControler;
