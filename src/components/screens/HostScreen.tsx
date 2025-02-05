import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import MyRoom from "src/components/hostMenu/my_room";
import ContractManagement from "src/components/hostMenu/contract_management";
import RoomStatus from "src/components/hostMenu/room_status";
import Message from "src/components/hostMenu/message";
import Settlement from "src/components/hostMenu/settlement";

function HostScreen() {
    const [activeTab, setActiveTab] = useState("my_room");
    const { t } = useTranslation();

    // 탭 ID와 컴포넌트 매핑
    const components: Record<string, JSX.Element> = {
        my_room: <MyRoom />,
        contract_management: <ContractManagement />,
        room_status: <RoomStatus />,
        message: <Message />,
        settlement: <Settlement />,
    };

    const tabs = ["my_room", "contract_management", "room_status", "message", "settlement"] as const;

    return (
        <div>
            <div className="mb-4">
                <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
                    {tabs.map((tab) => (
                        <li key={tab} className="me-2" role="presentation">
                            <button
                                className={`inline-block p-4 border-b-2 rounded-t-lg ${
                                    activeTab === tab
                                        ? "text-roomi border-roomi"
                                        : "hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
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
            </div>
            <div>
                {tabs.map((tab) => (
                    <div
                        key={tab}
                        className={`p-4 ${activeTab === tab ? "" : "hidden"}`}
                        id={tab}
                        role="tabpanel"
                        aria-labelledby={`${tab}-tab`}
                    >
                        <div>{components[tab]}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default HostScreen;
