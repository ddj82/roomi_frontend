import React, {useRef, useState} from 'react';
import {MapPin} from "lucide-react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import {useHostModeStore} from "../stores/HostModeStore";
import {useAuthStore} from "../stores/AuthStore";
import i18n from "i18next";
import {useDateStore} from "../stores/DateStore";
import {useGuestsStore} from "../stores/GuestsStore";
import {useLocationStore} from "../stores/LocationStore";
import {SearchBar} from "./util/SearchBar";
import Modal from "react-modal";
import LanguageSet from "../screens/myPageMenu/LanguageSet";
import MainLanguageSelector from "./util/MainLanguageSelector";
import AuthModal from "../modals/AuthModal";
import AuthButton from "./util/AuthButton";
import '../../css/Header.css';
import {useHeaderBtnVisibility} from "../stores/HeaderBtnStore";

type LocationOption = {
    name: string;
    country: string;
};
type ActiveCardType = 'location' | 'date' | 'guests' | null;

export default function HeaderOneLine() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const isMobile = window.innerWidth <= 768;
    const {hostMode, setHostMode, resetUserMode} = useHostModeStore();
    const {authToken} = useAuthStore();
    const {startDate, endDate,} = useDateStore();
    const {guestCount} = useGuestsStore();
    const {selectedLocation, setSelectedLocation} = useLocationStore();
    const isVisible = useHeaderBtnVisibility();
    const currentLang = i18n.language;

    const [userVisible, setUserVisible] = useState(false);
    const [authModalVisible, setAuthModalVisible] = useState(false);

    // 검색 모달 관련 상태 추가
    const [searchModalOpen, setSearchModalOpen] = useState(false);
    const searchBarRef = useRef<HTMLDivElement>(null);
    const [activeCard, setActiveCard] = useState<ActiveCardType>('location');

    // 헤더 메인 번역기능
    const [userLanguageSetModal, setUserLanguageSetModal] = useState(false);
    const [languageSetModal, setLanguageSetModal] = useState(false);

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

    const performSearch = () => {
        closeSearchModal();
        console.log('Search performed with:', {
            location: selectedLocation,
            dates: {startDate, endDate},
            guests: guestCount
        });
    };

    const closeSearchModal = () => {
        setSearchModalOpen(false);
        document.body.style.overflow = 'auto';
    };

    // 헤더 메인 번역기능
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

    // 검색 모달
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


    return (
        <>
            <div className="h-20"/>
            <div className={`border-b border-gray-200 fixed top-0 left-0 w-full h-20 z-[9998] bg-white`}>
                <div className={`h header container mx-auto h-16 my-2`}>
                    <div className="mx-auto container md:px-0 px-4">
                        <div className={`h top-row flex items-center h-16`}>
                            {/* 로고 영역 */}
                            <div className="h logo-container">
                                <button onClick={handleLogo}>
                                    <img src="/assets/images/roomi.png" alt="Logo" className="md:h-10 h-6"/>
                                </button>
                            </div>

                            {/* 검색창 */}
                            {(!isMobile && !hostMode) && isVisible && (
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
                    </div>
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
