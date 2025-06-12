import React, {useEffect, useState} from "react";
import {useHostTabNavigation} from "../stores/HostTabStore";
import {useHostModeStore} from "../stores/HostModeStore";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import HostScreenContent from "./HostScreenContent";
import {useHostHeaderBtnVisibility} from "../stores/HostHeaderBtnStore";
import BottomNavigator from "../navigator/BottomNavigator";


export default function HostScreen({isMobile}: { isMobile: boolean; }) {
    const {activeTab, setActiveTab} = useHostTabNavigation(); // 전역 상태에서 activeTab 가져오기
    const {hostMode} = useHostModeStore();
    const navigate = useNavigate();
    const { menu } = useParams<{ menu?: string }>();
    const isVisibleHostScreen = useHostHeaderBtnVisibility();

    /* 호스트 모드가 아니면 홈으로 */
    useEffect(() => {
        if (!hostMode) navigate("/");
    }, [hostMode]);

    /* URL ↔ activeTab 동기화 */
    useEffect(() => {
        /* /host/:menu 에서 menu 추출 */
        const currentTab = menu ?? "";
        if (currentTab && currentTab !== activeTab) {
            setActiveTab(activeTab); // Zustand 갱신
        }
    }, [menu, activeTab, setActiveTab]);

    // 메뉴 렌더링 로직을 함수로 분리
    const renderMenu = () => {
        if (!activeTab) {
            return <HostScreenContent/>;
        }
        if (activeTab !== "") {
            return <HostScreenContent selectedMenu={activeTab}/>
        }
    };

    const { pathname } = useLocation();
    const isBrowserMobile = /iPhone|Android/.test(navigator.userAgent);

    // 1. window.innerHeight 를 읽어서 state 로 저장
    const [vh, setVh] = useState(() => window.innerHeight);

    useEffect(() => {
        const onResize = () => setVh(window.innerHeight);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // 2. wrapper 높이는 innerHeight(px) 그대로
    // -> iOS 사파리 주소창/메뉴바 숨김 시 innerHeight 가 자동으로 바뀜

    return (
        <div className="my-4 px-3 h-[80vh]">
            {renderMenu()}
            <div className="h-16 md:hidden"></div>
            {(isVisibleHostScreen && isMobile) && (
                <div
                    style={{
                        position: 'fixed',
                        left: 0,
                        right: 0,
                        bottom: 'env(safe-area-inset-bottom)',  // 홈바 위에 붙이기
                        height: 56,                             // 네비게이터 실제 높이
                        paddingBottom: 'env(safe-area-inset-bottom)',
                        background: '#fff',
                    }}
                >
                    <BottomNavigator/>
                </div>
            )}
        </div>
    );
}
