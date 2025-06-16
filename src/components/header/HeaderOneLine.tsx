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
import {useHostHeaderBtnVisibility} from "../stores/HostHeaderBtnStore";
import HostHeader from "./HostHeader";
import {useMapVisibility} from "../stores/MapStore";

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
    const isVisibleHostScreen = useHostHeaderBtnVisibility();
    const isMapVisible = useMapVisibility();
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
                                    className="h-12 w-full max-w-3xl text-sm flex items-center justify-between bg-white shadow-lg border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-xl"
                                    style={{borderRadius: '40px', overflow: 'hidden'}}
                                >
                                    {/* 장소 섹션 */}
                                    <div
                                        className="flex-1 flex items-center px-6 py-3 hover:bg-gray-50 transition-colors duration-200">
                                        <MapPin className="w-4 h-4 text-gray-600 mr-3"/>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-gray-900">
                                                {t('장소')}
                                            </span>
                                            <span className="text-gray-500 text-xs truncate">
                                                {t('장소, 이름, 키워드 검색')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 구분선 */}
                                    <div className="hidden md:block w-px h-8 bg-gray-300"></div>

                                    {/* 입주일 섹션 */}
                                    <div
                                        className="hidden md:flex flex-1 items-center px-6 py-3 hover:bg-gray-50 transition-colors duration-200">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-gray-900">
                                                {t('입주일')}
                                            </span>
                                            <span className="text-gray-500 text-xs">
                                                {t('입주일 선택')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 구분선 */}
                                    <div className="hidden md:block w-px h-8 bg-gray-300"></div>

                                    {/* 퇴거일 섹션 */}
                                    <div
                                        className="hidden md:flex flex-1 items-center px-6 py-3 hover:bg-gray-50 transition-colors duration-200">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-gray-900">
                                                {t('인원')}
                                            </span>
                                            <span className="text-gray-500 text-xs">
                                                {t('인원 선택')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 검색 버튼 */}
                                    <button
                                        className="w-8 h-8 m-2 flex items-center justify-center bg-roomi hover:bg-roomi-3 rounded-full shadow-md transition-all duration-200 hover:scale-105"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            performSearch();
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={faSearch}
                                            className="text-white text-xs"
                                        />
                                    </button>
                                </div>
                            )}

                            {/* "/map" 검색창 */}
                            {(isMapVisible && isMobile) && (
                                <div>
                                    <button
                                        type="button"
                                        onClick={openSearchModal}
                                        className="w-8 h-8 flex items-center justify-center
                                                    bg-gray-100 rounded-full shadow-md
                                                    transition-all duration-200 hover:scale-105"
                                    >
                                        <FontAwesomeIcon
                                            icon={faSearch}
                                            className="text-black text-base"
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

                {isVisibleHostScreen && (
                    <HostHeader/>
                )}
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
                    style={{
                        content: {
                            maxWidth: '400px',
                            width: '90%',
                            maxHeight: '80vh',
                            overflow: 'auto',
                            padding: '24px',
                            inset: '50% auto auto 50%',
                            transform: 'translate(-50%, -50%)'
                        }
                    }}
                >
                    <MainLanguageSelector/>
                </Modal>
            )}

            <AuthModal visible={authModalVisible} onClose={() => setAuthModalVisible(false)} type="login"/>
        </>
    );
};
