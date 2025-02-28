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
import UserReservationSetScreen from "./components/screens/UserReservationSetScreen";
import UserReservationScreen from "./components/screens/UserReservationScreen";
import UserJoinScreen from "./components/screens/UserJoinScreen";
import UserMessage from "./components/screens/UserMessage";
import './App.css';
import 'src/css/Modal.css';
import 'src/css/Calendar.css';


export default function App() {
    return (
        <Router>
            <Header/>
            <div className="app container xl:max-w-[1200px]"
                 // style={{minHeight: window.innerHeight - 130,}}
            >
                <Routes>
                    <Route path="/" element={<MainHome/>}/>
                    <Route path="/join" element={<UserJoinScreen/>}/>
                    <Route path="/detail/:roomId/:locale" element={<RoomDetailScreen/>}/>
                    <Route path="/detail/:roomId/:locale/reservation" element={<UserReservationSetScreen/>}/>
                    <Route path="/detail/:roomId/:locale/reservation/payment" element={<UserReservationScreen/>}/>
                    <Route path="/hostAgree" element={<HostModeAgreeScreen/>}/>
                    <Route path="/host" element={<HostScreen/>}/>
                    <Route path="/naver" element={<NaverMap/>}/>
                    <Route path="/host/insert" element={<MyRoomInsert/>}/>
                    <Route path="/chat" element={<UserMessage/>}/>
                </Routes>
            </div>
            <Footer/>
        </Router>
    );
}
