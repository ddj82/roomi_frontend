import React, {useState, useRef, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useAuthStore} from "src/components/stores/AuthStore";
import DateModal from "src/components/modals/DateModal";
import LocationModal from "src/components/modals/LocationModal";
import GuestsModal from "src/components/modals/GuestsModal";
import AuthModal from "src/components/modals/AuthModal";
import {BusinessInfoModal} from "src/components/modals/BusinessInfoModal";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch, faUserPlus} from '@fortawesome/free-solid-svg-icons';
import HostHeader from "src/components/header/HostHeader";
import {useHeaderBtnVisibility} from "src/components/stores/HeaderBtnStore";
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
import '../../css/Header.css';
import {SocialAuth} from "../util/SocialAuth";
import {SearchBar} from "./SearchBar";

type ModalSection = 'date' | 'location' | 'guests';
type ModalPosition = { x: number; y: number };
type LocationOption = {
    name: string;
    country: string;
};
type ActiveCardType = 'location' | 'date' | 'guests' | null;

const Header = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [authModalVisible, setAuthModalVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [activeSection, setActiveSection] = useState<ModalSection | null>(null);
    const [modalPosition, setModalPosition] = useState<ModalPosition>({x: 0, y: 0});
    const [businessInfoVisible, setBusinessInfoVisible] = useState(false);
    const {authToken} = useAuthStore();
    const isVisible = useHeaderBtnVisibility();
    const isVisibleHostScreen = useHostHeaderBtnVisibility();
    const dateRef = useRef(null);
    const locationRef = useRef(null);
    const guestsRef = useRef(null);
    const {startDate, endDate,} = useDateStore();
    const {guestCount, setGuestCount} = useGuestsStore();
    const {selectedLocation, setSelectedLocation} = useLocationStore();
    const {hostMode, setHostMode, resetUserMode} = useHostModeStore();
    const {isHost} = useIsHostStore();
    const disconnect = useChatStore((state) => state.disconnect);
    const [userVisible, setUserVisible] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const isLoggedIn = Boolean(authToken);
    const {profileImg} = useAuthStore();

    // 검색 모달 관련 상태 추가
    const [searchModalOpen, setSearchModalOpen] = useState(false);
    const [activeCard, setActiveCard] = useState<ActiveCardType>('location'); // 기본적으로 위치 카드가 활성화
    const searchBarRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (!isLoggedIn) {
            // 로그인 안 된 상태 → 브라우저 언어 강제 적용
            localStorage.removeItem('i18nextLng');
            const detectedLang = i18n.services.languageDetector?.detect();
            i18n.changeLanguage(detectedLang || 'ko');
        }
    }, [isLoggedIn]);

    // 기존 모달 관련 함수
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

    // 새로운 검색 모달 관련 함수
    const openSearchModal = () => {
        setSearchModalOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeSearchModal = () => {
        setSearchModalOpen(false);
        document.body.style.overflow = 'auto';
    };

    // 카드 접기/펼치기 토글 함수
    const toggleCard = (cardName: ActiveCardType) => {
        if (activeCard === cardName) {
            // 이미 열린 카드를 클릭하면 닫지 않고 유지 (선택사항)
            // 닫고 싶다면 아래 주석을 해제
            setActiveCard(null);
        } else {
            setActiveCard(cardName);
        }
    };

    // 위치 선택 처리
    const handleSelectLocation = (location: LocationOption) => {
        setSelectedLocation(location.name);
        // 위치 선택 후 날짜 카드로 자동 전환
        toggleCard('date');
    };

    // 날짜 저장 처리 (DateModal에서 직접 호출해야 함)
    const handleSaveDate = () => {
        // 날짜 저장 후 인원 카드로 자동 전환
        toggleCard('guests');
    };

    // 검색 실행
    const performSearch = () => {
        closeSearchModal();

        console.log('Search performed with:', {
            location: selectedLocation,
            dates: {startDate, endDate},
            guests: guestCount
        });
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
        const confirmCancel = window.confirm(t('로그아웃 하시겠습니까?'));
        if (!confirmCancel) return;
        try {
            if (localStorage.getItem('authMode') && localStorage.getItem('authMode') === 'kakao') {
                const response = await SocialAuth.kakaoLogout();
                console.log('소셜로그아웃 메소드 실행 후', response);
                if (!response) return; // 카카오 로그인 실패시 메소드 종료
            }
            const response = await logout();
            console.log(response);
            resetUserMode();// hostMode 초기화
            disconnect(); // 소켓 서버 닫기
            window.location.reload();
        } catch (error) {
            console.error("로그아웃 실패:", error);
        }
    };

    // 모달 외부 클릭 시 닫기
    useEffect(() => {
        const handleSearchModalClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                closeSearchModal();
            }
        };

        if (searchModalOpen) {
            document.addEventListener('mousedown', handleSearchModalClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleSearchModalClickOutside);
        };
    }, [searchModalOpen]);

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
        <div className="border-b border-gray-200">
            <div className="h header container mx-auto md:mt-8 mt-6">
                <div className="mx-auto xl:max-w-[1500px] px-[20px]">
                    <div className="h top-row md:mb-8 mb-6 flex items-center">
                        {/* 로고 영역 */}
                        <div className="h logo-container">
                            <button onClick={handleLogo}>
                                <img src="/assets/images/roomi.png" alt="Logo" className="md:h-16 h-12 mr-2"/>
                            </button>
                        </div>

                        {/* 서치바 영역 - 간단한 버전으로 수정 */}
                        {isVisible ? (
                            <div className="h search-bar-container flex-1 mx-4 w-1/20">
                                <div
                                    ref={searchBarRef}
                                    onClick={openSearchModal}
                                    className="h search-bar-row md:h-14 h-12
                                               w-full md:max-w-xl lg:max-w-2xl xl:max-w-3xl
                                               text-[11px] md:text-sm lg:text-base flex items-center justify-between
                                               bg-white border border-gray-200
                                               cursor-pointer transition-shadow"
                                    style={{borderRadius: '9999px', overflow: 'hidden'}}
                                >
                                    <div className="search-simple-text flex items-center px-4 py-2 flex-1">
                                        <FontAwesomeIcon
                                            icon={faSearch}
                                            className="text-roomi md:text-base lg:text-lg mr-2"
                                        />
                                        <span className="text-gray-500 truncate">
                                            {t('어디로 여행 가세요?')}
                                        </span>
                                    </div>

                                    <button
                                        className="h search-button md:w-9 md:h-9 w-7 h-7 m-2 flex items-center justify-center bg-roomi hover:bg-roomi-3 rounded-full"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            performSearch();
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faSearch} className="text-white"/>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // 서치바가 표시되지 않을 때 레이아웃 균형을 위한 빈 공간
                            <div className="flex-1"></div>
                        )}

                        {/* 프로필/로그인 영역 - 기존 코드 유지 */}
                        <div className="md:mr-4 mr-1.5">
                            {authToken ? (
                                <div className="flex">
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            className="w-8 h-8 md:w-10 md:h-10
                                             flex items-center justify-center bg-roomi-000 text-roomi rounded-full"
                                            onClick={toggleDropdown}
                                        >
                                            <img src={profileImg} alt="프로필사진" className="rounded-full md:w-10 md:h-10 w-8 h-8"/>
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
                                    className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-roomi hover:bg-roomi-4 text-white rounded-full shadow-md transition duration-200"
                                    onClick={() => setAuthModalVisible(true)}
                                >
                                    <FontAwesomeIcon icon={faUserPlus} className="text-white text-lg" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {isVisibleHostScreen && (
                    <HostHeader/>
                )}

                {/* 기존 모달 코드 유지 */}
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

                {/* 새로운 통합 검색 모달 (아코디언 스타일로 수정) */}
                {searchModalOpen && (
                    <SearchBar
                        visible={searchModalOpen}
                        onClose={() => setSearchModalOpen(false)}
                        openSearchModal={openSearchModal}
                        closeSearchModal={closeSearchModal}
                        toggleCard={toggleCard}
                        activeCard={activeCard}
                        performSearch={performSearch}
                        handleSelectLocation={handleSelectLocation}
                    />
                )}

                <BusinessInfoModal visible={businessInfoVisible} onClose={() => setBusinessInfoVisible(false)}/>
                <AuthModal visible={authModalVisible} onClose={() => setAuthModalVisible(false)} type="login"/>
            </div>
        </div>
    );
};

export default Header;