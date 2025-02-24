import React, {useState} from 'react';
import {useTranslation} from "react-i18next";

const Message = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("전체");
    const tabs = ["전체", "안읽은 메시지"] as const;
    return (
        <div>
            <div className="flex_center">
                {tabs.map((tab) => (
                    <div key={tab} className="text-sm text-center text-black">
                        <button
                            className={`
                                inline-block px-4 py-3 hover:text-roomi
                                ${activeTab === tab ? "text-roomi border-b-2 border-roomi" : "text-black"}
                                `}
                            onClick={() => setActiveTab(tab)}
                            type="button"
                            role="tab"
                            aria-controls={tab}
                            aria-selected={activeTab === tab}
                        >
                            {t(tab)}
                        </button>
                    </div>
                ))}
            </div>
            <div>
                {activeTab === '전체' ? ('전체 메시지'): ('안읽은 메시지')}
            </div>
        </div>
    );
};

export default Message;
