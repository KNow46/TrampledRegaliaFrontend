const HexagonFrame = ({ width = 100, strokeWidth = 4, top = 0, left = 0, color = "black" }) => {
    // Corner-to-corner height
    const height = (2 / Math.sqrt(3)) * width;

    const innerWidth = width - strokeWidth;
    const innerHeight = height - strokeWidth;

    const halfW = innerWidth / 2;
    const quarterH = innerHeight / 4;
    const threeQuarterH = (3 * innerHeight) / 4;

    const margin = strokeWidth / 2;

    const points = [
        [halfW + margin, margin],                   // top
        [innerWidth + margin, quarterH + margin],  // top-right
        [innerWidth + margin, threeQuarterH + margin], // bottom-right
        [halfW + margin, innerHeight + margin],    // bottom
        [margin, threeQuarterH + margin],          // bottom-left
        [margin, quarterH + margin],               // top-left
    ]
        .map(p => p.join(","))
        .join(" ");

    return (
        <svg
            width={width}
            height={height}
            style={{ position: "absolute", top, left, opacity: 0.1, pointerEvents: "none" }}
        >
            <polygon
                points={points}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default HexagonFrame;
