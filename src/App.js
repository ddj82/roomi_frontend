import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Footer from "./components/footer/Footer";
import Header from "./components/header/Header";
import MainHome from "./components/screens/MainHome";
import './App.css';

export default function App() {
    return (
        <Router>
            <Header/>
            <div className="app container">
                <Routes>
                    <Route path="/" element={<MainHome/>}/>
                </Routes>
            </div>
            <Footer/>
        </Router>
    );
}
