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

export default function App() {
    return (
        <Router>
            <AuthProvider>
            <IsHostProvider>
            <HostModeProvider>
            <HeaderBtnProvider>
                <Header/>
                <div className="app container">
                    <Routes>
                        <Route path="/" element={<MainHome/>}/>
                        <Route path="/detail/:roomId/:locale" element={<RoomDetailScreen/>}/>
                        <Route path="/hostAgree" element={<HostModeAgreeScreen/>}/>
                        <Route path="/host" element={<HostScreen/>}/>
                    </Routes>
                </div>
                <Footer/>
            </HeaderBtnProvider>
            </HostModeProvider>
            </IsHostProvider>
            </AuthProvider>
        </Router>
    );
}
