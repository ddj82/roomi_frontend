import Modal from "react-modal";
import React, {useEffect} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import {useTranslation} from "react-i18next";

// 모달 오픈 시 접근성 위해 루트 요소 설정 (앱 진입 시 한 번만 호출)
Modal.setAppElement("#root");

interface CommonModalProps {
    isOpen: boolean;
    onRequestClose: () => void;
    title?: string;
    children: React.ReactNode;
    widthClassName?: string; // Tailwind width 클래스 (선택)
    heightClassName?: string; // Tailwind width 클래스 (선택)
    zIndex?: number;
    customClassName?: string;
    contentClassName?: string;
}

const CommonModal = ({
                         isOpen,
                         onRequestClose,
                         title,
                         children,
                         widthClassName = "w-full",
                         heightClassName = "h-[100dvh]",
                         zIndex = 10000,
                         customClassName,
                         contentClassName,
}: CommonModalProps) => {
    const {t} = useTranslation();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            shouldCloseOnOverlayClick={true}
            shouldCloseOnEsc={true}
            style={{
                overlay: {
                    zIndex: zIndex,
                },
            }}
            overlayClassName={`fixed inset-0 bg-black/50 flex items-center justify-center`}
            className={`
                bg-white/95 px-4 shadow-lg outline-none modal-animation overflow-y-auto
                ${customClassName} ${widthClassName} ${heightClassName}
            `}
        >
            <div className="sticky top-0 bg-transparent z-[9999] flex items-center py-4 md:py-6">
                <button
                    className="p-2 rounded-full"
                    onClick={onRequestClose}
                >
                    <FontAwesomeIcon icon={faTimes} className="text-gray-800 text-lg"/>
                </button>
                {(title && title !== '') && (
                    <div className="w-full flex_center text-lg md:text-xl font-semibold">{t(title)}</div>
                )}
                <div className="w-8"></div>
            </div>
            <div className={`${contentClassName}`}>{children}</div>
        </Modal>
    );
};

export default CommonModal;
