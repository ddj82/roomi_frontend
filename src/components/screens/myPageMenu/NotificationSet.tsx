import React, {useEffect, useRef, useState} from 'react';
import ToggleButton from "../../util/ToggleButton";
import {useTranslation} from "react-i18next";
import {acceptions} from "../../../api/api";

export default function NotificationSet() {
    const { t } = useTranslation();
    // 유저데이터 바뀌면 컬럼값으로 대체 해야함
    const [alert, setAlert] = useState(false);
    const [SMS, setSMS] = useState(false);
    const [email, setEmail] = useState(false);

    // 초기 토글 상태 (모두 false)
    const toggles = useRef({t1: false, t2: false, t3: false,});
    
    // 유저값으로 초기화
    useEffect(() => {
        const acceptAlert = Boolean(Number(localStorage.getItem('accept_alert')));
        const acceptSMS = Boolean(Number(localStorage.getItem('accept_SMS')));
        const acceptEmail = Boolean(Number(localStorage.getItem('accept_email')));

        setAlert(acceptAlert);
        setSMS(acceptSMS);
        setEmail(acceptEmail);

        toggles.current = {t1: acceptAlert, t2: acceptSMS, t3: acceptEmail};
    }, []);

    // 현재 상태가 모두 초기 상태와 동일한지 확인
    const isInitialState =
        alert === toggles.current.t1 &&
        SMS === toggles.current.t2 &&
        email === toggles.current.t3;

    // 버튼 클릭 시 동작 (실제 로직 추가)
    const handleSave = async () => {
        try {
            const response = await acceptions(alert, SMS, email);
            if (response) {
                window.location.reload();
            }
        } catch (e) {
            console.log('알림 설정 API 오류:', e);
        }
    };

    return (
        <div className="p-4 md:px-8">
            <div className="flex justify-between items-center mb-4">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isInitialState}  // 초기 상태이면 비활성화
                    className={`py-2 px-5 text-white text-sm rounded
                        ${isInitialState ? 'bg-gray-300 cursor-not-allowed' : 'bg-roomi'}
                    `}
                >
                    {t('수정')}
                </button>
            </div>
            <div className="flex justify-between p-2 py-4 border-b">
                <div>
                    <div className="font-bold mb-2">푸시 알림</div>
                    <div className="text-xs text-gray-400 font-bold">이벤트 및 혜택정보 이메일 수신 허용</div>
                </div>
                <div className="flex_center">
                    <ToggleButton checked={alert} onChange={(e: any) => setAlert(e.target.checked)}/>
                </div>
            </div>
            <div className="flex justify-between p-2 py-4 border-b">
                <div>
                    <div className="font-bold mb-2">SMS 수신</div>
                    <div className="text-xs text-gray-400 font-bold">이벤트 및 혜택정보 이메일 수신 허용</div>
                </div>
                <div className="flex_center">
                    <ToggleButton checked={SMS} onChange={(e: any) => setSMS(e.target.checked)}/>
                </div>
            </div>
            <div className="flex justify-between p-2 py-4 border-b">
                <div>
                    <div className="font-bold mb-2">이메일 수신</div>
                    <div className="text-xs text-gray-400 font-bold">이벤트 및 혜택정보 이메일 수신 허용</div>
                </div>
                <div className="flex_center">
                    <ToggleButton checked={email} onChange={(e: any) => setEmail(e.target.checked)}/>
                </div>
            </div>
        </div>
    );
};
