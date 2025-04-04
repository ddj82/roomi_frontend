import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Footer from "./components/footer/Footer";
import Header from "./components/header/Header";
import MainHome from "./components/screens/MainHome";
import RoomDetailScreen from "./components/screens/RoomDetailScreen";
import HostModeAgreeScreen from "./components/screens/HostModeAgreeScreen";
import HostScreen from "./components/screens/HostScreen";
import NaverMap from "./components/map/NaverMap";
import MyRoomInsert from "./components/hostMenu/myRooms/MyRoomInsert";
import GuestReservationSetScreen from "./components/screens/GuestReservationSetScreen";
import GuestReservationScreen from "./components/screens/GuestReservationScreen";
import UserJoinScreen from "./components/screens/UserJoinScreen";
import UserMessage from "./components/screens/UserMessage";
import 'src/css/Modal.css';
import 'src/css/Calendar.css';
import ProtectedAuthRoute from "./api/ProtectedAuthRoute";
import GuestMyPageMobile from "./components/screens/GuestMyPageMobile";
import HostMyPage from "./components/screens/HostMyPage";
import ProtectedHostRoute from "./api/ProtectedHostRoute";
import ProtectedGuestRoute from "./api/ProtectedGuestRoute";
import KakaoLoginCallback from "./components/util/KakaoLoginCallback";
import SocialJoinScreen from "./components/screens/SocialJoinScreen";
import SuccessPage from "./components/toss/SuccessPage";
import {useHeaderStore, useHeaderVisibility} from "./components/stores/HeaderStore";
import { useLocation } from "react-router-dom";

export default function App() {
    return (
        <Router>
            <AppContent/>
        </Router>
    );
}

function AppContent() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const location = useLocation();
    const { setVisibility } = useHeaderStore();

    // 경로 변경 감지해서 헤더 visible 상태 설정
    useEffect(() => {
        const isMyPage = location.pathname.startsWith("/myPage");
        setVisibility(!isMobile || !isMyPage);  // 모바일 && myPage면 숨김
    }, [location.pathname, isMobile]); // <- 경로 or 모바일 상태가 바뀔 때마다 재평가

    // resize에 대한 반응 처리
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const isVisible = useHeaderStore((state) => state.isVisible);

    return (
        <>
            {isVisible && <Header />}
            <div className="app container xl:max-w-[1500px]"
                // style={{minHeight: window.innerHeight - 130,}}
            >
                <Routes>
                    {/* hostMode === true 일 때 이 부분 전부 차단됨 */}
                    <Route element={<ProtectedGuestRoute />}>
                        <Route path="/" element={<MainHome/>}/>
                        <Route path="/naver" element={<NaverMap/>}/>
                        <Route path="/join" element={<UserJoinScreen/>}/>
                        <Route path="/detail/:roomId/:locale" element={<RoomDetailScreen/>}/>
                        <Route path="/sign-up" element={<KakaoLoginCallback/>}/>
                        <Route path="/join/social" element={<SocialJoinScreen/>}/>

                        {/* 로그인 사용자 만 접근 가능 */}
                        <Route element={<ProtectedAuthRoute />}>
                            <Route path="/myPage" element={<GuestMyPageMobile/>}/>
                            <Route path="/myPage/:menu" element={<GuestMyPageMobile />} />
                            <Route path="/chat" element={<UserMessage/>}/>
                            <Route path="/detail/:roomId/:locale/reservation" element={<GuestReservationSetScreen/>}/>
                            <Route path="/detail/:roomId/:locale/reservation/payment" element={<GuestReservationScreen/>}/>
                            <Route path="/success" element={<SuccessPage/>}/>
                            <Route path="/hostAgree" element={<HostModeAgreeScreen/>}/>
                        </Route>
                    </Route>
                    {/* hostMode === false 일 때 /host/* 페이지 차단 */}
                    <Route element={<ProtectedHostRoute />}>
                        <Route path="/host" element={<HostScreen/>}/>
                        <Route path="/host/insert" element={<MyRoomInsert/>}/>
                        <Route path="/host/myPage" element={<HostMyPage/>}/>
                    </Route>
                </Routes>
            </div>
            <div className="hide-on-mobile">
                <Footer/>
            </div>
        </>
    );
}
