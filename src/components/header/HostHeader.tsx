import React, {useEffect, useState} from 'react';
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

const HostHeader: React.FC = () => {
    const { t } = useTranslation();
    const { activeTab, setActiveTab } = useHostTabNavigation();
    const tabs = ["my_room", "contract_management", "room_status", "message", "settlement"] as const;
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // 창 크기 변경 시 이벤트 리스너 등록
        window.addEventListener("resize", handleResize);

        // 클린업 함수: 컴포넌트가 언마운트될 때 이벤트 제거
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div className="flex flex-wrap justify-center text-sm font-medium text-center" role="tablist">
            {tabs.map((tab) => (
                <div key={tab} role="presentation" className="mx-2 sm:mx-4 text-base">
                    <button
                        className={`
                            inline-block p-4
                            ${activeTab === tab ? "text-roomi border-b-2 border-b-roomi" : "hover:text-roomi"
                        }`}
                        onClick={() => {
                            setActiveTab(tab); // 다른 탭을 누르면 변경
                        }}
                        type="button"
                        role="tab"
                        aria-controls={tab}
                        aria-selected={activeTab === tab}
                    >
                        {isMobile ? tabIcons[tab] : t(tab)}
                    </button>
                </div>
            ))}
        </div>
    );
};

export default HostHeader;
