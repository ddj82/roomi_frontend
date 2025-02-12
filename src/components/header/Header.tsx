import React, { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom"; // react-router-dom의 useNavigate 사용
import { AuthContext } from "src/components/auth/AuthContext";
import DateModal from "src/components/modals/DateModal";
import LocationModal from "src/components/modals/LocationModal";
import GuestsModal from "src/components/modals/GuestsModal";
import AuthModal from "src/components/modals/AuthModal";
import { BusinessInfoModal } from "src/components/modals/BusinessInfoModal";
import { UserModal } from "src/components/modals/UserModal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faCalendarDay,
    faLocationDot,
    faUserPlus,
    faCircleInfo, faUser
} from '@fortawesome/free-solid-svg-icons';
import '../../css/Header.css';
import {useHeaderBtnContext} from "src/components/auth/HeaderBtnContext"; // 스타일을 별도 CSS 파일로 import

type ModalSection = 'date' | 'location' | 'guests';
type ModalPosition = { x: number; y: number };

const Header = () => {
    const navigate = useNavigate(); // react-router-dom에서 제공하는 useNavigate로 변경
    const [authModalVisible, setAuthModalVisible] = useState(false);
    const [userVisible, setUserVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [activeSection, setActiveSection] = useState<ModalSection | null>(null);
    const [modalPosition, setModalPosition] = useState<ModalPosition>({ x: 0, y: 0 });
    const [selectedDates, setSelectedDates] = useState<{ startDate: string; endDate: string } | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<string>('');
    const [guestCount, setGuestCount] = useState<number>(0);
    const [businessInfoVisible, setBusinessInfoVisible] = useState(false);
    const { authToken } = useContext(AuthContext); // AuthContext에서 가져오기
    const { isVisible } = useHeaderBtnContext();

    const dateRef = useRef(null);
    const locationRef = useRef(null);
    const guestsRef = useRef(null);

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
        if (selectedDates) {
            return `${selectedDates.startDate} ~ ${selectedDates.endDate}`;
        }
        return '날짜 지정';
    };

    const handleLogo = () => {
        navigate('/');
    };

    return (
        <div className="border-b-[1px] border-gray-200">
            <div className="h header container mx-auto md:mt-12 mt-6">
                <div className="md:mx-auto mx-3 xl:max-w-[1200px] lg:max-w-[1024px] md:max-w-3xl">
                    <div className="h top-row md:mb-12 mb-6">
                        <div className="h logo-container">
                            <button onClick={handleLogo}>
                                <img src="/assets/images/roomi_word.png" alt="Logo" className="md:h-8 h-6 mr-2"/>
                            </button>
                            <button onClick={() => setBusinessInfoVisible(true)}
                                    className="h info-button flex items-center">
                                <FontAwesomeIcon icon={faCircleInfo} className="text-roomi text-sm"/>
                            </button>
                        </div>
                        <div>
                            {authToken ? (
                                <div>
                                    <button
                                        className="w-8 h-8 md:w-10 md:h-10
                                         flex items-center justify-center bg-roomi-00 text-roomi-3 rounded-full"
                                        onClick={() => setUserVisible(true)}>
                                        <FontAwesomeIcon icon={faUser}/>
                                    </button>
                                </div>
                            ) : (
                                <button className="p-2 bg-roomi hover:bg-roomi-4 text-white text-sm rounded-md"
                                        onClick={() => setAuthModalVisible(true)}>
                                    로그인
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                {isVisible &&
                    <div className="h search-bar-container my-2 mx-3">
                        <div className="h search-bar-row md:h-14 h-12 xl:max-w-4xl lg:max-w-3xl md:max-w-2xl w-full md:text-base text-xs md:mb-4">
                            <button ref={dateRef} className="h search-item"
                                    onClick={() => openModal('date', dateRef)}>
                                <FontAwesomeIcon icon={faCalendarDay} className="text-roomi md:text-lg"/>
                                <span className="ml-2 text-gray-500">{formatDateRange()}</span>
                            </button>

                            <div className="flex items-center">
                                <span className="w-px h-10 bg-gray-200 mx-1"></span>
                            </div>

                            <button ref={locationRef} className="h search-item"
                                    onClick={() => openModal('location', locationRef)}>
                                <FontAwesomeIcon icon={faLocationDot} className="text-roomi md:text-lg"/>
                                <span className="ml-2 text-gray-500">{selectedLocation || '위치 검색'}</span>
                            </button>

                            <div className="flex items-center">
                                <span className="w-px h-10 bg-gray-200 mx-1"></span>
                            </div>

                            <button ref={guestsRef} className="h search-item"
                                    onClick={() => openModal('guests', guestsRef)}>
                                <FontAwesomeIcon icon={faUserPlus} className="text-roomi md:text-lg"/>
                                <span className="ml-2 text-gray-500">
                                    {guestCount > 0 ? `게스트 ${guestCount}명` : '인원 추가'}
                                </span>
                            </button>

                            <button
                                className="h search-button md:w-10 md:h-10 w-8 h-8
                                m-2 flex items-center justify-center bg-roomi rounded">
                                <FontAwesomeIcon icon={faSearch} className="text-white"/>
                            </button>
                        </div>
                    </div>
                }
                {modalVisible && (
                    <div className="h modal-container">
                        {activeSection === 'date' && (
                            <DateModal visible={true} onClose={closeModal} onSelectDates={setSelectedDates}
                                       position={modalPosition}/>
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
                <UserModal visible={userVisible} onClose={() => setUserVisible(false)}/>
            </div>
        </div>
    );
};

export default Header;
