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
    const disconnect = useChatStore((state) => state.disconnect);
    const [userVisible, setUserVisible] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const {resetUserMode} = useHostModeStore();
    const {profileImg} = useAuthStore();

    const toggleDropdown = () => {
        setUserVisible((prev) => !prev);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setUserVisible(false);
        }
    };

    const handleSetHostMode = () => {
        resetUserMode();
        window.location.href = '/';
    };

    const handleLogout = async () => {
        const confirmCancel = window.confirm(t('로그아웃 하시겠습니까?'));
        if (!confirmCancel) return;
        try {
            const response = await logout();
            console.log(response);
            resetUserMode();// hostMode 초기화
            disconnect(); // 소켓 서버 닫기
            window.location.reload();
        } catch (error) {
            console.error("로그아웃 실패:", error);
        }
    };

    useEffect(() => {
        if (userVisible) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [userVisible]);

    return (
        <div
            className="fixed bottom-0 left-0 w-full bg-white backdrop-blur-sm border-t border-gray-200/50 flex justify-center items-center h-14 z-50"
            style={{
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