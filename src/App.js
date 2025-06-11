import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, Routes, Route, useLocation} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Footer from "./components/footer/Footer";
import Header from "./components/header/Header";
import RoomDetailScreen from "./components/screens/RoomDetailScreen";
import HostModeAgreeScreen from "./components/screens/HostModeAgreeScreen";
import HostScreen from "./components/screens/HostScreen";
import MyRoomInsert from "./components/hostMenu/myRooms/MyRoomInsert";
import GuestReservationSetScreen from "./components/screens/GuestReservationSetScreen";
import GuestReservationScreen from "./components/screens/GuestReservationScreen";
import UserJoinScreen from "./components/screens/UserJoinScreen";
import UserMessage from "./components/screens/UserMessage";
import 'src/css/Modal.css';
import 'src/css/Calendar.css';
import ProtectedAuthRoute from "./api/ProtectedAuthRoute";
import GuestMyPage from "./components/screens/GuestMyPage";
import HostMyPage from "./components/screens/HostMyPage";
import ProtectedHostRoute from "./api/ProtectedHostRoute";
import ProtectedGuestRoute from "./api/ProtectedGuestRoute";
import KakaoLoginCallback from "./components/util/KakaoLoginCallback";
import SocialJoinScreen from "./components/screens/SocialJoinScreen";
import SuccessPage from "./components/pay/SuccessPage";
import {useHeaderStore} from "./components/stores/HeaderStore";
import {useHostHeaderBtnVisibility} from "./components/stores/HostHeaderBtnStore";
import BottomNavigator from "./components/navigator/BottomNavigator";
import MyRoomUpdate from "./components/hostMenu/myRooms/MyRoomUpdate";
import LoginPage from "./components/screens/link/LoginPage";
import LineLoginCallback from "./components/util/LineLoginCallback";
import Main from "./components/screens/Main";
import MobileHostHeader from "./components/screens/MobileHostHeader";
import FailPage from "./components/pay/FailPage";
import MainMap from "./components/screens/MainMap";

const queryClient = new QueryClient();

export default function App() {
    return (
        <Router>
            <QueryClientProvider client={queryClient}>
                <AppContent/>
            </QueryClientProvider>
        </Router>
    );
}

function AppContent() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const location = useLocation();
    const { setVisibility } = useHeaderStore();
    const isVisibleHostScreen = useHostHeaderBtnVisibility();

    // 경로 변경 감지해서 헤더 visible 상태 설정
    useEffect(() => {
        const isMyPage = location.pathname.startsWith("/myPage") || location.pathname.startsWith("/host");
        const isRoomDetail = location.pathname.includes("/detail/") && !location.pathname.includes("/reservation");
        // 모바일 && (마이페이지 또는 방 상세 페이지)면 헤더 숨김
        setVisibility(!isMobile || !(isMyPage || isRoomDetail));
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
            {isVisibleHostScreen && isMobile && (
                <MobileHostHeader/>
            )}
            <div className="app container xl:max-w-[1524px]]"
                // style={{minHeight: window.innerHeight - 130,}}
            >
                <Routes>
                    {/* hostMode === true 일 때 이 부분 전부 차단됨 */}
                    <Route element={<ProtectedGuestRoute />}>
                        <Route path="/" element={<Main/>}/>
                        <Route path="/join" element={<UserJoinScreen/>}/>
                        <Route path="/detail/:roomId/:locale" element={<RoomDetailScreen/>}/>
                        <Route path="/sign-up" element={<KakaoLoginCallback/>}/>
                        <Route path="/sign-up/line" element={<LineLoginCallback/>}/>
                        <Route path="/join/social" element={<SocialJoinScreen/>}/>
                        <Route path="/login" element={<LoginPage/>}/>
                        {/* 로그인 사용자 만 접근 가능 */}
                        <Route element={<ProtectedAuthRoute />}>
                            <Route path="/myPage" element={<GuestMyPage/>}/>
                            <Route path="/myPage/:menu" element={<GuestMyPage />} />
                            <Route path="/chat" element={<UserMessage/>}/>
                            <Route path="/detail/:roomId/:locale/reservation" element={<GuestReservationSetScreen/>}/>
                            <Route path="/detail/:roomId/:locale/reservation/payment" element={<GuestReservationScreen/>}/>
                            <Route path="/success" element={<SuccessPage/>}/>
                            <Route path="/fail" element={<FailPage/>}/>
                            <Route path="/hostAgree" element={<HostModeAgreeScreen/>}/>
                        </Route>
                    </Route>
                    {/* hostMode === false 일 때 /host/* 페이지 차단 */}
                    <Route element={<ProtectedHostRoute />}>
                        <Route path="/host" element={<HostScreen/>}/>
                        <Route path="/host/teb/:menu" element={<HostScreen/>}/>
                        <Route path="/host/insert" element={<MyRoomInsert/>}/>
                        <Route path="/host/update/:roomId" element={<MyRoomUpdate/>}/>
                        <Route path="/host/myPage" element={<HostMyPage/>}/>
                        <Route path="/host/myPage/:menu" element={<HostMyPage/>}/>
                    </Route>
                </Routes>
            </div>
            <Routes>
                <Route element={<ProtectedGuestRoute />}>
                    <Route path="/map" element={<MainMap/>}/>
                </Route>
            </Routes>
            {isVisibleHostScreen && isMobile && <BottomNavigator />}
            <div className="hide-on-mobile">
                <Footer/>
            </div>
        </>
    );
}