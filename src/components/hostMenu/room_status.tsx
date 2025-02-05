import React, {useState} from 'react';
import {useTranslation} from "react-i18next";
import 'react-calendar/dist/Calendar.css'; // 스타일 파일도 import
import RoomSet from 'src/components/hostMenu/room_status_set';
import RoomConfig from 'src/components/hostMenu/room_status_config';

const MyComponent = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("room_status_set");
    const tabs = ["room_status_set", "room_config"] as const;
    return (
        <div>
            <ul className="flex flex-wrap text-sm font-medium text-center text-black">
                {tabs.map((tab) => (
                    <li key={tab} className="me-2">
                        <button
                            className={`inline-block px-4 py-3 rounded-lg hover:text-white hover:bg-roomi ${
                                activeTab === tab
                                    ? "text-white bg-roomi"
                                    : "text-black"
                            }`}
                            onClick={() => setActiveTab(tab)}
                            type="button"
                            role="tab"
                            aria-controls={tab}
                            aria-selected={activeTab === tab}
                        >
                            {t(tab)}
                        </button>
                    </li>
                ))}
            </ul>
            {activeTab === 'room_status_set' ? (
                <div>
                    <RoomSet/>
                </div>
            ) : (
                <div>
                    <RoomConfig/>
                </div>
            )}
        </div>
    );
};

export default MyComponent;
