import React, { useState } from 'react';
import Modal from 'react-modal';
import '../../css/LocationModal.css';

interface LocationModalProps {
    visible: boolean;
    onClose: () => void;
    position: { x: number; y: number };
}

const LocationModal = ({ visible, onClose, position }: LocationModalProps) => {
    const [searchText, setSearchText] = useState('');

    const popularLocations = [
        '서울', '부산', '제주', '강원',
        '경기', '인천', '대구', '대전'
    ];

    return (
        <Modal
            isOpen={visible}
            onRequestClose={onClose}
            style={{
                content: {
                    position: 'absolute',
                    top: `${position.y}px`,
                    left: `${position.x}px`,
                    width: '360px',
                    maxHeight: '400px',
                    backgroundColor: '#FFF',
                    borderRadius: '12px',
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                    padding: '16px',
                },
            }}
        >
            <div className="locationModal modal-container">
                <div className="locationModal search-container">
                    <input
                        type="text"
                        className="locationModal search-input"
                        placeholder="어디로 여행가세요?"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>

                <div className="locationModal content">
                    <h3 className="locationModal section-title">인기 여행지</h3>
                    <div className="locationModal location-grid">
                        {popularLocations.map((location) => (
                            <button
                                key={location}
                                className="locationModal location-item"
                                onClick={() => setSearchText(location)}
                            >
                                {location}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default LocationModal;
