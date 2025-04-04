import React, {useEffect, useState} from 'react';
import {useChatStore} from "../stores/ChatStore";
import {logout} from "../../api/api";
import {useHostModeStore} from "../stores/HostModeStore";
import {useTranslation} from "react-i18next";
import {useMediaQuery} from "react-responsive";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import Notices from "./myPageMenu/Notices";
import FAQ from "./myPageMenu/FAQ";
import HelpCenter from "./myPageMenu/HelpCenter";

export default function HostMyPage() {
    const { t } = useTranslation();
    const { resetUserMode } = useHostModeStore();
    const disconnect = useChatStore((state) => state.disconnect);
    const [selectedMenu, setSelectedMenu] = useState('');
    const [loading, setLoading] = useState(false);
    const isMobile = useMediaQuery({ maxWidth: 768 }); // 768px 이하를 모바일로 간주
    const [profileImg, setProfileImg] = useState('');

    useEffect(() => {
        const img = localStorage.getItem('userProfileImg');
        if (img) setProfileImg(img);
    }, []);

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
        if (loading) return <p className="flex_center">Loading...</p>;
        if (!selectedMenu) return <p className="flex_center">메뉴를 선택해주세요.</p>;

        switch (selectedMenu) {
            case '관심':
                return '';
            case '공지사항':
                return <Notices/>;
            case 'FAQ':
                return <FAQ/>;
            case '고객센터':
                return <HelpCenter/>;
            default:
                return <p className="flex_center">메뉴를 선택해주세요.</p>;
        }
    };

    return (
        <div className="w-full my-4 flex flex-col md:flex-row relative">
            {/* 메뉴 영역 */}
            <div className="md:border-r md:w-1/3">
                <div className="m-2 mx-4 mb-4">
                    <div className="flex_center">
                        <img src={profileImg} alt="프로필사진" className="rounded-full w-28 h-28 mb-4"/>
                    </div>
                    <div className="flex_center">{localStorage.getItem('userName')}</div>
                    <div className="flex_center">{localStorage.getItem('userEmail')}</div>
                </div>
                <div className="my-2 mx-4">
                    <div className="w-full">
                        <div className="border-t border-gray-300">
                            <div className="font-bold text-lg my-2">제목1</div>
                            <div className="">
                                <div className="my-2">
                                    <button className="w-full text-start">1</button>
                                </div>
                                <div className="my-2">
                                    <button className="w-full text-start">2</button>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-300">
                            <div className="font-bold text-lg my-2">제목2</div>
                            <div className="">
                                <div className="my-2">
                                    <button className="w-full text-start">1</button>
                                </div>
                                <div className="my-2">
                                    <button className="w-full text-start">2</button>
                                </div>
                                <div className="my-2">
                                    <button className="w-full text-start">3</button>
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
                    <button className="mb-4 px-3 py-2 bg-gray-200 rounded" onClick={() => setSelectedMenu('')}>
                        <FontAwesomeIcon icon={faArrowLeft}/>
                    </button>
                    {/* 메뉴 내용 표시 */}
                    {renderMenuContent()}
                </div>
            )}
        </div>
    );
};
