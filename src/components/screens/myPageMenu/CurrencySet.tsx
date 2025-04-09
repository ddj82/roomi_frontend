import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {updateCurrency} from "../../../api/api";

// 지원할 언어 목록
const LANGUAGES = [
    { code: 'KRW', label: 'KRW' },
    { code: 'USD', label: 'USD' },
    { code: 'JPY', label: 'JPY' },
];

export default function CurrencySet() {
    const {t} = useTranslation();
    const [langCode, setLangCode] = useState('');
    const [userCurrency, setUserCurrency] = useState('');

    useEffect(() => {
        setUserCurrency(localStorage.getItem('userCurrency') ?? "");
        setLangCode(localStorage.getItem('userCurrency') ?? "");
    }, []);

    const handleChangeCurrency = async (currency: string) => {
        console.log('currency', currency);
        try {
            const response = await updateCurrency(currency);
            if (response.ok) {
                localStorage.setItem('userCurrency', currency);
                window.location.reload();
            }
        } catch (e) {
            console.error('통화 변경 api 실패:', e);
        }
    };

    return (
        <div className="p-4 md:px-8">
            <div className="flex justify-between items-center mb-4">
                <button
                    type="button"
                    onClick={() => handleChangeCurrency(langCode)}
                    className={`py-2 px-5 text-white text-sm rounded
                    ${langCode === userCurrency
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-roomi hover:bg-roomi'
                    }`}
                    disabled={langCode === userCurrency}  // 초기 상태이면 비활성화
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
