import React, {useState} from 'react';
import ToggleButton from "../../modals/ToggleButton";
import {useTranslation} from "react-i18next";

export default function NotificationSet() {
    const { t } = useTranslation();
    // 유저데이터 바뀌면 컬럼값으로 대체 해야함
    const [toggleOn_1, setToggleOn_1] = useState(false);
    const [toggleOn_2, setToggleOn_2] = useState(false);

    return (
        <div className="p-4 md:px-8">
            <h2 className="mb-4 font_title">{t("알림 설정")}</h2>
            <div className="flex justify-between p-2 py-4 border-b">
                <div>
                    <div className="font-bold mb-2">이메일 수신</div>
                    <div className="text-xs text-gray-400 font-bold">이벤트 및 혜택정보 이메일 수신 허용</div>
                </div>
                <div className="flex_center">
                    <ToggleButton checked={toggleOn_1} onChange={(e: any) => setToggleOn_1(e.target.checked)}/>
                </div>
            </div>
            <div className="flex justify-between p-2 py-4 border-b">
                <div>
                    <div className="font-bold mb-2">SMS 수신</div>
                    <div className="text-xs text-gray-400 font-bold">이벤트 및 혜택정보 이메일 수신 허용</div>
                </div>
                <div className="flex_center">
                    <ToggleButton checked={toggleOn_2} onChange={(e: any) => setToggleOn_2(e.target.checked)}/>
                </div>
            </div>
        </div>
    );
};
