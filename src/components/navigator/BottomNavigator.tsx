import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from "react-i18next";
import {useHostTabNavigation} from "../stores/HostTabStore";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCalendar, faComments, faFileLines, } from "@fortawesome/free-regular-svg-icons";
import {useAuthStore} from "../stores/AuthStore";
import {useChatStore} from "../stores/ChatStore";
import {logout} from "../../api/api";
import {useHostModeStore} from "../stores/HostModeStore";
import {faHouseChimney} from "@fortawesome/free-solid-svg-icons";

const tabIcons: Record<string, JSX.Element> = {
    my_room: <FontAwesomeIcon icon={faHouseChimney} />,
    contract_management: <FontAwesomeIcon icon={faFileLines} />,
    room_status: <FontAwesomeIcon icon={faCalendar} />,
    message: <FontAwesomeIcon icon={faComments} />,
};

const BottomNavigation: React.FC = () => {
    const { t } = useTranslation();
    const { activeTab, setActiveTab } = useHostTabNavigation();
    const tabs = ["my_room", "contract_management", "room_status", "message"] as const;

    // 1) innerHeight 변화 감지해서 --vh 변수에 세팅
    const [vh, setVh] = useState(window.innerHeight);
    useEffect(() => {
        const onResize = () => setVh(window.innerHeight);
        window.addEventListener("resize", onResize);
        return () => document.removeEventListener("resize", onResize);
    }, []);
    useEffect(() => {
        // 1vh = window.innerHeight * 0.01px
        document.documentElement.style.setProperty("--vh", `${vh * 0.01}px`);
    }, [vh]);

    // 2) 네비게이터 높이(px)
    const navHeight = 56;

    return (
        <div
            className="fixed bottom-0 left-0 w-full bg-white backdrop-blur-sm border-t border-gray-200/50 flex justify-center items-center z-50"
            style={{
                height: `${navHeight}px`,
                bottom: "env(safe-area-inset-bottom)",     // 홈바(safe-area) 위에 딱 붙이기
                paddingBottom: "env(safe-area-inset-bottom)",
                boxShadow: '0 -2px 8px rgba(167, 97, 97, 0.15)'
            }}
        >
            <div className="flex justify-around items-center w-full max-w-md">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        className={`flex flex-col items-center justify-end p-2 min-w-0 transition-colors duration-200 ${
                            activeTab === tab ? "text-roomi" : "text-gray-500"
                        }`}
                        onClick={() => setActiveTab(tab)}
                        type="button"
                        role="tab"
                        aria-controls={tab}
                        aria-selected={activeTab === tab}
                    >
                        <div className="text-lg mt-3 mb-1" style={{fontWeight: 300}}>{tabIcons[tab]}</div>
                        <span className="text-[10px] leading-tight mt-0.5">{t(tab)}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BottomNavigation;