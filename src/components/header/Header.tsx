import React, {useState, useRef, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "src/components/stores/AuthStore";
import DateModal from "src/components/modals/DateModal";
import LocationModal from "src/components/modals/LocationModal";
import GuestsModal from "src/components/modals/GuestsModal";
import AuthModal from "src/components/modals/AuthModal";
import { BusinessInfoModal } from "src/components/modals/BusinessInfoModal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faCalendarDay,
    faLocationDot,
    faUserPlus,
    faUser
} from '@fortawesome/free-solid-svg-icons';
import '../../css/Header.css';
import {useHeaderBtnVisibility} from "src/components/stores/HeaderBtnStore";
import HostHeader from "src/components/header/HostHeader";
import {useHostHeaderBtnVisibility} from "../stores/HostHeaderBtnStore";
import dayjs from "dayjs";
import {useDateStore} from "../stores/DateStore";
import {useGuestsStore} from "../stores/GuestsStore";
import {useLocationStore} from "../stores/LocationStore";
import {useHostModeStore} from "../stores/HostModeStore";
import {useTranslation} from "react-i18next";
import {logout} from "../../api/api";
import {useChatStore} from "../stores/ChatStore";
import {useIsHostStore} from "../stores/IsHostStore";
import i18n from "i18next";
type ModalSection = 'date' | 'location' | 'guests';
type ModalPosition = { x: number; y: number };

const Header = () => {
    const { t } = useTranslation();
    const navigate = useNavigate(); // react-router-dom에서 제공하는 useNavigate로 변경
    const [authModalVisible, setAuthModalVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [activeSection, setActiveSection] = useState<ModalSection | null>(null);
    const [modalPosition, setModalPosition] = useState<ModalPosition>({ x: 0, y: 0 });
    const [businessInfoVisible, setBusinessInfoVisible] = useState(false);
    const { authToken } = useAuthStore(); // AuthContext에서 가져오기
    const isVisible = useHeaderBtnVisibility();
    const isVisibleHostScreen = useHostHeaderBtnVisibility();
    const dateRef = useRef(null);
    const locationRef = useRef(null);
    const guestsRef = useRef(null);
    const {startDate, endDate, } = useDateStore();
    const {guestCount} = useGuestsStore();
    const {selectedLocation} = useLocationStore();
    const { hostMode, setHostMode, resetUserMode } = useHostModeStore();
    const { isHost } = useIsHostStore();
    const disconnect = useChatStore((state) => state.disconnect);
    const [userVisible, setUserVisible] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const isLoggedIn = Boolean(authToken);
    const {profileImg} = useAuthStore();

    useEffect(() => {
        if (!isLoggedIn) {
            // 로그인 안 된 상태 → 브라우저 언어 강제 적용
            // i18n 초기화 시 localStorage 우선이 설정되어 있다면, 기존 언어 설정을 지워줘야 함
            localStorage.removeItem('i18nextLng');
            // 브라우저 언어 감지
            const detectedLang = i18n.services.languageDetector?.detect();
            i18n.changeLanguage(detectedLang || 'ko');
        }
    }, [isLoggedIn]);

    const openModal = (section: ModalSection, ref: React.RefObject<any>) => {
        if (ref.current) {
            ref.current.getBoundingClientRect();
            const rect = ref.current.getBoundingClientRect();
            setModalPosition({
                x: rect.left,
                y: rect.bottom + 15,
            });
            setActiveSection(section);
            setModalVisible(true);
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setActiveSection(null);
    };

    const formatDateRange = () => {
        if (startDate && endDate) {
            return `${dayjs(startDate).format('MM-DD')} ~ ${dayjs(endDate).format('MM-DD')}`;
        }
        return t('date_select');
    };

    useEffect(() => {
        formatDateRange();
    }, [startDate, endDate]);


    const handleLogo = () => {
        navigate('/');
        window.location.reload();
    };

    const handleSetHostMode = () => {
        if (hostMode) {
            resetUserMode();
            window.location.href = '/';
        } else {
            setHostMode(true);
            window.location.href = '/host';
        }
    };

    const toggleDropdown = () => {
        setUserVisible((prev) => !prev);
    };
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setUserVisible(false);
        }
    };

    const handleLogout = async () => {
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
        <div className="border-b-[1px] border-gray-200">
            <div className="h header container mx-auto md:mt-8 mt-6">
                <div className="md:mx-auto mx-3 xl:max-w-[1200px] lg:max-w-[1024px] md:max-w-3xl">
                    <div className="h top-row md:mb-8 mb-6 flex items-center">
                        {/* 로고 영역 */}
                        <div className="h logo-container">
                            <button onClick={handleLogo}>
                                <img src="/assets/images/roomi.png" alt="Logo" className="md:h-16 h-12 mr-2"/>
                            </button>
                        </div>

                        {/* 서치바 영역 - 중앙 배치, 특정 페이지에서만 표시 */}
                        {isVisible ? (
                            <div className="h search-bar-container flex-1 mx-4 w-1/2">
                                <div className="h search-bar-row md:h-14 h-12
                                w-full md:max-w-2xl lg:max-w-3xl xl:max-w-4xl
                                text-[11px] md:text-sm lg:text-base flex items-center justify-between bg-white rounded-full shadow-md border border-gray-200">
                                    <button ref={dateRef} className="h search-item flex items-center px-4 py-2"
                                            onClick={() => openModal('date', dateRef)}>
                                        <FontAwesomeIcon icon={faCalendarDay}
                                                         className="text-roomi md:text-base lg:text-lg"/>
                                        <span className="ml-2 text-gray-500 truncate">{formatDateRange()}</span>
                                    </button>

                                    <div className="flex items-center">
                                        <span className="w-px h-8 bg-gray-200 mx-1"></span>
                                    </div>

                                    <button ref={locationRef} className="h search-item flex items-center px-4 py-2"
                                            onClick={() => openModal('location', locationRef)}>
                                        <FontAwesomeIcon icon={faLocationDot}
                                                         className="text-roomi md:text-base lg:text-lg"/>
                                        <span
                                            className="ml-2 text-gray-500 truncate">{selectedLocation || t('location_select')}</span>
                                    </button>

                                    <div className="flex items-center">
                                        <span className="w-px h-8 bg-gray-200 mx-1"></span>
                                    </div>

                                    <button ref={guestsRef} className="h search-item flex items-center px-4 py-2"
                                            onClick={() => openModal('guests', guestsRef)}>
                                        <FontAwesomeIcon icon={faUserPlus}
                                                         className="text-roomi md:text-base lg:text-lg"/>
                                        <span className="ml-2 text-gray-500 truncate">
                                            {guestCount > 0 ? `${t('guest')} ${guestCount}${t('guest_unit')}` : t('people_select')}
                                        </span>
                                    </button>

                                    <button
                                        className="h search-button md:w-10 md:h-10 w-8 h-8
                                        m-2 flex items-center justify-center bg-roomi hover:bg-roomi-3 rounded-full">
                                        <FontAwesomeIcon icon={faSearch} className="text-white"/>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // 서치바가 표시되지 않을 때 레이아웃 균형을 위한 빈 공간
                            <div className="flex-1"></div>
                        )}

                        {/* 프로필/로그인 영역 */}
                        <div className="mr-4">
                            {authToken ? (
                                <div className="flex">
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            className="w-8 h-8 md:w-10 md:h-10
                                             flex items-center justify-center bg-roomi-000 text-roomi rounded-full"
                                            onClick={toggleDropdown}>
                                            <img src={profileImg} alt="프로필사진" className="rounded-full w-10 h-10"/>
                                        </button>
                                        {userVisible && (
                                            <div
                                                className="absolute right-0 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-40 z-[2000] border">
                                                <ul className="py-2 text-sm text-gray-700">
                                                    <li>
                                                        {hostMode ? (
                                                            <a href="/host/myPage"
                                                               className="block px-4 py-2 hover:bg-gray-100">{t('마이페이지')}</a>
                                                        ) : (
                                                            <a href="/myPage"
                                                               className="block px-4 py-2 hover:bg-gray-100">{t('마이페이지')}</a>
                                                        )}
                                                    </li>
                                                    <li>
                                                        {!hostMode && (<a href="/chat"
                                                                          className="block px-4 py-2 hover:bg-gray-100">{t('메시지')}</a>)}
                                                    </li>
                                                    {isHost && (
                                                        <>
                                                            {hostMode ? (
                                                                <li>
                                                                    <button onClick={handleSetHostMode}
                                                                            className="w-full text-start block px-4 py-2 hover:bg-gray-100">
                                                                        {t("게스트로 전환")}
                                                                    </button>
                                                                </li>
                                                            ) : (
                                                                <li>
                                                                    <button onClick={handleSetHostMode}
                                                                            className="w-full text-start block px-4 py-2 hover:bg-gray-100">
                                                                        {t("호스트로 전환")}
                                                                    </button>
                                                                </li>
                                                            )}
                                                        </>
                                                    )}
                                                </ul>
                                                <div className="py-2">
                                                    <button onClick={handleLogout}
                                                            className="w-full text-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                        {t('로그아웃')}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <button
                                    className="p-2 bg-roomi hover:bg-roomi-4 text-white text-xs md:text-sm rounded-md"
                                    onClick={() => setAuthModalVisible(true)}>
                                    {t('로그인')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {isVisibleHostScreen && (
                    <HostHeader/>
                )}
                {modalVisible && (
                    <div className="h modal-container">
                        {activeSection === 'date' && (
                            <DateModal visible={true} onClose={closeModal} position={modalPosition}/>
                        )}
                        {activeSection === 'location' && (
                            <LocationModal visible={true} onClose={closeModal} position={modalPosition}/>
                        )}
                        {activeSection === 'guests' && (
                            <GuestsModal visible={true} onClose={closeModal} position={modalPosition}/>
                        )}
                    </div>
                )}
                <BusinessInfoModal visible={businessInfoVisible} onClose={() => setBusinessInfoVisible(false)}/>
                <AuthModal visible={authModalVisible} onClose={() => setAuthModalVisible(false)} type="login"/>
            </div>
        </div>
    );
};

export default Header;
