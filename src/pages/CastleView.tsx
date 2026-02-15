import NavBar from "../components/NavBar";
import React, {useEffect, useRef, useState} from "react";
import {useLocation} from "react-router-dom";
import api from "../services/api";
import BuildingMesh from "../components/castle/BuildingMesh";
import {ArmyInfo} from "../components/castle/ArmyInfo";
import {BarracksModal} from "../components/castle/BarracksModal";
import UpgradeModal from "../components/castle/UpgradeModal";

interface BuildingDetails {
    id: number;
    level: number;
    max_level: number;
    upgrade_cost: any;
    upgrade_time: number;
    type: string;
    stats: { [key: string]: any };
    stats_next_level: { [key: string]: any };
    is_max_level: boolean;
}

interface Building {
    xFromCenterNotScaled: number;
    yFromCenterNotScaled: number;
    width: number;
    height: number;
    details: BuildingDetails | null;
}

interface Buildings {
    [key: string]: Building;
}

interface Army {
    [key: string]: number;
}

interface TroopInfo {
    [key: string]: {
        recruitment_time: number;
        cost: any;
        power: number;
        defense_multiplier: number;
    };
}

interface RecruitmentItem {
    order: number;
    unit_type: string;
    quantity: number;
    time_left: string;
    microSecondsLeft: number;
}


function parseDuration(durationStr: string): number {
    const [hh, mm, ss] = durationStr.split(":");

    const [sec, micro = 0] = ss.split(".");

    return (
        Number(hh) * 3600 * 1000 +
        Number(mm) * 60 * 1000 +
        Number(sec) * 1000 +
        Number(micro) / 1000
    );
}

const CastleView: React.FC = () => {
    const location = useLocation();
    const [id, setId] = useState<string | null>(null);
    const [army, setArmy] = useState<Army | null>(null);
    const [openedModal, setOpenedModal] = useState<string | null>(null);
    const [recruitmentQueue, setRecruitmentQueue] = useState<RecruitmentItem[]>([]);
    const [troopsInfo, setTroopsInfo] = useState<TroopInfo>({});
    const troopsInfoRef = useRef(troopsInfo);

    useEffect(() => {
        troopsInfoRef.current = troopsInfo;
    }, [troopsInfo]);

    const [buildings, setBuildings] = useState<Buildings>(
        {
            forge: {
                xFromCenterNotScaled: -400,
                yFromCenterNotScaled: -50,
                width: 220,
                height: 270,
                details: null,
            },
            granary: {
                xFromCenterNotScaled: 160,
                yFromCenterNotScaled: -100,
                width: 135,
                height: 140,
                details: null,
            },
            barracks: {
                xFromCenterNotScaled: 200,
                yFromCenterNotScaled: 0,
                width: 180,
                height: 220,
                details: null,
            },
            well: {
                xFromCenterNotScaled: -75,
                yFromCenterNotScaled: 110,
                width: 80,
                height: 100,
                details: null,
            },
            market: {
                xFromCenterNotScaled: -220,
                yFromCenterNotScaled: 160,
                width: 120,
                height: 120,
                details: null,
            },
            walls: {
                xFromCenterNotScaled: 150,
                yFromCenterNotScaled: 250,
                width: 150,
                height: 250,
                details: null,
            }
        }
    )

    const fetchRecruitmentInfo = async () => {
        if (!buildings.barracks.details) return;
        try {
            const response = await api.get(`/game/barracks/${buildings.barracks.details.id}/`);
            setTroopsInfo(response.data.troops_info);
            const processedQueue = response.data.recruitment_queue.map((item: any) => ({
                ...item,
                microSecondsLeft: parseDuration(item.time_left)
            }));
            setRecruitmentQueue(processedQueue);
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const castleId = urlParams.get('id');
        setId(castleId);
    }, [location]);

    useEffect(() => {
        if (id) {
            const fetchBuildingLevels = async () => {
                try {
                    const response = await api.get(`/game/castles/${id}/buildings/`);
                    let buildingsCopy = {...buildings}
                    for (const [building, stats] of Object.entries(response.data)) {

                        buildingsCopy[building.toLowerCase()].details = stats as BuildingDetails;
                    }
                    setBuildings(buildingsCopy)
                } catch (error) {
                    console.error("Failed to fetch building levels:", error);
                }
            };
            const fetchArmy = async () => {
                try {
                    const response = await api.get(`game/castles/${id}/army/`)
                    setArmy(response.data.units);
                } catch (error) {
                    console.error("Failed to fetch building levels:", error);
                }
            }
            fetchBuildingLevels();
            fetchArmy();
        }
    }, [id, buildings]);

    useEffect(() => {
        if (buildings.barracks.details) {
            fetchRecruitmentInfo();
        }
    }, [buildings.barracks.details]);

    useEffect(() => {
        const interval = setInterval(() => {
            setRecruitmentQueue(prevQueue => {
                if (prevQueue.length === 0) return prevQueue;

                let micro = 1000;
                const queueCopy: RecruitmentItem[] = prevQueue.map(el => ({...el}));

                for (const el of queueCopy) {
                    if (el.microSecondsLeft > micro) {
                        el.microSecondsLeft -= micro;
                        const timeForOneUnit = troopsInfoRef.current[el.unit_type].recruitment_time * 3600 * 1000;

                        const unitLeft = Math.ceil(el.microSecondsLeft / timeForOneUnit);
                        el.quantity = unitLeft;
                        break;
                    } else {
                        micro -= el.microSecondsLeft;
                        el.microSecondsLeft = 0;
                        if (army) {
                            const armyCopy = {...army}
                            armyCopy[el.unit_type] += 1;
                            setArmy(armyCopy)
                        }
                    }
                }
                const cleaned = queueCopy.filter(el => el.microSecondsLeft > 0);
                return cleaned;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [army]);


    const setBuildingDetails = (buildingName: string, buildingDetails: BuildingDetails) => {
        const buildingsCopy = {...buildings};
        buildingsCopy[buildingName].details = buildingDetails
        setBuildings(buildingsCopy)
    }
    const renderModal = (name: string) => {
        if (name === "barracks") {
            return <BarracksModal closeModal={() => setOpenedModal(null)} buildingName={name} army={army}
                                  setArmy={setArmy}
                                  buildingDetails={buildings['barracks'].details}
                                  recruitmentQueue={recruitmentQueue}
                                  troopsInfo={troopsInfo}
                                  fetchRecruitmentInfo={fetchRecruitmentInfo}
            />
        }

        const buildingDetails = buildings[name].details;
        if (!buildingDetails) return null; // Add this check

        return <UpgradeModal closeModal={() => setOpenedModal(null)} buildingName={name}
                             buildingDetails={buildingDetails}
                             setBuildingDetails={(details: BuildingDetails) => {
                                 setBuildingDetails(name, details)
                             }}/>

    }

    return (
        <div className="w-full h-screen flex flex-col overflow-hidden relative">
            <NavBar/>
            <img
                className="object-cover w-full h-full
"
                src="/images/stoneCastleDetailed.png" alt="Castle"/>
            {Object.entries(buildings).map(([buildingName, buildingInfo]) => (
                <React.Fragment key={buildingName}>
                    {buildingInfo.details &&
                        <BuildingMesh
                            yFromCenterNotScaled={buildingInfo.yFromCenterNotScaled}
                            xFromCenterNotScaled={buildingInfo.xFromCenterNotScaled}
                            widthNotScaled={buildingInfo.width}
                            heightNotScaled={buildingInfo.height}
                            details={buildingInfo.details}
                            onClick={() => {
                                setOpenedModal(buildingName)
                            }}
                        />
                    }
                </React.Fragment>
            ))}
            {id &&
                <ArmyInfo army={army}/>
            }
            {openedModal &&
                renderModal(openedModal)
            }
        </div>
    )
}
export default CastleView;