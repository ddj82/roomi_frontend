import React, {useEffect} from 'react';
import {useIsHostStore} from "../stores/IsHostStore";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import {useHostModeStore} from "../stores/HostModeStore";
import {logout} from "src/api/api";
import {useChatStore} from "../stores/ChatStore";

export default function GuestMyPageMenu() {
    const { t } = useTranslation();
    const { isHost } = useIsHostStore();
    const { resetUserMode } = useHostModeStore();
    const navigate = useNavigate();
    const disconnect = useChatStore((state) => state.disconnect);

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

    return (
        <div className="w-full flex my-4">
            <div className="border-r w-1/3">
                <div className="my-2 mx-4">
                    <div className="flex_center">프사</div>
                    <div>{localStorage.getItem('userName')}</div>
                    <div>{localStorage.getItem('userEmail')}</div>
                </div>
                <div className="my-2 mx-4">
                    <div>
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
                            <div className="font-bold text-lg my-2">나의 거래</div>
                            <div className="">
                                <div className="my-2">
                                    <button className="w-full text-start">관심 목록</button>
                                </div>
                                <div className="my-2">
                                    <button className="w-full text-start">최근 본 게시물</button>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-300">
                            <div className="font-bold text-lg my-2">기본 설정</div>
                            <div className="">
                                <div className="my-2">
                                    <button className="w-full text-start">알림</button>
                                </div>
                                <div className="my-2">
                                    <button className="w-full text-start">언어</button>
                                </div>
                                <div className="my-2">
                                    <button className="w-full text-start">통화</button>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-300">
                            <div className="font-bold text-lg my-2">고객 지원</div>
                            <div className="">
                                <div className="my-2">
                                    <button className="w-full text-start">공지사항</button>
                                </div>
                                <div className="my-2">
                                    <button className="w-full text-start">FAQ</button>
                                </div>
                                <div className="my-2">
                                    <button className="w-full text-start">고객센터</button>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-300">
                            <div className="font-bold text-lg my-2">계정</div>
                            <div className="">
                                <div className="my-2">
                                    <button onClick={handleLogout} className="w-full text-start">로그아웃</button>
                                </div>
                                <div className="my-2">
                                    <button className="w-full text-start">회원탈퇴</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="border-l w-full">
                <div className="m-2">
                    게스트 마이페이지 컨텐츠
                </div>
            </div>
        </div>
    );
};
