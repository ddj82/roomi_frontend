import React, {useState, useRef, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useAuthStore} from "src/components/stores/AuthStore";
import DateModal from "src/components/modals/DateModal";
import LocationModal from "src/components/modals/LocationModal";
import GuestsModal from "src/components/modals/GuestsModal";
import AuthModal from "src/components/modals/AuthModal";
import {BusinessInfoModal} from "src/components/modals/BusinessInfoModal";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faGlobe, faSearch, faUserPlus} from '@fortawesome/free-solid-svg-icons';
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
import {Globe, MapPin, User} from "lucide-react";

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
    const [activeCard, setActiveCard] = useState<ActiveCardType>('location');
    const searchBarRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isLoggedIn) {
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

    const openSearchModal = () => {
        setSearchModalOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeSearchModal = () => {
        setSearchModalOpen(false);
        document.body.style.overflow = 'auto';
    };

    const toggleCard = (cardName: ActiveCardType) => {
        if (activeCard === cardName) {
            setActiveCard(null);
        } else {
            setActiveCard(cardName);
        }
    };

    const handleSelectLocation = (location: LocationOption) => {
        setSelectedLocation(location.name);
        toggleCard('date');
    };

    const handleSaveDate = () => {
        toggleCard('guests');
    };

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
                if (!response) return;
            }
            const response = await logout();
            console.log(response);
            resetUserMode();
            disconnect();
            window.location.reload();
        } catch (error) {
            console.error("로그아웃 실패:", error);
        }
    };

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





    // 헤더 설정
    const [hasReached, setHasReached] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerWidth < 768) {
                setIsMobile(true);
                const y = window.scrollY;
                if (!hasReached && y >= 219) {
                    setHasReached(true);
                    console.log('295px 도달 → hasReached = true');
                } else if (hasReached && y < 219) {
                    setHasReached(false);
                    console.log('295px 미만으로 복귀 → hasReached = false');
                }

            } else {
                setIsMobile(false);
                const y = window.scrollY;

                // 아직 322px에 도달하지 않았고, 이제 도달했으면
                if (!hasReached && y >= 322) {
                    setHasReached(true);
                    console.log('322px 도달 → hasReached = true');
                }
                // 이미 도달했었고, 다시 322px 아래로 내려오면
                else if (hasReached && y < 322) {
                    setHasReached(false);
                    console.log('322px 미만으로 복귀 → hasReached = false');
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasReached]);

    // 그라데이션 효과
    const gradientStyle = {
        background: 'linear-gradient(to top, rgba(255, 236, 236, 0.8) 0%, rgba(255, 236, 236, 0.4) 20%, rgba(255, 255, 255, 0) 100%)'
    };

    return (
        <>
            <div
                className={`h-[387px] bg-white
                    ${!hasReached && 'hidden'}
                `}
            />
            {/*<div className={`${hasReached && 'h-[65px] bg-white'}`} />*/}
            <div
                className={`border-b border-gray-200 
                    ${hasReached ? 'fixed top-0 left-0 w-full h-20 z-[9999] bg-white' : ''}
                `}
                style={hasReached ? {} : gradientStyle}
            >
                <div
                    className={`
                        h header container mx-auto 
                        ${hasReached ? 'h-16 my-2' : 'md:mt-8 mt-6'}
                    `}
                >

                    <div className="mx-auto container md:px-0 px-4">
                        <div
                            className={`h top-row flex items-center
                                ${hasReached ? 'h-16' : 'md:mb-8 mb-6'}
                            `}
                        >
                            {/* 로고 영역 */}
                            <div className="h logo-container">
                                <button onClick={handleLogo}>
                                    <img src="/assets/images/roomi.png" alt="Logo" className="md:h-10 h-6"/>
                                </button>
                            </div>

                            {/* 검색창 */}
                            {((hasReached && !isMobile) && !isHost) && (
                                <div
                                    ref={searchBarRef}
                                    onClick={openSearchModal}
                                    className="h-12 w-full max-w-3xl text-[11px] flex items-center justify-between
                                        bg-white/90 backdrop-blur-sm shadow-[0_4px_8px_rgba(167,97,97,0.2)]
                                        ursor-pointer transition-all duration-300 hover:bg-white/95 hover:shadow-[0_6px_12px_rgba(167,97,97,0.2)]"
                                    style={{borderRadius: '9999px', overflow: 'hidden'}}
                                >
                                    <div className="search-simple-text flex items-center px-4 py- flex-1">
                                        <MapPin className="w-6 h-6 text-black mr-2"/>
                                        <span className="text-gray-500 truncate">
                                                {t('어디로 여행 가세요?')}
                                            </span>
                                    </div>

                                    <button
                                        className="w-10 h-10 m-2 flex items-center justify-center
                                                        bg-roomi hover:bg-roomi-3 rounded-full shadow-md
                                                        transition-all duration-200 hover:scale-105"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            performSearch();
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={faSearch}
                                            className="text-white text-base md:text-lg"
                                        />
                                    </button>
                                </div>
                            )}

                            {/* 프로필/로그인 영역 */}
                            <div className="md:mr-4 mr-1.5">
                                {authToken ? (
                                    <div className="flex gap-3">
                                        {/*<div className="flex_center md:text-xs text-xxs">*/}
                                        {/*    <button*/}
                                        {/*        type="button"*/}
                                        {/*        onClick={() => window.location.href = '/main'}*/}
                                        {/*    >*/}
                                        {/*        방 등록하러 가기*/}
                                        {/*    </button>*/}
                                        {/*</div>*/}
                                        {isHost && (
                                            <>
                                                {hostMode ? (
                                                    <div className="flex_center md:text-xs text-xxs">
                                                        <button onClick={handleSetHostMode}
                                                                className="w-full text-start block px-4 py-2">
                                                            {t("게스트로 전환")}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex_center md:text-xs text-xxs">
                                                        <button onClick={handleSetHostMode}
                                                                className="w-full text-start block px-4 py-2 ">
                                                            {t("호스트로 전환")}
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        <div className="flex_center">
                                            <button
                                                type="button"
                                                className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center bg-[#F1F1F1] backdrop-blur-sm rounded-full transition duration-200"
                                            >
                                                <Globe className="w-6 h-6 text-black stroke-[1.3]"/>
                                            </button>
                                        </div>


                                        <div className="flex">
                                            <div className="relative" ref={dropdownRef}>
                                                <button
                                                    className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-roomi-000 text-roomi rounded-full shadow-md"
                                                    onClick={toggleDropdown}
                                                >
                                                    <img src={profileImg} alt="프로필사진"
                                                         className="rounded-full md:w-10 md:h-10 w-8 h-8"/>
                                                </button>
                                                {userVisible && (
                                                    <div
                                                        className="absolute right-0 mt-2 bg-white/95 backdrop-blur-sm divide-y divide-gray-100 rounded-lg shadow-lg w-40 z-[9000] border border-gray-200">
                                                        <ul className="py-2 text-sm text-gray-700">
                                                            <li>
                                                                {hostMode ? (
                                                                    <a href="/host/myPage"
                                                                       className="block px-4 py-2 hover:bg-gray-100/70">{t('마이페이지')}</a>
                                                                ) : (
                                                                    <a href="/myPage"
                                                                       className="block px-4 py-2 hover:bg-gray-100/70">{t('마이페이지')}</a>
                                                                )}
                                                            </li>
                                                            <li>
                                                                {!hostMode && (<a href="/chat"
                                                                                  className="block px-4 py-2 hover:bg-gray-100/70">{t('메시지')}</a>)}
                                                            </li>
                                                            {isHost && (
                                                                <li>
                                                                    <button onClick={handleSetHostMode}
                                                                            className="w-full text-start block px-4 py-2 hover:bg-gray-100/70">
                                                                        {hostMode ? t("게스트로 전환") : t("호스트로 전환")}
                                                                    </button>
                                                                </li>
                                                            )}
                                                        </ul>
                                                        <div className="py-2">
                                                            <button onClick={handleLogout}
                                                                    className="w-full text-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/70">
                                                                {t('로그아웃')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-3">
                                        <div className="flex_center">
                                            <button
                                                type="button"
                                                className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center bg-[#F1F1F1] backdrop-blur-sm rounded-full transition duration-200"
                                            >
                                                <Globe className="w-6 h-6 text-black stroke-[1.3]"/>
                                            </button>
                                        </div>
                                        <div>
                                            <button
                                                className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center bg-[#F1F1F1] backdrop-blur-sm rounded-full transition duration-200"
                                                onClick={() => setAuthModalVisible(true)}
                                            >
                                                <User className="w-6 h-6 text-black stroke-[1.3]"/>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 호스트 모드가 아닐 때만 텍스트 표시 */}
                        {!hostMode && (
                            <div
                                className={`flex flex-col items-center text-center mb-6 
                                ${hasReached && 'hidden'}`}
                            >
                                <p className="text-roomi text-lg md:text-3xl font-semibold mb-2.5">
                                    주단위부터 월단위까지, 보증금도 자유롭게
                                </p>
                                <p className=" text-xl md:text-3xl font-bold text-[#AF483E]">
                                    전 세계 게스트와 연결되는 루미
                                </p>
                            </div>
                        )}

                        {/* 서치바 영역 */}
                        {(isVisible && !hasReached) && (
                            <div className="h search-bar-container w-full flex justify-center mb-8">
                                <img
                                    src="/assets/images/thumbnail.png"
                                    alt="Roomi 캐릭터"
                                    className={`h-12 md:h-20 mr-30 md:mr-50 ${hasReached && 'hidden'}`}
                                />
                                <div
                                    ref={searchBarRef}
                                    onClick={openSearchModal}
                                    className="md:h-16 h-12 w-full max-w-3xl text-[11px] flex items-center justify-between
                                                    bg-white/90 backdrop-blur-sm shadow-[0_4px_8px_rgba(167,97,97,0.2)]
                                                    ursor-pointer transition-all duration-300 hover:bg-white/95 hover:shadow-[0_6px_12px_rgba(167,97,97,0.2)]"
                                    style={{borderRadius: '9999px', overflow: 'hidden'}}
                                >
                                    <div className="search-simple-text flex items-center px-4 py- flex-1">
                                        <MapPin className="w-6 h-6 text-black"/>
                                        <span className="text-gray-500 truncate">
                                                {t('어디로 여행 가세요?')}
                                            </span>
                                    </div>

                                    <button
                                        className="md:w-12 md:h-12 w-10 h-10 m-2 flex items-center justify-center
                                                        bg-roomi hover:bg-roomi-3 rounded-full shadow-md
                                                        transition-all duration-200 hover:scale-105"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            performSearch();
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={faSearch}
                                            className="text-white text-base md:text-lg"
                                        />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {isVisibleHostScreen && (
                        <HostHeader/>
                    )}

                    {/* 검색 모달 */}
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
                </div>
            </div>
        </>
    );
};

export default Header;