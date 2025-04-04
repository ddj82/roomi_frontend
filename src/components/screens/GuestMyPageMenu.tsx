import React, { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { logout } from "src/api/api";
import { useMediaQuery } from "react-responsive";
import { useIsHostStore } from "../stores/IsHostStore";
import { useHostModeStore } from "../stores/HostModeStore";
import { useChatStore } from "../stores/ChatStore";
import { useAuthStore } from "../stores/AuthStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBell,
    faEye,
    faRectangleList,
    faThumbsUp
} from '@fortawesome/free-regular-svg-icons';
import {
    faArrowLeft,
    faDollarSign,
    faGlobe,
    faPenToSquare,
    faRightFromBracket,
    faUserSlash,
    faHouse
} from "@fortawesome/free-solid-svg-icons";
import MyFavoriteList from "./myPageMenu/MyFavoriteList";
import MyHistoryList from "./myPageMenu/MyHistoryList";
import NotificationSet from "./myPageMenu/NotificationSet";
import LanguageSet from "./myPageMenu/LanguageSet";
import HelpCenter from "./myPageMenu/HelpCenter";
import FAQ from "./myPageMenu/FAQ";
import Notices from "./myPageMenu/Notices";
import CurrencySet from "./myPageMenu/CurrencySet";
import MyReservations from "./myPageMenu/MyReservations";
import MyInfoEdit from "./myPageMenu/MyInfoEdit";

// Type definitions
interface MenuItem {
    name: string;
    label: string;
    icon?: any;
    action?: () => void;
}

interface MenuSection {
    title: string;
    items: MenuItem[];
}

// Menu section component
const MenuSection: React.FC<{
    title: string;
    menuItems: MenuItem[];
    setSelectedMenu: (menu: string) => void;
}> = ({ title, menuItems, setSelectedMenu }) => (
    <div className="border-b border-gray-200 py-5">
        <h3 className="font-bold text-xl mb-4 px-4">{title}</h3>
        <div className="space-y-3">
            {menuItems.map(item => (
                <button
                    key={item.name}
                    className="w-full text-start p-3 px-4 hover:bg-gray-100 rounded-md transition-colors flex items-center"
                    onClick={() => setSelectedMenu(item.name)}
                >
                    {item.icon && <FontAwesomeIcon icon={item.icon} className="w-5 h-5 mr-3 text-gray-600" />}
                    <span className="text-lg">{item.label}</span>
                </button>
            ))}
        </div>
    </div>
);

export default function GuestMyPageMenu(): React.ReactElement {
    const { t } = useTranslation();
    const { isHost } = useIsHostStore();
    const { resetUserMode } = useHostModeStore();
    const navigate = useNavigate();
    const disconnect = useChatStore((state) => state.disconnect);
    const [selectedMenu, setSelectedMenu] = useState<string>('예약내역');
    const [loading, setLoading] = useState<boolean>(false);
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const { profileImg } = useAuthStore();

    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');

    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [selectedMenu]);

    const handleLogout = async () => {
        try {
            const response = await logout();
            console.log(response);
            resetUserMode();
            disconnect();
            window.location.href = '/';
        } catch (error) {
            console.error("로그아웃 실패:", error);
        }
    };

    const handleSetHostMode = () => {
        navigate('/hostAgree');
    };

    // Organized menu structure
    const menuSections: MenuSection[] = [
        {
            title: t("나의 거래"),
            items: [
                { name: '예약내역', label: t("예약 내역"), icon: faRectangleList },
                { name: '관심', label: t("관심 목록"), icon: faThumbsUp },
                { name: '최근본게시물', label: t("최근 본 게시물"), icon: faEye },
            ]
        },
        {
            title: t("기본 설정"),
            items: [
                { name: '알림', label: t("알림 설정"), icon: faBell },
                { name: '언어', label: t("언어 설정"), icon: faGlobe },
                { name: '통화', label: t("통화 설정"), icon: faDollarSign },
            ]
        },
        {
            title: t("고객 지원"),
            items: [
                { name: '공지사항', label: t("공지사항") },
                { name: 'FAQ', label: "FAQ" },
                { name: '고객센터', label: t("고객센터") },
            ]
        },
        {
            title: t("계정 설정"),
            items: [
                { name: '내정보', label: t("내 정보"), icon: faPenToSquare },
                { name: '로그아웃', label: t("로그아웃"), icon: faRightFromBracket, action: handleLogout },
                { name: '회원탈퇴', label: t("회원탈퇴"), icon: faUserSlash },
            ]
        }
    ];

    // Menu content rendering
    const renderMenuContent = (): React.ReactNode => {
        if (loading) return <div className="flex items-center justify-start p-4 text-lg">Loading...</div>;
        if (!selectedMenu) return <div className="flex items-center justify-start p-4 text-lg">메뉴를 선택해주세요.</div>;

        const componentMap: Record<string, React.ReactNode> = {
            '내정보': <MyInfoEdit />,
            '예약내역': <MyReservations />,
            '관심': <MyFavoriteList />,
            '최근본게시물': <MyHistoryList />,
            '알림': <NotificationSet />,
            '언어': <LanguageSet />,
            '통화': <CurrencySet />,
            '공지사항': <Notices />,
            'FAQ': <FAQ />,
            '고객센터': <HelpCenter />,
        };

        // If the menu item has an action and no component, execute the action
        for (const section of menuSections) {
            const item = section.items.find(i => i.name === selectedMenu);
            if (item && item.action) {
                item.action();
                return null;
            }
        }

        return componentMap[selectedMenu] || <div className="flex items-center justify-start p-4 text-lg">메뉴를 선택해주세요.</div>;
    };

    return (
        <div className="w-full my-6 flex flex-col md:flex-row relative bg-white rounded-lg ">
            {/* Profile and Menu Area */}
            <div className="md:w-1/3 md:border-r border-gray-200">
                {/* User Profile Section */}
                <div className="py-6 px-4 flex flex-col items-center border-b border-gray-200">
                    <div className="relative mb-3">
                        <img
                            src={profileImg}
                            alt="프로필사진"
                            className="rounded-full w-24 h-24 object-cover"
                        />
                    </div>
                    <h2 className="font-bold text-lg">{userName}</h2>
                    <p className="text-gray-600 text-sm">{userEmail}</p>

                    {/* Host Registration Button */}
                    {!isHost && (
                        <button
                            onClick={handleSetHostMode}
                            className="mt-4 w-full p-2 text-white bg-roomi rounded-md hover:bg-opacity-90 transition flex items-center justify-center"
                        >
                            <FontAwesomeIcon icon={faHouse} className="mr-2" />
                            {t("호스트 등록")}
                        </button>
                    )}
                </div>

                {/* Menu Sections */}
                <div className="px-4 py-2">
                    {menuSections.map((section, idx) => (
                        <MenuSection
                            key={idx}
                            title={section.title}
                            menuItems={section.items}
                            setSelectedMenu={setSelectedMenu}
                        />
                    ))}
                </div>
            </div>

            {/* Desktop Content Area (hidden on mobile) */}
            <div className="md:w-2/3 hidden md:block">
                <div id="myPageContent" className="p-6">
                    <h2 className="text-xl font-bold mb-6 pb-2 border-b border-gray-200 px-2">
                        {menuSections.flatMap(s => s.items).find(i => i.name === selectedMenu)?.label || selectedMenu}
                    </h2>
                    <div className="px-2">
                        {renderMenuContent()}
                    </div>
                </div>
            </div>

            {/* Mobile Overlay */}
            {isMobile && selectedMenu && (
                <div className="fixed inset-0 bg-white z-50 overflow-auto">
                    <div className="p-4">
                        <div className="flex items-center mb-4 border-b border-gray-200 pb-3">
                            <button
                                className="p-2 rounded-full hover:bg-gray-100"
                                onClick={() => setSelectedMenu('')}
                            >
                                <FontAwesomeIcon icon={faArrowLeft} size="lg" />
                            </button>
                            <h2 className="ml-4 text-xl font-bold">
                                {menuSections.flatMap(s => s.items).find(i => i.name === selectedMenu)?.label || selectedMenu}
                            </h2>
                        </div>
                        <div className="px-2">
                            {renderMenuContent()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}