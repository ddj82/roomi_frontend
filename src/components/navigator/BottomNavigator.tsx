import React from 'react';
import {useTranslation} from "react-i18next";
import {useHostTabNavigation} from "../stores/HostTabStore";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCalendar, faComments, faDollarSign, faFileLines, faHouseChimney} from "@fortawesome/free-solid-svg-icons";

const tabIcons: Record<string, JSX.Element> = {
    my_room: <FontAwesomeIcon icon={faHouseChimney} />,
    contract_management: <FontAwesomeIcon icon={faFileLines} />,
    room_status: <FontAwesomeIcon icon={faCalendar} />,
    message: <FontAwesomeIcon icon={faComments} />,
    settlement: <FontAwesomeIcon icon={faDollarSign} />,
};

const BottomNavigation: React.FC = () => {
    const { t } = useTranslation();
    const { activeTab, setActiveTab } = useHostTabNavigation();
    const tabs = ["my_room", "contract_management", "room_status", "message", "settlement"] as const;

    return (
        <>
            <div
                className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50"
            >
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        className={`flex flex-col items-center justify-center w-1/5 p-2 ${
                            activeTab === tab ? "text-roomi" : "text-gray-500"
                        }`}
                        onClick={() => {
                            setActiveTab(tab);
                        }}
                        type="button"
                        role="tab"
                        aria-controls={tab}
                        aria-selected={activeTab === tab}
                    >
                        <div className="text-xl mb-1">{tabIcons[tab]}</div>
                        <span className="text-xs">{t(tab)}</span>
                    </button>
                ))}
            </div>
            {/* 하단 네비게이션 높이만큼 패딩 추가 */}
            <div className="h-16"></div>
        </>
    );
};

export default BottomNavigation;