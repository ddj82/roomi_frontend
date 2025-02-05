import React, {useEffect, useState} from 'react';
import Modal from 'react-modal';
import '../../css/GuestsModal.css'; // CSS 파일 import

interface GuestsModalProps {
    visible: boolean;
    onClose: () => void;
    position: { x: number; y: number };
}

const GuestsModal = ({ visible, onClose, position }: GuestsModalProps) => {
    const [adults, setAdults] = useState(0);
    const [children, setChildren] = useState(0);

    const handleCount = (type: 'adults' | 'children', action: 'increase' | 'decrease') => {
        if (type === 'adults') {
            setAdults(prev => action === 'increase' ? prev + 1 : Math.max(0, prev - 1));
        } else {
            setChildren(prev => action === 'increase' ? prev + 1 : Math.max(0, prev - 1));
        }
    };

    useEffect(() => {
        if (visible) {
            document.body.style.overflow = 'hidden'; // 스크롤 방지
        } else {
            document.body.style.overflow = 'auto'; // 스크롤 복원
        }
        return () => {
            document.body.style.overflow = 'auto'; // 컴포넌트 언마운트 시 복원
        };
    }, [visible]);

    return (
        <Modal
            isOpen={visible}
            onRequestClose={onClose}
            overlayClassName="overlay"
            style={{
                content: {
                    position: 'absolute',
                    top: `${position.y}px`,
                    left: `${position.x}px`,
                    width: '360px',
                    backgroundColor: '#FFF',
                    borderRadius: '12px',
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                },
            }}
            className="guestsModal"
        >
            <div className="guestsModal modal-container">
                <div className="guestsModal guest-type-container">
                    <div>
                        <h3 className="guestsModal guest-type-title">성인</h3>
                        <p className="guestsModal guest-type-subtitle">13세 이상</p>
                    </div>
                    <div className="guestsModal counter-container">
                        <button
                            className={`guestsModal counter-button ${adults === 0 ? 'guestsModal disabled-button' : ''}`}
                            onClick={() => handleCount('adults', 'decrease')}
                            disabled={adults === 0}
                        >
                            <span className="guestsModal counter-button-text">-</span>
                        </button>
                        <span className="guestsModal counter-text">{adults}</span>
                        <button
                            className="guestsModal counter-button"
                            onClick={() => handleCount('adults', 'increase')}
                        >
                            <span className="guestsModal counter-button-text">+</span>
                        </button>
                    </div>
                </div>

                <div className="guestsModal divider" />

                <div className="guestsModal guest-type-container">
                    <div>
                        <h3 className="guestsModal guest-type-title">어린이</h3>
                        <p className="guestsModal guest-type-subtitle">2~12세</p>
                    </div>
                    <div className="guestsModal counter-container">
                        <button
                            className={`guestsModal counter-button ${children === 0 ? 'guestsModal disabled-button' : ''}`}
                            onClick={() => handleCount('children', 'decrease')}
                            disabled={children === 0}
                        >
                            <span className="guestsModal counter-button-text">-</span>
                        </button>
                        <span className="guestsModal counter-text">{children}</span>
                        <button
                            className="guestsModal counter-button"
                            onClick={() => handleCount('children', 'increase')}
                        >
                            <span className="guestsModal counter-button-text">+</span>
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default GuestsModal;
