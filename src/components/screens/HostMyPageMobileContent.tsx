import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import Notices from "./myPageMenu/Notices";
import FAQ from "./myPageMenu/FAQ";
import HelpCenter from "./myPageMenu/HelpCenter";

// Define the component in plain JavaScript to avoid TypeScript errors
function HostMyPageMobileContent(props :any) {
    // Destructure the props
    const selectedMenu = props.selectedMenu;
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    // 콘텐츠 렌더링 함수
    const renderContent = () => {
        if (loading) return <div className="flex items-center justify-center p-4">Loading...</div>;

        switch (selectedMenu) {
            case '관심 목록':
                return (
                    <div className="p-2">
                        <h3 className="text-lg font-semibold mb-4">{t("관심 목록")}</h3>
                        <p className="text-gray-600 mb-4">{t("저장한 관심 목록이 여기에 표시됩니다.")}</p>
                        {/* 관심 목록 콘텐츠 */}
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <p>{t("저장된 관심 목록이 없습니다.")}</p>
                        </div>
                    </div>
                );

            case '최근 본 게시물':
                return (
                    <div className="p-2">
                        <h3 className="text-lg font-semibold mb-4">{t("최근 본 게시물")}</h3>
                        <p className="text-gray-600 mb-4">{t("최근에 확인한 게시물 목록입니다.")}</p>
                        {/* 최근 본 게시물 콘텐츠 */}
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <p>{t("최근 본 게시물이 없습니다.")}</p>
                        </div>
                    </div>
                );

            case '수입 및 통계':
                return (
                    <div className="p-2">
                        <h3 className="text-lg font-semibold mb-4">{t("수입 및 통계")}</h3>
                        <p className="text-gray-600 mb-4">{t("호스트 활동의 수입과 통계 정보를 확인할 수 있습니다.")}</p>

                        {/* 수입 요약 */}
                        <div className="bg-white shadow rounded-lg p-4 mb-4">
                            <h4 className="font-medium mb-3">{t("이번 달 수입")}</h4>
                            <div className="text-2xl font-bold text-green-600">₩0</div>
                            <div className="mt-2 text-sm text-gray-500">{t("아직 수입이 발생하지 않았습니다.")}</div>
                        </div>

                        {/* 통계 정보 */}
                        <div className="bg-white shadow rounded-lg p-4">
                            <h4 className="font-medium mb-3">{t("방문자 통계")}</h4>
                            <div className="text-sm text-gray-500">{t("등록된 통계 정보가 없습니다.")}</div>
                        </div>
                    </div>
                );

            case '영수증':
                return (
                    <div className="p-2">
                        <h3 className="text-lg font-semibold mb-4">{t("영수증")}</h3>
                        <p className="text-gray-600 mb-4">{t("거래 내역 및 영수증을 확인할 수 있습니다.")}</p>

                        {/* 영수증 목록 */}
                        <div className="bg-white shadow rounded-lg p-4">
                            <h4 className="font-medium mb-3">{t("거래 내역")}</h4>
                            <div className="text-sm text-gray-500">{t("최근 거래 내역이 없습니다.")}</div>
                        </div>
                    </div>
                );

            case '공지사항':
                return <Notices />;

            case 'FAQ':
                return <FAQ />;

            case '고객센터':
                return <HelpCenter />;

            case '내 정보':
                return (
                    <div className="p-2">
                        <h3 className="text-lg font-semibold mb-4">{t("내 정보")}</h3>

                        {/* 프로필 정보 편집 */}
                        <div className="bg-white shadow rounded-lg p-4 mb-4">
                            <h4 className="font-medium mb-3">{t("프로필 정보")}</h4>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("이름")}
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={localStorage.getItem('userName') || ''}
                                    readOnly
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("이메일")}
                                </label>
                                <input
                                    type="email"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={localStorage.getItem('userEmail') || ''}
                                    readOnly
                                />
                            </div>

                            <button className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition duration-200">
                                {t("정보 수정")}
                            </button>
                        </div>

                        {/* 비밀번호 변경 */}
                        <div className="bg-white shadow rounded-lg p-4">
                            <h4 className="font-medium mb-3">{t("비밀번호 변경")}</h4>
                            <button className="w-full bg-gray-200 text-gray-800 p-2 rounded-md hover:bg-gray-300 transition duration-200">
                                {t("비밀번호 변경하기")}
                            </button>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-gray-500">{t("선택된 메뉴가 없습니다.")}</p>
                    </div>
                );
        }
    };

    return (
        <div className="host-mobile-content">
            {renderContent()}
        </div>
    );
}

// If you're using a JavaScript file but TypeScript compiler is still checking it,
// you can use this line at the top of your file to disable type checking:
// @ts-nocheck

// Export the component
export default HostMyPageMobileContent;