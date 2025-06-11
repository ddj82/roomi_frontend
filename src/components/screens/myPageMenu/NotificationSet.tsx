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

    // 알림 설정 항목 데이터
    const notificationOptions = [
        {
            id: 'push',
            title: '푸시 알림',
            description: '이벤트 및 혜택정보 푸시 알림 수신 허용',
            state: alert,
            setState: setAlert
        },
        {
            id: 'sms',
            title: 'SMS 수신',
            description: '이벤트 및 혜택정보 SMS 수신 허용',
            state: SMS,
            setState: setSMS
        },
        {
            id: 'email',
            title: '이메일 수신',
            description: '이벤트 및 혜택정보 이메일 수신 허용',
            state: email,
            setState: setEmail
        }
    ];

    return (
        <div className="p-4 md:p-6 max-w-md mx-auto">
            {/*<h3 className="text-lg font-bold mb-6">{t('알림 설정')}</h3>*/}

            <div className="space-y-4 mb-8">
                {notificationOptions.map((option) => (
                    <div
                        key={option.id}
                        className="border rounded-lg p-5 bg-white"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h4 className="font-bold mb-1">{t(option.title)}</h4>
                                <p className="text-xs text-gray-500">{t(option.description)}</p>
                            </div>
                            <div className="ml-4">
                                <ToggleButton
                                    checked={option.state}
                                    onChange={(e) => option.setState(e.target.checked)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 수정 버튼 */}
            <div className="mt-8 mb-4">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isInitialState}
                    className={`w-full py-4 text-white text-base font-medium rounded-lg transition-colors
                        ${isInitialState
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-roomi hover:bg-roomi-dark'
                    }`}
                >
                    {t('설정')}
                </button>
            </div>
        </div>
    );
};