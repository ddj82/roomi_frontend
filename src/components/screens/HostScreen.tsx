import React from "react";
import MyRoom from "src/components/hostMenu/MyRooms";
import ContractManagement from "src/components/hostMenu/ContractManagement";
import RoomStatus from "src/components/hostMenu/RoomStatus";
import MessageList from "src/components/hostMenu/MessageList";
import Settlement from "src/components/hostMenu/Settlement";
import {useHostTabNavigation} from "../stores/HostTabStore";

const HostScreen: React.FC = () => {
    const { activeTab } = useHostTabNavigation(); // 전역 상태에서 activeTab 가져오기

    // 탭 ID와 컴포넌트 매핑
    const components: Record<string, JSX.Element> = {
        my_room: <MyRoom />,
        contract_management: <ContractManagement />,
        room_status: <RoomStatus />,
        message: <MessageList />,
        settlement: <Settlement />,
    };

    return (
        <div className="my-4 px-8">
            {components[activeTab] || <div>선택된 탭이 없습니다.</div>}
        </div>
    );
}

export default HostScreen;
