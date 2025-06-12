import React, {useState, useRef, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useAuthStore} from "src/components/stores/AuthStore";
import AuthModal from "src/components/modals/AuthModal";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import HostHeader from "src/components/header/HostHeader";
import {useHeaderBtnVisibility} from "src/components/stores/HeaderBtnStore";
import {useHostHeaderBtnVisibility} from "../stores/HostHeaderBtnStore";
import dayjs from "dayjs";
import {useDateStore} from "../stores/DateStore";
import {useGuestsStore} from "../stores/GuestsStore";
import {useLocationStore} from "../stores/LocationStore";
import {useHostModeStore} from "../stores/HostModeStore";
import {useTranslation} from "react-i18next";
import i18n from "i18next";
import '../../css/Header.css';
import {SearchBar} from "./util/SearchBar";
import {MapPin} from "lucide-react";
import Modal from "react-modal";
import LanguageSet from "../screens/myPageMenu/LanguageSet";
import MainLanguageSelector from "./util/MainLanguageSelector";
import AuthButton from "./util/AuthButton";

type LocationOption = {
    name: string;
    country: string;
};
type ActiveCardType = 'location' | 'date' | 'guests' | null;

const Header = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [authModalVisible, setAuthModalVisible] = useState(false);
    const {authToken} = useAuthStore();
    const isVisible = useHeaderBtnVisibility();
    const isVisibleHostScreen = useHostHeaderBtnVisibility();
    const {startDate, endDate,} = useDateStore();
    const {guestCount} = useGuestsStore();
    const {selectedLocation, setSelectedLocation} = useLocationStore();
    const {hostMode, setHostMode, resetUserMode} = useHostModeStore();
    const [userVisible, setUserVisible] = useState(false);
    const currentLang = i18n.language;

    // 검색 모달 관련 상태 추가
    const [searchModalOpen, setSearchModalOpen] = useState(false);
    const [activeCard, setActiveCard] = useState<ActiveCardType>('location');
    const searchBarRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const openSearchModal = () => {
        if (window.location.pathname === '/map') {
            // 이미 /map 페이지면 모달 열기
            setSearchModalOpen(true);
            document.body.style.overflow = 'hidden';
        } else {
            // 아니라면 /map 으로 이동
            navigate('/map');
        }
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



    // 헤더 설정
    const [hasReached, setHasReached] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // 모바일
            if (window.innerWidth < 768) {
                setIsMobile(true);
                const y = window.scrollY;
                if (!hasReached && y >= 219) {
                    setHasReached(true);
                } else if (hasReached && y < 219) {
                    setHasReached(false);
                }

            } else {
                setIsMobile(false);
                const y = window.scrollY;

                // 아직 322px에 도달하지 않았고, 이제 도달했으면
                if (!hasReached && y >= 322) {
                    setHasReached(true);
                }
                // 이미 도달했었고, 다시 322px 아래로 내려오면
                else if (hasReached && y < 322) {
                    setHasReached(false);
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



    // 헤더 메인 번역기능
    const [userLanguageSetModal, setUserLanguageSetModal] = useState(false);
    const [languageSetModal, setLanguageSetModal] = useState(false);
    const handleLanguageSet = () => {
        console.log('헤더 번역 버튼');
        if (authToken) {
            // 로그인 상태
            setUserLanguageSetModal(true);
        } else {
            // 비로그인 상태
            setLanguageSetModal(true);
        }
    };

    return (
        <>
            {/* 기본 헤더 */}
            <div
                className={`bg-white
                    ${!hasReached && 'hidden'}
                    ${isMobile ? 'h-[307px]' : 'h-[387px]'}
                `}
            />
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
                            {((hasReached && !isMobile) && !hostMode) && (
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
                            <AuthButton
                                currentLang={currentLang}
                                handleSetHostMode={handleSetHostMode}
                                handleLanguageSet={handleLanguageSet}
                                userVisible={userVisible}
                                setUserVisible={setUserVisible}
                                setAuthModalVisible={setAuthModalVisible}
                            />
                        </div>

                        {/* 호스트 모드가 아닐 때만 텍스트 표시 */}
                        {(isVisible && !hostMode) && (
                            <div className={`flex_center flex-col mb-6 ${hasReached && 'hidden'}`}>
                                <p className="flex_center text-roomi text-lg md:text-3xl font-semibold mb-2.5">
                                    {t("주단위부터 월단위까지, 보증금도 자유롭게")}
                                </p>
                                <p className="flex_center text-xl md:text-3xl font-bold text-[#AF483E]">
                                    {t("전 세계 게스트와 연결되는 루미")}
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
                                        <MapPin className="w-6 h-6 text-black mr-2"/>
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
                </div>
            </div>

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

            {/* 헤더 번역 모달 */}
            {/* 비회원 */}
            {userLanguageSetModal && (
                <Modal
                    isOpen={userLanguageSetModal}
                    onRequestClose={() => setUserLanguageSetModal(false)}
                    className="authModal auth-modal-container"
                    overlayClassName="authModal overlay"
                >
                    <LanguageSet/>
                </Modal>
            )}
            {/* 회원 */}
            {languageSetModal && (
                <Modal
                    isOpen={languageSetModal}
                    onRequestClose={() => setLanguageSetModal(false)}
                    className="authModal auth-modal-container"
                    overlayClassName="authModal overlay"
                >
                    <MainLanguageSelector/>
                </Modal>
            )}

            <AuthModal visible={authModalVisible} onClose={() => setAuthModalVisible(false)} type="login"/>
        </>
    );
};

export default Header;