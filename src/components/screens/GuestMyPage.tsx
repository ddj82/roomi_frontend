import React, {useEffect, useState} from 'react';
import {useIsHostStore} from "../stores/IsHostStore";
import {useTranslation} from "react-i18next";
import {useNavigate, useParams} from "react-router-dom";
import {useHostModeStore} from "../stores/HostModeStore";
import {logout} from "src/api/api";
import {useChatStore} from "../stores/ChatStore";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBell, faEye, faRectangleList, faThumbsUp} from '@fortawesome/free-regular-svg-icons';
import {
    faArrowLeft, faBullhorn,
    faDollarSign,
    faGlobe, faHeadset, faHome,
    faPenToSquare, faQuestionCircle, faSignOutAlt, faTimes, faUserMinus,
} from "@fortawesome/free-solid-svg-icons";
import {useAuthStore} from "../stores/AuthStore";
import GuestMyPageContent from "./GuestMyPageContent";
import "src/css/MyPage.css"
import MyReservations from "./myPageMenu/MyReservations";
import {
    Bell,
    ChevronRight,
    DollarSign,
    Edit3,
    Eye,
    Globe,
    Headphones,
    Heart,
    HelpCircle,
    List, LogOut,
    Megaphone, UserMinus, X
} from "lucide-react";

export default function GuestMyPage() {
    const { t } = useTranslation();
    const { isHost } = useIsHostStore();
    const { resetUserMode } = useHostModeStore();
    const disconnect = useChatStore((state) => state.disconnect);
    const navigate = useNavigate();
    const { menu } = useParams();
    const selectedMenu = menu ?? "";
    const [loading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const {profileImg} = useAuthStore();

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
        const confirmCancel = window.confirm(t('로그아웃 하시겠습니까?'));
        if (!confirmCancel) return;
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

    const handleSetHostMode = () => {
        navigate('/hostAgree');
    };

    // 메뉴 내용 렌더링 로직을 함수로 분리
    const renderMenuContent = () => {
        if (loading) return <div className="flex_center">Loading...</div>;
        if (!selectedMenu) {
            return <MyReservations/>;
        }
        if (selectedMenu !== "") {
            return <GuestMyPageContent selectedMenu={selectedMenu}/>
        }
    };

    const handleSetSelectedMenu = (selectMenu: string) => {
        navigate(`/myPage/${selectMenu}`);
    };

    return (
        <div className="w-full my-4 flex flex-col md:flex-row relative text-black">
            {/* 메뉴 영역 */}
            {/* 웹 버전 메뉴 - 더 작은 폰트와 간격 */}
            <div className="guest-mypage-left md:border-r md:w-1/4 lg:w-1/5 hidden md:block">
                <div className="m-2 mx-4 mb-4">
                    <div className="flex items-center justify-center">
                        <div className="relative">
                            <img
                                src={profileImg}
                                alt="프로필사진"
                                className="rounded-full w-24 h-24 mb-3 object-cover border-2"
                            />
                        </div>
                    </div>
                    <div className="text-center font-semibold text-lg">{localStorage.getItem('userName')}</div>
                    <div className="text-center text-black text-sm mt-1">{localStorage.getItem('userEmail')}</div>
                </div>

                <div className="my-2 mx-4">
                    <div className="my-2">
                        {!isHost && (
                            <button
                                onClick={handleSetHostMode}
                                className="w-full p-2 text-white bg-roomi rounded-lg hover:bg-opacity-90 transition duration-300 text-base font-medium"
                            >
                                {t("호스트 등록")}
                            </button>
                        )}
                    </div>
                </div>

                <div className="my-2 mx-4">
                    <div className="w-full">
                        <div className="border-t border-gray-300 pt-3 px-6">
                            <div className="text-base mb-2">{t("나의 거래")}</div>
                            <div className="">
                                <div className="my-1">
                                    <button
                                        className="w-full text-start p-2 hover:bg-gray-100 rounded-md transition duration-200 text-sm"
                                        onClick={() => handleSetSelectedMenu('예약 내역')}
                                    >
                                        <List className="w-4 h-4 mr-2 inline"/>
                                        {t("예약 내역")}
                                    </button>
                                </div>
                                <div className="my-1">
                                    <button
                                        className="w-full text-start p-2 hover:bg-gray-100 rounded-md transition duration-200 text-sm"
                                        onClick={() => handleSetSelectedMenu('관심 목록')}
                                    >
                                        <Heart className="w-4 h-4 mr-2 inline"/>
                                        {t("관심 목록")}
                                    </button>
                                </div>
                                <div className="my-1">
                                    <button
                                        className="w-full text-start p-2 hover:bg-gray-100 rounded-md transition duration-200 text-sm"
                                        onClick={() => handleSetSelectedMenu('최근 본 게시물')}
                                    >
                                        <Eye className="w-4 h-4 mr-2 inline"/>
                                        {t("최근 본 게시물")}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-300 pt-3 mt-3 px-6">
                            <div className="text-base mb-2">{t("기본 설정")}</div>
                            <div className="">
                                <div className="my-1">
                                    <button
                                        className="w-full text-start p-2 hover:bg-gray-100 rounded-md transition duration-200 text-sm"
                                        onClick={() => handleSetSelectedMenu('알림 설정')}
                                    >
                                        <Bell className="w-4 h-4 mr-2 inline"/>
                                        {t("알림 설정")}
                                    </button>
                                </div>
                                <div className="my-1">
                                    <button
                                        className="w-full text-start p-2 hover:bg-gray-100 rounded-md transition duration-200 text-sm"
                                        onClick={() => handleSetSelectedMenu('언어 설정')}
                                    >
                                        <Globe className="w-4 h-4 mr-2 inline"/>
                                        {t("언어 설정")}
                                    </button>
                                </div>
                                <div className="my-1">
                                    <button
                                        className="w-full text-start p-2 hover:bg-gray-100 rounded-md transition duration-200 text-sm"
                                        onClick={() => handleSetSelectedMenu('통화 설정')}
                                    >
                                        <DollarSign className="w-4 h-4 mr-2 inline"/>
                                        {t("통화 설정")}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-300 pt-3 mt-3 px-6">
                            <div className="text-base mb-2">{t("고객 지원")}</div>
                            <div>
                                <div className="my-1">
                                    <button
                                        className="w-full text-start p-2 hover:bg-gray-100 rounded-md transition duration-200 text-sm"
                                        onClick={() => handleSetSelectedMenu('공지사항')}
                                    >
                                        <Megaphone className="w-4 h-4 mr-2 inline"/>
                                        {t("공지사항")}
                                    </button>
                                </div>
                                <div className="my-1">
                                    <button
                                        className="w-full text-start p-2 hover:bg-gray-100 rounded-md transition duration-200 text-sm"
                                        onClick={() => handleSetSelectedMenu('FAQ')}
                                    >
                                        <HelpCircle className="w-4 h-4 mr-2 inline"/>
                                        FAQ
                                    </button>
                                </div>
                                <div className="my-1">
                                    <button
                                        className="w-full text-start p-2 hover:bg-gray-100 rounded-md transition duration-200 text-sm"
                                        onClick={() => handleSetSelectedMenu('고객센터')}
                                    >
                                        <Headphones className="w-4 h-4 mr-2 inline"/>
                                        {t("고객센터")}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-300 pt-3 mt-3 px-6">
                            <div className="text-base mb-2">{t("계정 설정")}</div>
                            <div>
                                <div className="my-1">
                                    <button
                                        className="w-full text-start p-2 hover:bg-gray-100 rounded-md transition duration-200 text-sm"
                                        onClick={() => handleSetSelectedMenu('내 정보')}
                                    >
                                        <Edit3 className="w-4 h-4 mr-2 inline"/>
                                        {t("내 정보")}
                                    </button>
                                </div>
                                <div className="my-1">
                                    <button
                                        className="w-full text-start p-2 hover:bg-gray-100 rounded-md transition duration-200 text-sm"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="w-4 h-4 mr-2 inline"/>
                                        {t("로그아웃")}
                                    </button>
                                </div>
                                <div className="my-1">
                                    <button
                                        className="w-full text-start p-2 hover:bg-gray-100 rounded-md transition duration-200 text-sm">
                                        <UserMinus className="w-4 h-4 mr-2 inline"/>
                                        {t("회원탈퇴")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 모바일 버전 메뉴 - 그리드 레이아웃 적용 */}
            <div className="guest-mypage-left md:hidden">
                {/* 상단 앱바 영역 */}
                <div className="bg-white border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-700"/>
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900">마이 루미</h1>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <LogOut className="w-6 h-6 text-red-500"/>
                        </button>
                    </div>
                </div>

                {/* 프로필 카드 */}
                <div className="bg-white mx-4 my-4 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <img
                                    src={profileImg}
                                    alt="프로필사진"
                                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-semibold text-gray-900">{localStorage.getItem('userName')}</h2>
                                <p className="text-sm text-gray-500">{localStorage.getItem('userEmail')}</p>
                                <div className="mt-2">
                  <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {isHost ? '호스트' : '게스트'}
                  </span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400"/>
                        </div>
                    </div>
                </div>

                {/* 호스트 등록 버튼 */}
                {!isHost && (
                    <div className="mx-4 mb-6">
                        <button
                            onClick={handleSetHostMode}
                            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold text-base shadow-sm hover:bg-blue-700 transition-colors"
                        >
                            {t("호스트 등록")}
                        </button>
                    </div>
                )}

                {/* 메뉴 섹션들 */}
                <div className="space-y-6 px-4 pb-8">
                    {/* 나의 거래 */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 px-2">
                            {t("나의 거래")}
                        </h3>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <button
                                className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                                onClick={() => handleSetSelectedMenu('예약 내역')}
                            >
                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                                    <List className="w-5 h-5 text-gray-600"/>
                                </div>
                                <span className="text-base font-medium text-gray-900 flex-1 text-left">
                  {t("예약 내역")}
                </span>
                                <ChevronRight className="w-5 h-5 text-gray-400"/>
                            </button>

                            <button
                                className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                                onClick={() => handleSetSelectedMenu('관심 목록')}
                            >
                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                                    <Heart className="w-5 h-5 text-gray-600"/>
                                </div>
                                <span className="text-base font-medium text-gray-900 flex-1 text-left">
                  {t("관심 목록")}
                </span>
                                <ChevronRight className="w-5 h-5 text-gray-400"/>
                            </button>

                            <button
                                className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors"
                                onClick={() => handleSetSelectedMenu('최근 본 게시물')}
                            >
                                <div
                                    className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                                    <Eye className="w-5 h-5 text-gray-600"/>
                                </div>
                                <span className="text-base font-medium text-gray-900 flex-1 text-left">
                  {t("최근 본")}
                </span>
                                <ChevronRight className="w-5 h-5 text-gray-400"/>
                            </button>
                        </div>
                    </div>

                    {/* 기본 설정 */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 px-2">
                            {t("기본 설정")}
                        </h3>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <button
                                className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                                onClick={() => handleSetSelectedMenu('알림 설정')}
                            >
                                <div
                                    className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                                    <Bell className="w-5 h-5 text-gray-600"/>
                                </div>
                                <span className="text-base font-medium text-gray-900 flex-1 text-left">
                  {t("알림")}
                </span>
                                <ChevronRight className="w-5 h-5 text-gray-400"/>
                            </button>

                            <button
                                className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                                onClick={() => handleSetSelectedMenu('언어 설정')}
                            >
                                <div
                                    className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                                    <Globe className="w-5 h-5 text-gray-600"/>
                                </div>
                                <span className="text-base font-medium text-gray-900 flex-1 text-left">
                  {t("언어")}
                </span>
                                <ChevronRight className="w-5 h-5 text-gray-400"/>
                            </button>

                            <button
                                className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors"
                                onClick={() => handleSetSelectedMenu('통화 설정')}
                            >
                                <div
                                    className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                                    <DollarSign className="w-5 h-5 text-gray-600"/>
                                </div>
                                <span className="text-base font-medium text-gray-900 flex-1 text-left">
                  {t("통화")}
                </span>
                                <ChevronRight className="w-5 h-5 text-gray-400"/>
                            </button>
                        </div>
                    </div>

                    {/* 고객 지원 */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 px-2">
                            {t("고객 지원")}
                        </h3>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <button
                                className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                                onClick={() => handleSetSelectedMenu('공지사항')}
                            >
                                <div
                                    className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                                    <Megaphone className="w-5 h-5 text-gray-600"/>
                                </div>
                                <span className="text-base font-medium text-gray-900 flex-1 text-left">
                  {t("공지사항")}
                </span>
                                <ChevronRight className="w-5 h-5 text-gray-400"/>
                            </button>

                            <button
                                className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                                onClick={() => handleSetSelectedMenu('FAQ')}
                            >
                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                                    <HelpCircle className="w-5 h-5 text-gray-600"/>
                                </div>
                                <span className="text-base font-medium text-gray-900 flex-1 text-left">
                  FAQ
                </span>
                                <ChevronRight className="w-5 h-5 text-gray-400"/>
                            </button>

                            <button
                                className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors"
                                onClick={() => handleSetSelectedMenu('고객센터')}
                            >
                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                                    <Headphones className="w-5 h-5 text-gray-600"/>
                                </div>
                                <span className="text-base font-medium text-gray-900 flex-1 text-left">
                  {t("고객센터")}
                </span>
                                <ChevronRight className="w-5 h-5 text-gray-400"/>
                            </button>
                        </div>
                    </div>

                    {/* 계정 설정 */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 px-2">
                            {t("계정 설정")}
                        </h3>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <button
                                className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                                onClick={() => handleSetSelectedMenu('내 정보')}
                            >
                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                                    <Edit3 className="w-5 h-5 text-gray-600"/>
                                </div>
                                <span className="text-base font-medium text-gray-900 flex-1 text-left">
                  {t("내 정보")}
                </span>
                                <ChevronRight className="w-5 h-5 text-gray-400"/>
                            </button>

                            <button
                                className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors"
                                onClick={() => handleSetSelectedMenu('회원탈퇴')}
                            >
                                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                                    <UserMinus className="w-5 h-5 text-red-600"/>
                                </div>
                                <span className="text-base font-medium text-red-600 flex-1 text-left">
                  {t("회원탈퇴")}
                </span>
                                <ChevronRight className="w-5 h-5 text-gray-400"/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 데스크톱 전용 오른쪽 콘텐츠 (모바일에서는 숨김) */}
            <div className="guest-mypage-right md:w-3/4 lg:w-4/5 hidden md:flex flex-col scrollbar-hidden">
                {/* 제목 고정 */}
                <div className="px-8 pt-6 pb-2">
                    <h2 className="text-2xl ">{selectedMenu === '' ? t('예약 내역') : t(selectedMenu)}</h2>
                </div>

                {/* 아래 내용만 스크롤되게 */}
                <div
                    id="myPageContent"
                    className="guest-mypage-right flex-1 overflow-y-auto px-8 pb-8 scrollbar-hidden"
                >
                    {renderMenuContent()}
                </div>
            </div>

            {/* 모바일에서만 오버레이 표시 */}
            {isMobile && selectedMenu && (
                <div className="fixed top-0 left-0 w-full h-full bg-white z-50 flex flex-col overflow-hidden">
                    {/* 상단 앱바 영역 - 마이페이지와 동일한 스타일 */}
                    <div className="bg-white border-b border-gray-200 px-4 py-3">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => handleSetSelectedMenu('')}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="w-6 h-6 text-gray-700"/>
                            </button>
                            <h1 className="text-lg font-semibold text-gray-900">{t(selectedMenu)}</h1>
                            <div className="w-10 h-10"></div> {/* 우측 여백을 위한 빈 div */}
                        </div>
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
