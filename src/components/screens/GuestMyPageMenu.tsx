import React, {useEffect, useState} from 'react';
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
    const [selectedMenu, setSelectedMenu] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

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

    // 메뉴가 바뀔 때마다 해당 API 호출
    useEffect(() => {
        if (!selectedMenu) return;

        // const fetchData = async () => {
        //     setLoading(true);
        //     try {
        //         let response;
        //         if (selectedMenu === 'wishlist') {
        //             response = await axios.get('/api/wishlist');
        //         } else if (selectedMenu === 'recent') {
        //             response = await axios.get('/api/recent');
        //         }
        //         // 필요한 메뉴에 맞게 추가 조건문 작성
        //         setData(response.data);
        //     } catch (error) {
        //         console.error('API 호출 오류:', error);
        //     } finally {
        //         setLoading(false);
        //     }
        // };
        //
        // fetchData();
    }, [selectedMenu]);

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
                                    <button className="w-full text-start" onClick={() => setSelectedMenu('wishlist')}>
                                        관심 목록
                                    </button>
                                </div>
                                <div className="my-2">
                                    <button className="w-full text-start" onClick={() => setSelectedMenu('recent')}>
                                        최근 본 게시물
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-300">
                            <div className="font-bold text-lg my-2">기본 설정</div>
                            <div className="">
                                <div className="my-2">
                                    <button className="w-full text-start" onClick={() => setSelectedMenu('wishlist')}>
                                        알림
                                    </button>
                                </div>
                                <div className="my-2">
                                    <button className="w-full text-start" onClick={() => setSelectedMenu('wishlist')}>
                                        언어
                                    </button>
                                </div>
                                <div className="my-2">
                                    <button className="w-full text-start" onClick={() => setSelectedMenu('wishlist')}>
                                        통화
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-300">
                            <div className="font-bold text-lg my-2">고객 지원</div>
                            <div className="">
                                <div className="my-2">
                                    <button className="w-full text-start" onClick={() => setSelectedMenu('wishlist')}>
                                        공지사항
                                    </button>
                                </div>
                                <div className="my-2">
                                    <button className="w-full text-start" onClick={() => setSelectedMenu('wishlist')}>
                                        FAQ
                                    </button>
                                </div>
                                <div className="my-2">
                                    <button className="w-full text-start" onClick={() => setSelectedMenu('wishlist')}>
                                        고객센터
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-300">
                            <div className="font-bold text-lg my-2">계정</div>
                            <div className="">
                                <div className="my-2">
                                    <button className="w-full text-start" onClick={handleLogout}>
                                        로그아웃
                                    </button>
                                </div>
                                <div className="my-2">
                                    <button className="w-full text-start" onClick={() => setSelectedMenu('wishlist')}>
                                        회원탈퇴
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="border-l w-full">
                <div id="myPageContent" className="m-2">
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <>
                            {selectedMenu === 'wishlist' && (
                                <div>
                                    <h2>관심 목록</h2>
                                    {/*<pre>{JSON.stringify(data, null, 2)}</pre>*/}
                                </div>
                            )}
                            {selectedMenu === 'recent' && (
                                <div>
                                    <h2>최근 본 게시물</h2>
                                    {/*<pre>{JSON.stringify(data, null, 2)}</pre>*/}
                                </div>
                            )}
                            {!selectedMenu && <p>메뉴를 선택해주세요.</p>}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
