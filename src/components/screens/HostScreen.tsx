import React, {useEffect} from "react";
import {useHostTabNavigation} from "../stores/HostTabStore";
import {useHostModeStore} from "../stores/HostModeStore";
import {useNavigate, useParams} from "react-router-dom";
import HostScreenContent from "./HostScreenContent";


export default function HostScreen() {
    const {activeTab, setActiveTab} = useHostTabNavigation(); // 전역 상태에서 activeTab 가져오기
    const {hostMode} = useHostModeStore();
    const navigate = useNavigate();
    const { menu } = useParams<{ menu?: string }>();

    /* 호스트 모드가 아니면 홈으로 */
    useEffect(() => {
        if (!hostMode) navigate("/");
    }, [hostMode]);

    /* URL ↔ activeTab 동기화 */
    useEffect(() => {
        /* /host/:menu 에서 menu 추출 */
        const currentTab = menu ?? "";
        if (currentTab && currentTab !== activeTab) {
            setActiveTab(currentTab); // Zustand 갱신
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

    return (
        <div className="my-4 px-8 h-[80vh]">
            {renderMenu()}
            <div className="h-16 md:hidden"></div>
        </div>
    );
}
