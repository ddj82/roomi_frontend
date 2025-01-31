import React, { useContext, useState } from "react";
import Modal from "react-modal"; // react-modal 사용
import { FaUser, FaSignOutAlt, FaRegHeart, FaCogs, FaRegEnvelope, FaRegStar } from "react-icons/fa"; // react-icons 사용
import { useTranslation } from "react-i18next";
import { logout } from "src/api/api";
import { HostModeContext } from "src/components/auth/HostModeContext";
import { useNavigate } from "react-router-dom"; // 웹에서는 react-router-dom 사용

interface UserModalProps {
    visible: boolean;
    onClose: () => void;
}

export const UserModal = ({ visible, onClose }: UserModalProps) => {
    const { t } = useTranslation();
    const { hostMode, toggleUserMode } = useContext(HostModeContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await logout();
            console.log(response);
            onClose();
        } catch (error) {
            console.error("로그아웃 실패:", error);
        }
    };

    const handleMessage = () => {
        console.log("메시지 메뉴");
    };

    const handleFavorite = () => {
        console.log("찜 목록 메뉴");
    };

    const handleHostManage = () => {
        console.log("호스트 관리 메뉴");
        navigate("/host-screen"); // 리액트 웹에서는 react-router-dom을 사용하여 화면 이동
    };

    const handleSettings = () => {
        console.log("계정 설정 메뉴");
    };

    return (
        <Modal
            isOpen={visible}
            onRequestClose={onClose}
            contentLabel="User Modal"
            className="userModal modal-container"
            overlayClassName="userModal overlay"
        >
            <div className="userModal modal-content">
                <div className="userModal header">
                    <h2 className="userModal title">관리자</h2>
                    <button onClick={onClose} className="userModal close-button">
                        <FaUser size={24} color="#666" />
                    </button>
                </div>

                <div className="userModal content">
                    {hostMode ? (
                        <>
                            <button onClick={toggleUserMode} className="userModal menu-item">
                                <FaUser size={30} />
                                {t("게스트 전환")}
                            </button>
                            <button onClick={handleHostManage} className="userModal menu-item">
                                <FaCogs size={30} />
                                {t("호스트 관리")}
                            </button>
                        </>
                    ) : (
                        <button onClick={toggleUserMode} className="userModal menu-item">
                            <FaUser size={30} />
                            {t("호스트 전환")}
                        </button>
                    )}

                    <button onClick={handleMessage} className="userModal menu-item">
                        <FaRegEnvelope size={30} />
                        {t("메시지")}
                    </button>

                    <button onClick={handleFavorite} className="userModal menu-item">
                        <FaRegHeart size={30} />
                        {t("찜 목록")}
                    </button>

                    <button onClick={handleSettings} className="userModal menu-item">
                        <FaCogs size={30} />
                        {t("계정 설정")}
                    </button>

                    <button onClick={handleLogout} className="userModal menu-item">
                        <FaSignOutAlt size={30} />
                        {t("로그아웃")}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
