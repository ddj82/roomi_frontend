import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Footer from "./components/footer/Footer";
import Header from "./components/header/Header";
import MainHome from "./components/screens/MainHome";
import './App.css';
import RoomDetailScreen from "./components/screens/RoomDetailScreen";
import AuthProvider from "./components/auth/AuthContext";
import {HostModeProvider} from "./components/auth/HostModeContext";
import {IsHostProvider} from "./components/auth/IsHostContext";
import HostModeAgreeScreen from "./components/screens/HostModeAgreeScreen";
import HostScreen from "./components/screens/HostScreen";
import {HeaderBtnProvider} from "./components/auth/HeaderBtnContext";
import 'src/css/Modal.css';
import 'src/css/Calendar.css';
import NaverMap from "./components/map/NaverMap";
import MyRoomInsert from "./components/hostMenu/myRooms/MyRoomInsert";
import {HostTabProvider} from "./components/auth/HostTabContext";


export default function App() {
    return (
        <Router>
            <AuthProvider>
                <IsHostProvider>
                    <HostModeProvider>
                        <HeaderBtnProvider>
                            <HostTabProvider>
                                <Header/>
                                <div className="app container xl:max-w-[1200px]"
                                     style={{minHeight: window.innerHeight,}}>
                                    <Routes>
                                        <Route path="/" element={<MainHome/>}/>
                                        <Route path="/detail/:roomId/:locale" element={<RoomDetailScreen/>}/>
                                        <Route path="/hostAgree" element={<HostModeAgreeScreen/>}/>
                                        <Route path="/host" element={<HostScreen/>}/>
                                        <Route path="/naver" element={<NaverMap/>}/>
                                        <Route path="/host/insert" element={<MyRoomInsert/>}/>
                                    </Routes>
                                </div>
                                <Footer/>
                            </HostTabProvider>
                        </HeaderBtnProvider>
                    </HostModeProvider>
                </IsHostProvider>
            </AuthProvider>
        </Router>
    );
}
