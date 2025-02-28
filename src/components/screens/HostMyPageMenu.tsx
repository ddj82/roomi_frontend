import React from 'react';
import {useChatStore} from "../stores/ChatStore";
import {logout} from "../../api/api";
import {useHostModeStore} from "../stores/HostModeStore";

export default function HostMyPageMenu() {
    const { resetUserMode } = useHostModeStore();
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
    return (
        <div className="w-full flex my-4">
            <div className="border-r w-1/3">
                <div className="my-2 mx-4">
                    <div>{localStorage.getItem('userName')}</div>
                    <div>{localStorage.getItem('userEmail')}</div>
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
                    호스트 마이페이지 컨텐츠
                </div>
            </div>
        </div>
    );
};
