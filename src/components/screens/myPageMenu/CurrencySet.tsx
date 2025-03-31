import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";

// 지원할 언어 목록
const LANGUAGES = [
    { code: 'ko', label: 'KRW' },
    { code: 'en', label: 'USD' },
    { code: 'ja', label: 'JPY' },
];

export default function CurrencySet() {
    const {t} = useTranslation();
    const [langCode, setLangCode] = useState('ko');
    const [userCurrency, setUserCurrency] = useState('');

    useEffect(() => {
        setUserCurrency(localStorage.getItem('userCurrency') ?? "");
        console.log('로컬스토리지',localStorage.getItem('userCurrency'));

    }, []);

    return (
        <div className="p-4 md:px-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font_title">{t("통화 설정")}</h2>
                <button
                    type="button"
                    // onClick={}
                    // disabled={}  // 초기 상태이면 비활성화
                    className={`py-2 px-5 text-white text-sm rounded bg-roomi`}
                    // className={`py-2 px-5 text-white text-sm rounded
                    //     ${isInitialState ? 'bg-gray-300 cursor-not-allowed' : 'bg-roomi'}
                    // `}
                >
                    {t('수정')}
                </button>
            </div>

            <div className="flex flex-col space-y-2">
                {/* (2) 나머지 언어 선택 버튼들 */}
                {LANGUAGES.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => setLangCode(lang.code)}
                        className={`px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 
                            ${langCode === lang.code && 'bg-roomi hover:bg-roomi text-white'}
                        `}
                    >
                        {lang.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
