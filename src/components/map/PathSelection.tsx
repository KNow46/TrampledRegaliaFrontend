import type {PathStepItem, Unit} from "../../types.ts";


interface PathSelectionProps {
    currentPath: PathStepItem[],
    selectedArmyId: number | null,
    handleConfirmPath: () => void,
    handleCancelPath: () => void,
    selectedUnitsAmount: Unit[],
    maxSelectedUnitsAmount: Unit[],
    setSelectedUnitsAmount: (units: Unit[]) => void,
}

export const PathSelection = (
    {currentPath, selectedArmyId, handleConfirmPath, handleCancelPath, setSelectedUnitsAmount, maxSelectedUnitsAmount, selectedUnitsAmount}: PathSelectionProps
) => {
    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 p-4 rounded-lg shadow-lg z-50">
            {selectedUnitsAmount.map((unit  ) =>
                <div className="flex items-center gap-2 bg-gray-700 p-2 rounded-lg">
                    <img src={`/images/troops/${unit.unit_type}.png`} alt={unit.unit_type} className="h-8 w-8"/>
                    <input
                        type="number"
                        className="w-20 p-1 rounded bg-gray-600 text-white text-center font-semibold"
                        value={unit.amount}
                        max={maxSelectedUnitsAmount.find((maxUnit: Unit) => maxUnit.unit_type == unit.unit_type)?.amount}
                        min={0}
                        onChange={(e) => {
                            const selectedUnitsAmountCopy = [...selectedUnitsAmount]
                            selectedUnitsAmountCopy.find((unitCopy: Unit) => unitCopy.unit_type === unit.unit_type)!.amount = Number(e.target.value)
                            setSelectedUnitsAmount(selectedUnitsAmountCopy)
                        }}
                    />
                    <span className="text-white">/</span>
                    <span className="text-gray-300 font-semibold">
                        {maxSelectedUnitsAmount.find((maxUnit: Unit) => maxUnit.unit_type == unit.unit_type)?.amount}
                    </span>
                </div>
                )}
            <p className="text-white mb-2">Select path for army {selectedArmyId}. Current path
                length: {currentPath.length}</p>
            <button
                onClick={handleConfirmPath}
                disabled={!selectedUnitsAmount.some(unit => unit.amount > 0) || currentPath.length === 0}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                Confirm Path
            </button>
            <button
                onClick={handleCancelPath}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
                Cancel
            </button>
        </div>
    )
}