import React from 'react';
import type {Unit} from '../../types';

interface ArmyStatusPanelProps {
    units: Unit[];
    title?: string;
    onClose: () => void;
}

const ArmyStatusPanel: React.FC<ArmyStatusPanelProps> = ({units, title = 'Army', onClose}) => {
    return (
        <div className="fixed top-1/2 right-5 z-40 -translate-y-1/2 rounded-lg border-2 border-gray-600 bg-black/70 p-4 text-white shadow-lg backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold">{title}</h2>
                <button
                    onClick={onClose}
                    className="rounded bg-gray-700 px-3 py-1 font-semibold transition-colors hover:bg-red-600"
                >
                    Close
                </button>
            </div>

            <div className="flex min-w-48 flex-col gap-2">
                {units.length > 0 ? (
                    units.map((unit) => (
                        <div key={unit.unit_type} className="flex items-center">
                            <img
                                src={`/images/troops/${unit.unit_type}.png`}
                                alt={unit.unit_type}
                                className="h-8 w-8 rounded-md"
                            />
                            <div className="ml-4 text-xl font-bold capitalize">{unit.amount}</div>
                            <div className="ml-3 text-sm text-gray-300 capitalize">{unit.unit_type}</div>
                        </div>
                    ))
                ) : (
                    <div className="text-gray-300">Brak wojsk</div>
                )}
            </div>
        </div>
    );
};

export default ArmyStatusPanel;

