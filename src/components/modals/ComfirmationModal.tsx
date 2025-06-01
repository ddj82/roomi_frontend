import React from 'react';
import {
    AlertCircle,
    Info,
    HelpCircle,
    AlertTriangle,
} from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    confirmButtonStyle?: 'primary' | 'danger' | 'warning';
    icon?: 'warning' | 'question' | 'info' | 'danger';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
                                                                 isOpen,
                                                                 onClose,
                                                                 onConfirm,
                                                                 title,
                                                                 message,
                                                                 confirmText = '확인',
                                                                 cancelText = '취소',
                                                                 confirmButtonStyle = 'primary',
                                                                 icon = 'warning'
                                                             }) => {
    if (!isOpen) return null;

    // 아이콘 렌더링
    const renderIcon = () => {
        const iconClasses = "mx-auto mb-4 md:mb-6 w-12 h-12 md:w-16 md:h-16";

        switch (icon) {
            case 'warning':
                return <AlertTriangle className={`${iconClasses} text-gray-700`} />;
            case 'danger':
                return <AlertCircle className={`${iconClasses} text-gray-700`} />;
            case 'question':
                return <HelpCircle className={`${iconClasses} text-gray-700`} />;
            case 'info':
                return <Info className={`${iconClasses} text-gray-700`} />;
            default:
                return <Info className={`${iconClasses} text-gray-700`} />;
        }
    };

    // 확인 버튼 스타일
    const getConfirmButtonClass = () => {
        const baseClass = "w-full focus:ring-4 focus:outline-none font-medium rounded-lg text-base px-6 py-3.5 md:py-4 transition duration-300 ease-in-out";

        switch (confirmButtonStyle) {
            case 'danger':
                return `text-white bg-gray-700 hover:bg-gray-800 focus:ring-red-300 ${baseClass}`;
            case 'warning':
                return `text-white bg-gray-700 hover:bg-gray-800 focus:ring-yellow-300 ${baseClass}`;
            case 'primary':
            default:
                return `text-white bg-gray-700 hover:bg-gray-800 focus:ring-roomi-light ${baseClass}`;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="relative w-full max-w-sm md:max-w-md bg-white dark:bg-gray-800 rounded-xl md:rounded-lg shadow-2xl animate-in zoom-in-95 duration-200">
                {/* 닫기 버튼 */}
                <button
                    className="absolute top-3 right-3 md:top-4 md:right-4 text-gray-500 dark:text-gray-400 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 rounded-full text-sm p-2 transition duration-200 touch-manipulation"
                    onClick={onClose}
                >
                    <svg className="w-4 h-4 md:w-5 md:h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7L1 13"/>
                    </svg>
                </button>

                {/* 모달 내용 */}
                <div className="p-5 md:p-6 text-center">
                    {renderIcon()}
                    <h3 className="mb-3 md:mb-4 text-lg md:text-xl font-semibold md:font-medium text-gray-800 dark:text-gray-200 leading-tight">
                        {title}
                    </h3>
                    {message && (
                        <p className="mb-5 md:mb-6 text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                            {message}
                        </p>
                    )}

                    {/* 버튼 그룹 */}
                    <div className="flex flex-col gap-3 w-full">
                        <button
                            className={getConfirmButtonClass()}
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </button>
                        {cancelText && (
                            <button
                                className="w-full text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-600 font-medium rounded-lg text-base px-6 py-3.5 md:py-4 transition duration-300 ease-in-out touch-manipulation"
                                onClick={onClose}
                            >
                                {cancelText}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;