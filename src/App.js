import React from 'react';
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
import './App.css';
import 'src/css/Modal.css';
import 'src/css/Calendar.css';
import ProtectedAuthRoute from "./api/ProtectedAuthRoute";
import GuestMyPageMenu from "./components/screens/GuestMyPageMenu";
import HostMyPageMenu from "./components/screens/HostMyPageMenu";
import ProtectedHostRoute from "./api/ProtectedHostRoute";
import ProtectedGuestRoute from "./api/ProtectedGuestRoute";
import KakaoLoginCallback from "./components/util/KakaoLoginCallback";
import SocialJoinScreen from "./components/screens/SocialJoinScreen";


export default function App() {
    return (
        <Router>
            <Header/>
            <div className="app container xl:max-w-[1200px]"
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
                            <Route path="/myPage" element={<GuestMyPageMenu/>}/>
                            <Route path="/chat" element={<UserMessage/>}/>
                            <Route path="/detail/:roomId/:locale/reservation" element={<GuestReservationSetScreen/>}/>
                            <Route path="/detail/:roomId/:locale/reservation/payment" element={<GuestReservationScreen/>}/>
                            <Route path="/hostAgree" element={<HostModeAgreeScreen/>}/>
                        </Route>
                    </Route>
                    {/* hostMode === false 일 때 /host/* 페이지 차단 */}
                    <Route element={<ProtectedHostRoute />}>
                        <Route path="/host" element={<HostScreen/>}/>
                        <Route path="/host/insert" element={<MyRoomInsert/>}/>
                        <Route path="/host/myPage" element={<HostMyPageMenu/>}/>
                    </Route>
                </Routes>
            </div>
            <div className="hide-on-mobile">
                <Footer/>
            </div>
        </Router>
    );
}
