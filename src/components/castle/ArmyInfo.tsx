import React from "react";

interface Army {
    [key: string]: number;
}

interface ArmyInfoProps {
    army: Army | null;
}

export const ArmyInfo: React.FC<ArmyInfoProps> = ({army}) => {

    return (
        <div
            className="fixed top-1/2 right-5 transform -translate-y-1/2 flex flex-col bg-black bg-opacity-50 p-4 rounded-lg border-2 border-gray-600">
            <h2 className="text-white text-xl font-bold mb-4 text-center">Army</h2>
            {army && Object.entries(army).map(([troopName, quantity]) => (
                <div key={troopName} className="flex flex-row items-center mb-2">
                    <img src={`/images/troops/${troopName}.png`} alt={troopName}
                         className="h-8 w-8 rounded-md"/>
                    <div className="font-bold text-xl capitalize text-white ml-4">{quantity}</div>
                </div>
            ))}
        </div>
    )
}