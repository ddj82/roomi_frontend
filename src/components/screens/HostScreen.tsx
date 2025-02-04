// import React, { useState } from 'react';
//
// const HostScreen = () => {
//     const [activeTab, setActiveTab] = useState('나의 방');
//
//     const renderContent = () => {
//         switch (activeTab) {
//             case '나의 방':
//                 return <div>나의 방 내용</div>;
//             case '계약 관리':
//                 return <div>계약 관리 내용</div>;
//             case '방 현황':
//                 return <div>방 현황 내용</div>;
//             case '메시지':
//                 return <div>메시지 내용</div>;
//             case '정산':
//                 return <div>정산 내용</div>;
//             default:
//                 return <div>탭을 선택해주세요.</div>;
//         }
//     };
//
//     return (
//         <div>
//             <h1>호스트 관리 페이지</h1>
//             <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
//                 {['나의 방', '계약 관리', '방 현황', '메시지', '정산'].map((tab) => (
//                     <button
//                         key={tab}
//                         onClick={() => setActiveTab(tab)}
//                         style={{
//                             padding: '10px',
//                             backgroundColor: activeTab === tab ? '#6200ea' : '#f0f0f0',
//                             color: activeTab === tab ? '#ffffff' : '#000000',
//                             border: 'none',
//                             cursor: 'pointer',
//                         }}
//                     >
//                         {tab}
//                     </button>
//                 ))}
//             </div>
//             <div>{renderContent()}</div>
//         </div>
//     );
// };
//
// export default HostScreen;
import React, { useState } from "react";

function HostScreen() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gray-100">
            {/* Menu Button */}
            <button
                onClick={toggleMenu}
                className="px-4 py-2 text-white bg-blue-500 rounded"
            >
                {isOpen ? "Close Menu" : "Open Menu"}
            </button>

            {/* Sliding Menu */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white transform ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                } transition-transform duration-300`}
            >
                <ul className="mt-10 space-y-4 px-6">
                    <li>
                        <a href="#" className="block hover:text-blue-400">
                            Home
                        </a>
                    </li>
                    <li>
                        <a href="#" className="block hover:text-blue-400">
                            About
                        </a>
                    </li>
                    <li>
                        <a href="#" className="block hover:text-blue-400">
                            Services
                        </a>
                    </li>
                    <li>
                        <a href="#" className="block hover:text-blue-400">
                            Contact
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default HostScreen;
