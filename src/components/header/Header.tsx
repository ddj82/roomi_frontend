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
import { faSearch, faInfo, faCalendarDay, faLocationDot, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import '../../css/Header.css'; // 스타일을 별도 CSS 파일로 import

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
        navigate('/'); // react-router-dom에서 홈으로 이동
    };

    return (
        <div className="h header">
            <div className="h top-row">
                <div className="h logo-container">
                    <button onClick={handleLogo}>
                        <img src="/assets/images/roomi_word.png" alt="Logo" className="h logo" />
                    </button>
                    <button onClick={() => setBusinessInfoVisible(true)} className="h info-button">
                        <FontAwesomeIcon icon={faInfo} style={{ fontSize: 20, color: '#9370DB' }} />
                    </button>
                </div>
                <div className="h auth-buttons">
                    {authToken ? (
                        <button className="h login-button" onClick={() => setUserVisible(true)}>
                            내정보
                        </button>
                    ) : (
                        <button className="h login-button" onClick={() => setAuthModalVisible(true)}>
                            로그인
                        </button>
                    )}
                </div>
            </div>

            <div className="h search-bar-container">
                <div className="h search-bar-row">
                    <button ref={dateRef} className="h search-item" onClick={() => openModal('date', dateRef)}>
                        <FontAwesomeIcon icon={faCalendarDay} style={{ fontSize: 24, color: '#9370DB' }} />
                        <span className="h search-text">{formatDateRange()}</span>
                    </button>

                    <button ref={locationRef} className="h search-item" onClick={() => openModal('location', locationRef)}>
                        <FontAwesomeIcon icon={faLocationDot} style={{ fontSize: 24, color: '#9370DB' }} />
                        <span className="h search-text">{selectedLocation || '위치 검색'}</span>
                    </button>

                    <button ref={guestsRef} className="h search-item" onClick={() => openModal('guests', guestsRef)}>
                        <FontAwesomeIcon icon={faUserPlus} style={{ fontSize: 24, color: '#9370DB' }} />
                        <span className="h search-text">
                            {guestCount > 0 ? `게스트 ${guestCount}명` : '인원 추가'}
                        </span>
                    </button>

                    <button className="h search-button">
                        <FontAwesomeIcon icon={faSearch} style={{ fontSize: 24, color: '#FFF' }} />
                    </button>
                </div>
            </div>

            {modalVisible && (
                <div className="h modal-container">
                    {activeSection === 'date' && (
                        <DateModal visible={true} onClose={closeModal} onSelectDates={setSelectedDates} position={modalPosition} />
                    )}
                    {activeSection === 'location' && (
                        <LocationModal visible={true} onClose={closeModal} position={modalPosition} />
                    )}
                    {activeSection === 'guests' && (
                        <GuestsModal visible={true} onClose={closeModal} position={modalPosition} />
                    )}
                </div>
            )}

            <BusinessInfoModal visible={businessInfoVisible} onClose={() => setBusinessInfoVisible(false)} />
            <AuthModal visible={authModalVisible} onClose={() => setAuthModalVisible(false)} type="login" />
            <UserModal visible={userVisible} onClose={() => setUserVisible(false)} />
        </div>
    );
};

export default Header;
