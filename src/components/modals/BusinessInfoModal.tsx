import React from 'react';
import Modal from 'react-modal'; // react-modal로 바꿔줍니다.
import { FaTimes } from 'react-icons/fa'; // MaterialIcons 대신 react-icons 사용
import '../../css/BusinessInfoModal.css'; // 기존 CSS 파일 그대로 사용
import '../../css/Modal.css';

interface BusinessInfoModalProps {
    visible: boolean;
    onClose: () => void;
}

export const BusinessInfoModal: React.FC<BusinessInfoModalProps> = ({ visible, onClose }) => {
    return (
        <Modal
            isOpen={visible}
            onRequestClose={onClose}
            contentLabel="Business Information Modal"
            className="bInfoModal modal-container"
            overlayClassName="bInfoModal overlay"
        >
            <div className="bInfoModal modal-content">
                <div className="bInfoModal header">
                    <h2 className="bInfoModal title">사업자 정보</h2>
                    <button onClick={onClose} className="bInfoModal close-button">
                        <FaTimes size={24} color="#666" />
                    </button>
                </div>

                <div className="bInfoModal content">
                    <div className="bInfoModal info-row">
                        <span className="bInfoModal label">상호명</span>
                        <span className="bInfoModal value">루미(Roomi)</span>
                    </div>
                    <div className="bInfoModal info-row">
                        <span className="bInfoModal label">대표자</span>
                        <span className="bInfoModal value">김민오</span>
                    </div>
                    <div className="bInfoModal info-row">
                        <span className="bInfoModal label">사업자등록번호</span>
                        <span className="bInfoModal value">847-14-02078</span>
                    </div>
                    <div className="bInfoModal info-row">
                        <span className="bInfoModal label">주소</span>
                        <span className="bInfoModal value">서울특별시 서대문구 세무서7길 15-2,204</span>
                    </div>
                    <div className="bInfoModal info-row">
                        <span className="bInfoModal label">이메일</span>
                        <span className="bInfoModal value">roomi.official.kr@gmail.com</span>
                    </div>
                    <div className="bInfoModal info-row">
                        <span className="bInfoModal label">전화번호</span>
                        <span className="bInfoModal value">02-303-1455</span>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
