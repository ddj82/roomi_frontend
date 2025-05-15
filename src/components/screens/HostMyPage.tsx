import React, {useEffect, useState} from 'react';
import {useChatStore} from "../stores/ChatStore";
import {logout} from "../../api/api";
import {useHostModeStore} from "../stores/HostModeStore";
import {useTranslation} from "react-i18next";
import {useNavigate, useParams} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faArrowLeft, faBullhorn, faHome, faHeadset, faSignOutAlt, faUserMinus,
    faPenToSquare, faChartLine, faReceipt, faQuestionCircle
} from "@fortawesome/free-solid-svg-icons";
import Notices from "./myPageMenu/Notices";
import FAQ from "./myPageMenu/FAQ";
import HelpCenter from "./myPageMenu/HelpCenter";
import MyInfoEdit from "./myPageMenu/MyInfoEdit";
import HostFAQ from "./myPageMenu/HostFAQ";

export default function HostMyPage() {
    const { t } = useTranslation();
    const { resetUserMode } = useHostModeStore();
    const disconnect = useChatStore((state) => state.disconnect);
    const navigate = useNavigate();
    const { menu } = useParams();
    const selectedMenu = menu ?? "";
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [profileImg, setProfileImg] = useState('');

    useEffect(() => {
        const img = localStorage.getItem('userProfileImg');
        if (img) setProfileImg(img);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [selectedMenu]);

    const handleLogout = async () => {
        try {
            const response = await logout();
            console.log(response);
            resetUserMode();// hostMode 초기화
            disconnect(); // 소켓 서버 닫기
            window.location.href = '/';
        } catch (error) {
            console.error("로그아웃 실패:", error);
        }
    };

    // 메뉴 내용 렌더링 로직을 함수로 분리
    const renderMenuContent = () => {
        if (loading) return <div className="flex items-center justify-center p-4">Loading...</div>;

        switch (selectedMenu) {

            case '수입 및 통계':
                return (
                    <div className="p-2">
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
                return <HostFAQ />;

            case '고객센터':
                return <HelpCenter />;

            case '내 정보':
                return <MyInfoEdit/>;

            default:
                return (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-gray-500">{t("선택된 메뉴가 없습니다.")}</p>
                    </div>
                );
        }
    };

    const handleSetSelectedMenu = (selectMenu:string) => {
        navigate(`/host/myPage/${selectMenu}`);
    };

    return (
        <div className="w-full my-4 flex flex-col md:flex-row relative text-black">
            {/* 웹 버전 메뉴 */}
            <div className="host-mypage-left md:border-r md:w-1/4 lg:w-1/5 hidden md:block">
                <div className="m-2 mx-4 mb-4">
                    <div className="flex items-center justify-center">
                        <div className="relative">
                            <img src={profileImg} alt="프로필사진"
                                 className="rounded-full w-24 h-24 mb-3 object-cover border-2"/>
                        </div>
                    </div>
                    <div className="text-center font-semibold text-lg">{localStorage.getItem('userName')}</div>
                    <div className="text-center text-black text-sm mt-1">{localStorage.getItem('userEmail')}</div>
                </div>

                <div className="my-2 mx-4">
                    <div className="w-full">


                        <div className="border-t border-gray-300 pt-3 mt-3 px-6">
                            <div className="font-bold text-base mb-2">{t("호스트 관리")}</div>
                            <div className="">
                                <div className="my-1">
                                    <button
                                        className="w-full text-start p-2 hover:bg-gray-100 rounded-md transition duration-200 text-sm"
                                        onClick={() => handleSetSelectedMenu('수입 및 통계')}>
                                        <FontAwesomeIcon icon={faChartLine} className="w-4 h-4 mr-2"/>{t("수입 및 통계")}
                                    </button>
                                </div>
                                <div className="my-1">
                                    <button
                                        className="w-full text-start p-2 hover:bg-gray-100 rounded-md transition duration-200 text-sm"
                                        onClick={() => handleSetSelectedMenu('영수증')}>
                                        <FontAwesomeIcon icon={faReceipt} className="w-4 h-4 mr-2"/>{t("영수증")}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-300 pt-3 mt-3 px-6">
                            <div className="font-bold text-base mb-2">{t("고객 지원")}</div>
                            <div>
                                <div className="my-1">
                                    <button
                                        className="w-full text-start p-2 hover:bg-gray-100 rounded-md transition duration-200 text-sm"
                                        onClick={() => handleSetSelectedMenu('공지사항')}>
                                        <FontAwesomeIcon icon={faBullhorn} className="w-4 h-4 mr-2"/>
                                        {t("공지사항")}
                                    </button>
                                </div>
                                <div className="my-1">
                                    <button
                                        className="w-full text-start p-2 hover:bg-gray-100 rounded-md transition duration-200 text-sm"
                                        onClick={() => handleSetSelectedMenu('FAQ')}>
                                        <FontAwesomeIcon icon={faQuestionCircle} className="w-4 h-4 mr-2"/>
                                        FAQ
                                    </button>
                                </div>
                                <div className="my-1">
                                    <button
                                        className="w-full text-start p-2 hover:bg-gray-100 rounded-md transition duration-200 text-sm"
                                        onClick={() => handleSetSelectedMenu('고객센터')}>
                                        <FontAwesomeIcon icon={faHeadset} className="w-4 h-4 mr-2"/>
                                        {t("고객센터")}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-300 pt-3 mt-3 px-6">
                            <div className="font-bold text-base mb-2">{t("계정 설정")}</div>
                            <div>
                                <div className="my-1">
                                    <button
                                        className="w-full text-start p-2 hover:bg-gray-100 rounded-md transition duration-200 text-sm"
                                        onClick={() => handleSetSelectedMenu('내 정보')}>
                                        <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4 mr-2"/>
                                        {t("내 정보")}
                                    </button>
                                </div>
                                <div className="my-1">
                                    <button
                                        className="w-full text-start p-2 hover:bg-gray-100 rounded-md transition duration-200 text-sm"
                                        onClick={handleLogout}>
                                        <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4 mr-2"/>
                                        {t("로그아웃")}
                                    </button>
                                </div>
                                <div className="my-1">
                                    <button
                                        className="w-full text-start p-2 hover:bg-gray-100 rounded-md transition duration-200 text-sm">
                                        <FontAwesomeIcon icon={faUserMinus} className="w-4 h-4 mr-2"/>
                                        {t("회원탈퇴")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 모바일 버전 메뉴 - 그리드 레이아웃 적용 */}
            <div className="host-mypage-left md:hidden p-4">
                {/* 상단 헤더 영역: 홈 아이콘(왼쪽)과 프로필 정보(오른쪽) */}
                <div className="flex items-center justify-between mb-6">
                    {/* 홈 아이콘 - 왼쪽 */}
                    <div>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="p-3 rounded-lg flex items-center justify-center"
                        >
                            <FontAwesomeIcon icon={faHome} className="text-xl text-roomi" />
                        </button>
                    </div>

                    {/* 프로필 정보 - 오른쪽 */}
                    <div className="flex items-center">
                        <div className="flex-1 text-right mr-4">
                            <div className="font-semibold text-lg">{localStorage.getItem('userName')}</div>
                            <div className="text-sm text-gray-600">{localStorage.getItem('userEmail')}</div>
                        </div>
                        <div className="relative">
                            <img src={profileImg} alt="프로필사진"
                                 className="rounded-full w-16 h-16 object-cover border-2"/>
                        </div>
                    </div>
                </div>

                {/* 나의 거래 섹션 */}


                {/* 호스트 관리 섹션 */}
                <div className="font-bold text-xl mb-3">{t("호스트 관리")}</div>
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <button
                        className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg"
                        onClick={() => handleSetSelectedMenu('수입 및 통계')}>
                        <FontAwesomeIcon icon={faChartLine} className="text-xl mb-2"/>
                        <span className="text-sm">{t("수입 및 통계")}</span>
                    </button>
                    <button
                        className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg"
                        onClick={() => handleSetSelectedMenu('영수증')}>
                        <FontAwesomeIcon icon={faReceipt} className="text-xl mb-2"/>
                        <span className="text-sm">{t("영수증")}</span>
                    </button>

                </div>

                {/* 고객 지원 섹션 */}
                <div className="font-bold text-xl mb-3">{t("고객 지원")}</div>
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <button
                        className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg"
                        onClick={() => handleSetSelectedMenu('공지사항')}>
                        <FontAwesomeIcon icon={faBullhorn} className="text-xl mb-2"/>
                        <span className="text-sm">{t("공지사항")}</span>
                    </button>
                    <button
                        className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg"
                        onClick={() => handleSetSelectedMenu('FAQ')}>
                        <FontAwesomeIcon icon={faQuestionCircle} className="text-xl mb-2"/>
                        <span className="text-sm">FAQ</span>
                    </button>
                    <button
                        className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg"
                        onClick={() => handleSetSelectedMenu('고객센터')}>
                        <FontAwesomeIcon icon={faHeadset} className="text-xl mb-2"/>
                        <span className="text-sm">{t("고객센터")}</span>
                    </button>
                </div>

                {/* 계정 설정 섹션 */}
                <div className="font-bold text-xl mb-3">{t("계정 설정")}</div>
                <div className="grid grid-cols-3 gap-3">
                    <button
                        className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg"
                        onClick={() => handleSetSelectedMenu('내 정보')}>
                        <FontAwesomeIcon icon={faPenToSquare} className="text-xl mb-2"/>
                        <span className="text-sm">{t("내 정보")}</span>
                    </button>
                    <button
                        className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg"
                        onClick={handleLogout}>
                        <FontAwesomeIcon icon={faSignOutAlt} className="text-xl mb-2"/>
                        <span className="text-sm">{t("로그아웃")}</span>
                    </button>
                    <button
                        className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg">
                        <FontAwesomeIcon icon={faUserMinus} className="text-xl mb-2"/>
                        <span className="text-sm">{t("회원탈퇴")}</span>
                    </button>
                </div>
            </div>

            {/* 데스크톱 전용 오른쪽 콘텐츠 */}
            <div className="host-mypage-right md:w-3/4 lg:w-4/5 hidden md:flex flex-col scrollbar-hidden">
                {/* 제목 고정 */}
                <div className="px-8 pt-6 pb-2">
                    <h2 className="text-2xl font-bold">{selectedMenu === '' ? '호스트 정보' : selectedMenu}</h2>
                </div>

                {/* 아래 내용만 스크롤되게 */}
                <div
                    id="myPageContent"
                    className="host-mypage-right flex-1 overflow-y-auto px-8 pb-8 scrollbar-hidden"
                >
                    {renderMenuContent()}
                </div>
            </div>

            {/* 모바일에서만 오버레이 표시 */}
            {isMobile && selectedMenu && (
                <div className="fixed top-0 left-0 w-full h-full bg-white z-50 flex flex-col overflow-hidden">
                    <div className="flex items-center p-4 bg-white sticky top-0 z-10">
                        <button className="mr-4 p-2"
                                onClick={() => handleSetSelectedMenu('')}>
                            <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5"/>
                        </button>
                        <h2 className="text-xl font-bold">{selectedMenu}</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        {/* 메뉴 내용 표시 */}
                        {renderMenuContent()}
                    </div>
                </div>
            )}
        </div>
    );
};