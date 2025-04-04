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
    faGlobe, faHeadset,
    faPenToSquare, faQuestionCircle, faSignOutAlt, faUserMinus,
} from "@fortawesome/free-solid-svg-icons";
import {useAuthStore} from "../stores/AuthStore";
import GuestMyPageMobileContent from "./GuestMyPageMobileContent";
import "src/css/MyPage.css"

export default function GuestMyPageMobile() {
    const { t } = useTranslation();
    const { isHost } = useIsHostStore();
    const { resetUserMode } = useHostModeStore();
    const disconnect = useChatStore((state) => state.disconnect);
    const navigate = useNavigate();
    const { menu } = useParams();
    const selectedMenu = menu || "";
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
        if (selectedMenu !== "") {
            return <GuestMyPageMobileContent selectedMenu={selectedMenu}/>
        }
    };

    const handleSetSelectedMenu = (selectMenu: string) => {
        navigate(`/myPage/${selectMenu}`);
    };

    return (
        <div className="w-full my-4 flex flex-col md:flex-row relative text-black">
            {/* 메뉴 영역 */}
            <div className="guest-mypage-left md:border-r md:w-1/4 lg:w-1/5">
                <div className="m-2 mx-4 mb-6">
                    <div className="flex items-center justify-center">
                        <div className="relative">
                            <img src={profileImg} alt="프로필사진" className="rounded-full w-32 h-32 mb-4 object-cover border-2 "/>
                        </div>
                    </div>
                    <div className="text-center font-semibold text-xl">{localStorage.getItem('userName')}</div>
                    <div className="text-center text-black text-base mt-1">{localStorage.getItem('userEmail')}</div>
                </div>
                <div className="my-3 mx-4">
                    <div className="my-2">
                        {!isHost && (
                            <button onClick={handleSetHostMode}
                                    className="w-full p-3 text-white bg-roomi rounded-lg hover:bg-opacity-90 transition duration-300 text-lg font-medium">
                                {t("호스트 등록")}
                            </button>
                        )}
                    </div>
                </div>
                <div className="my-3 mx-4">
                    <div className="w-full">
                        <div className="border-t border-gray-300 pt-4">
                            <div className="font-bold text-xl mb-4">{t("나의 거래")}</div>
                            <div className="">
                                <div className="my-3">
                                    <button className="w-full text-start p-3 hover:bg-gray-100 rounded-md transition duration-200 text-lg" onClick={() => handleSetSelectedMenu('예약내역')}>
                                        <FontAwesomeIcon icon={faRectangleList} className="w-5 h-5 mr-3 "/>
                                        {t("예약 내역")}
                                    </button>
                                </div>
                                <div className="my-3">
                                    <button className="w-full text-start p-3 hover:bg-gray-100 rounded-md transition duration-200 text-lg" onClick={() => handleSetSelectedMenu('관심')}>
                                        <FontAwesomeIcon icon={faThumbsUp} className="w-5 h-5 mr-3 "/>{t("관심 목록")}
                                    </button>
                                </div>
                                <div className="my-3">
                                    <button className="w-full text-start p-3 hover:bg-gray-100 rounded-md transition duration-200 text-lg" onClick={() => handleSetSelectedMenu('최근본게시물')}>
                                        <FontAwesomeIcon icon={faEye} className="w-5 h-5 mr-3 "/>{t("최근 본 게시물")}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-300 pt-4 mt-4">
                            <div className="font-bold text-xl mb-4">{t("기본 설정")}</div>
                            <div className="">
                                <div className="my-3">
                                    <button className="w-full text-start p-3 hover:bg-gray-100 rounded-md transition duration-200 text-lg" onClick={() => handleSetSelectedMenu('알림')}>
                                        <FontAwesomeIcon icon={faBell} className="w-5 h-5 mr-3 "/>{t("알림 설정")}
                                    </button>
                                </div>
                                <div className="my-3">
                                    <button className="w-full text-start p-3 hover:bg-gray-100 rounded-md transition duration-200 text-lg" onClick={() => handleSetSelectedMenu('언어')}>
                                        <FontAwesomeIcon icon={faGlobe} className="w-5 h-5 mr-3 "/>{t("언어 설정")}
                                    </button>
                                </div>
                                <div className="my-3">
                                    <button className="w-full text-start p-3 hover:bg-gray-100 rounded-md transition duration-200 text-lg" onClick={() => handleSetSelectedMenu('통화')}>
                                        <FontAwesomeIcon icon={faDollarSign} className="w-5 h-5 mr-3 "/>{t("통화 설정")}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-300 pt-4 mt-4">
                            <div className="font-bold text-xl mb-4">{t("고객 지원")}</div>
                            <div className="">
                                <div className="my-3">
                                    <button className="w-full text-start p-3 hover:bg-gray-100 rounded-md transition duration-200 text-lg" onClick={() => handleSetSelectedMenu('공지사항')}>
                                        <FontAwesomeIcon icon={faBullhorn} className="w-5 h-5 mr-3 "/>
                                        {t("공지사항")}
                                    </button>
                                </div>
                                <div className="my-3">
                                    <button className="w-full text-start p-3 hover:bg-gray-100 rounded-md transition duration-200 text-lg" onClick={() => handleSetSelectedMenu('FAQ')}>
                                        <FontAwesomeIcon icon={faQuestionCircle} className="w-5 h-5 mr-3 "/>
                                        FAQ
                                    </button>
                                </div>
                                <div className="my-3">
                                    <button className="w-full text-start p-3 hover:bg-gray-100 rounded-md transition duration-200 text-lg" onClick={() => handleSetSelectedMenu('고객센터')}>
                                        <FontAwesomeIcon icon={faHeadset} className="w-5 h-5 mr-3 "/>
                                        {t("고객센터")}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-300 pt-4 mt-4">
                            <div className="font-bold text-xl mb-4">{t("계정 설정")}</div>
                            <div className="">
                                <div className="my-3">
                                    <button className="w-full text-start p-3 hover:bg-gray-100 rounded-md transition duration-200 text-lg" onClick={() => handleSetSelectedMenu('내정보')}>
                                        <FontAwesomeIcon icon={faPenToSquare} className="w-5 h-5 mr-3 "/>
                                        {t("내 정보")}
                                    </button>
                                </div>
                                <div className="my-3">
                                    <button className="w-full text-start p-3 hover:bg-gray-100 rounded-md transition duration-200 text-lg" onClick={handleLogout}>
                                        <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5 mr-3 "/>
                                        {t("로그아웃")}
                                    </button>
                                </div>
                                <div className="my-3">
                                    <button className="w-full text-start p-3 hover:bg-gray-100 rounded-md transition duration-200 text-lg">
                                        <FontAwesomeIcon icon={faUserMinus} className="w-5 h-5 mr-3 "/>
                                        {t("회원탈퇴")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* 데스크톱 전용 오른쪽 콘텐츠 (모바일에서는 숨김) */}
            <div className="guest-mypage-right md:w-3/4 lg:w-4/5 hidden md:block scrollbar-hidden">
                <div id="myPageContent" className="p-6 md:p-8">
                    {renderMenuContent()}
                </div>
            </div>
            {/* 모바일에서만 오버레이 표시 */}
            {isMobile && selectedMenu && (
                <div className="fixed top-0 left-0 w-full h-full bg-white z-50 flex flex-col overflow-hidden">
                    <div className="flex items-center p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
                        <button className="mr-4 px-4 py-3 rounded-full bg-gray-100 hover:bg-gray-200 transition duration-200 text-lg" onClick={() => handleSetSelectedMenu('')}>
                            <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl font-bold">{selectedMenu}</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* 메뉴 내용 표시 */}
                        {renderMenuContent()}
                    </div>
                </div>
            )}
        </div>
    );
};
