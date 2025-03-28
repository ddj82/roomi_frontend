import React, {useEffect, useState} from 'react';
import {useIsHostStore} from "../stores/IsHostStore";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import {useHostModeStore} from "../stores/HostModeStore";
import {logout} from "src/api/api";
import {useChatStore} from "../stores/ChatStore";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBell, faEye, faRectangleList, faThumbsUp} from '@fortawesome/free-regular-svg-icons';
import {
    faArrowLeft,
    faDollarSign,
    faGlobe,
    faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import MyFavoriteList from "./myPageMenu/MyFavoriteList";
import MyHistoryList from "./myPageMenu/MyHistoryList";
import NotificationSet from "./myPageMenu/NotificationSet";
import LanguageSet from "./myPageMenu/LanguageSet";
import HelpCenter from "./myPageMenu/HelpCenter";
import FAQ from "./myPageMenu/FAQ";
import Notices from "./myPageMenu/Notices";
import CurrencySet from "./myPageMenu/CurrencySet";
import {useMediaQuery} from "react-responsive";
import MyReservations from "./myPageMenu/MyReservations";
import {useAuthStore} from "../stores/AuthStore";
import MyInfoEdit from "./myPageMenu/MyInfoEdit";

export default function GuestMyPageMenu() {
    const { t } = useTranslation();
    const { isHost } = useIsHostStore();
    const { resetUserMode } = useHostModeStore();
    const navigate = useNavigate();
    const disconnect = useChatStore((state) => state.disconnect);
    const [selectedMenu, setSelectedMenu] = useState('예약내역');
    const [loading, setLoading] = useState(false);
    const isMobile = useMediaQuery({ maxWidth: 768 }); // 768px 이하를 모바일로 간주
    const {profileImg} = useAuthStore();

    useEffect(() => {
        // window.scrollTo({ top: 0, behavior: 'smooth' });
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

    const handleSetHostMode = () => {
        navigate('/hostAgree');
    };

    // 메뉴 내용 렌더링 로직을 함수로 분리
    const renderMenuContent = () => {
        if (loading) return <div className="flex_center">Loading...</div>;
        if (!selectedMenu) return <div className="flex_center">메뉴를 선택해주세요.</div>;

        switch (selectedMenu) {
            case '내정보' :
                return <MyInfoEdit/>;
            case '예약내역':
                return <MyReservations/>;
            case '관심':
                return <MyFavoriteList/>;
            case '최근본게시물':
                return <MyHistoryList/>;
            case '알림':
                return <NotificationSet/>;
            case '언어':
                return <LanguageSet/>;
            case '통화':
                return <CurrencySet/>;
            case '공지사항':
                return <Notices/>;
            case 'FAQ':
                return <FAQ/>;
            case '고객센터':
                return <HelpCenter/>;
            default:
                return <div className="flex_center">메뉴를 선택해주세요.</div>;
        }
    };

    return (
        <div className="w-full my-4 flex flex-col md:flex-row relative">
            {/* 메뉴 영역 */}
            <div className="md:border-r md:w-1/3">
                <div className="m-2 mx-4 mb-4">
                    <div className="flex_center">
                        <div className="relative">
                            {/*<button className="absolute right-1 bottom-3 bg-white rounded-full border border-black w-8 h-8">*/}
                            {/*    /!*<FontAwesomeIcon icon={faPenToSquare} />*!/*/}
                            {/*    <FontAwesomeIcon icon={faGear} />*/}
                            {/*</button>*/}
                            <img src={profileImg} alt="프로필사진" className="rounded-full w-28 h-28 mb-4"/>
                        </div>
                    </div>
                    <div className="flex_center">{localStorage.getItem('userName')}</div>
                    <div className="flex_center">{localStorage.getItem('userEmail')}</div>
                </div>
                <div className="my-2 mx-4">
                    <div className="my-2">
                        {!isHost && (
                            <button onClick={handleSetHostMode}
                                    className="w-full p-2 text-white bg-roomi rounded">
                                {t("호스트 등록")}
                            </button>
                        )}
                    </div>
                </div>
                <div className="my-2 mx-4">
                    <div className="w-full">
                        <div className="border-t border-gray-300">
                            <div className="font-bold text-lg my-2">{t("나의 거래")}</div>
                            <div className="">
                                <div className="my-2">
                                    <button className="w-full text-start" onClick={() => setSelectedMenu('예약내역')}>
                                        <FontAwesomeIcon icon={faRectangleList} className="w-4 h-4 mr-1"/>
                                        {t("예약 내역")}
                                    </button>
                                </div>
                                <div className="my-2">
                                    <button className="w-full text-start" onClick={() => setSelectedMenu('관심')}>
                                        <FontAwesomeIcon icon={faThumbsUp} className="w-4 h-4 mr-1"/>{t("관심 목록")}
                                    </button>
                                </div>
                                <div className="my-2">
                                    <button className="w-full text-start" onClick={() => setSelectedMenu('최근본게시물')}>
                                        <FontAwesomeIcon icon={faEye} className="w-4 h-4 mr-1"/>{t("최근 본 게시물")}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-300">
                            <div className="font-bold text-lg my-2">{t("기본 설정")}</div>
                            <div className="">
                                <div className="my-2">
                                    <button className="w-full text-start" onClick={() => setSelectedMenu('알림')}>
                                        <FontAwesomeIcon icon={faBell} className="w-4 h-4 mr-1"/>{t("알림 설정")}
                                    </button>
                                </div>
                                <div className="my-2">
                                    <button className="w-full text-start" onClick={() => setSelectedMenu('언어')}>
                                        <FontAwesomeIcon icon={faGlobe} className="w-4 h-4 mr-1"/>{t("언어 설정")}
                                    </button>
                                </div>
                                <div className="my-2">
                                    <button className="w-full text-start" onClick={() => setSelectedMenu('통화')}>
                                        <FontAwesomeIcon icon={faDollarSign} className="w-4 h-4 mr-1"/>{t("통화 설정")}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-300">
                            <div className="font-bold text-lg my-2">{t("고객 지원")}</div>
                            <div className="">
                                <div className="my-2">
                                    <button className="w-full text-start" onClick={() => setSelectedMenu('공지사항')}>
                                        {t("공지사항")}
                                    </button>
                                </div>
                                <div className="my-2">
                                    <button className="w-full text-start" onClick={() => setSelectedMenu('FAQ')}>
                                        FAQ
                                    </button>
                                </div>
                                <div className="my-2">
                                    <button className="w-full text-start" onClick={() => setSelectedMenu('고객센터')}>
                                        {t("고객센터")}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-300">
                            <div className="font-bold text-lg my-2">{t("계정 설정")}</div>
                            <div className="">
                                <div className="my-2">
                                    <button className="w-full text-start" onClick={() => setSelectedMenu('내정보')}>
                                        <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4 mr-1"/>
                                        {t("내 정보")}
                                    </button>
                                </div>
                                <div className="my-2">
                                    <button className="w-full text-start" onClick={handleLogout}>
                                        {t("로그아웃")}
                                    </button>
                                </div>
                                <div className="my-2">
                                    <button className="w-full text-start">
                                        {t("회원탈퇴")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* 데스크톱 전용 오른쪽 콘텐츠 (모바일에서는 숨김) */}
            <div className="md:border-l md:w-full hidden md:block">
                <div id="myPageContent" className="m-2">
                    {renderMenuContent()}
                </div>
            </div>
            {/* 모바일에서만 오버레이 표시 */}
            {isMobile && selectedMenu && (
                <div className="absolute top-0 left-0 w-full h-full bg-white z-50 p-4">
                    <button className="mb-4 px-3 py-2 rounded" onClick={() => setSelectedMenu('')}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    {/* 메뉴 내용 표시 */}
                    {renderMenuContent()}
                </div>
            )}
        </div>
    );
};
